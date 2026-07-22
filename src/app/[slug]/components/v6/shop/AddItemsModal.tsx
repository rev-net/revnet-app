"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cidFromIpfsUri } from "@/lib/ipfs";
import { JBChainId, jb721TiersHookAbi } from "@bananapus/nana-sdk-core";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Address, Hex, isAddress, parseUnits, PublicClient, zeroAddress } from "viem";
import { useAccount, useConfig, usePublicClient, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { encodeIpfsCid, ShopInventory, TIER_UNLIMITED_SUPPLY } from "./shopLib";

interface DraftItem {
  /** ipfs:// URI (or bare CIDv0) of the item's metadata JSON. Optional. */
  uri: string;
  price: string;
  /** Empty = unlimited. */
  supply: string;
  category: string;
  reserveFrequency: string;
  reserveBeneficiary: string;
}

function newDraftItem(): DraftItem {
  return { uri: "", price: "", supply: "", category: "0", reserveFrequency: "", reserveBeneficiary: "" };
}

const MAX_UINT104 = (1n << 104n) - 1n;
const ZERO_BYTES32 = `0x${"0".repeat(64)}` as Hex;

type TierConfig = {
  price: bigint;
  initialSupply: number;
  votingUnits: number;
  reserveFrequency: number;
  reserveBeneficiary: Address;
  encodedIpfsUri: Hex;
  category: number;
  discountPercent: number;
  flags: {
    allowOwnerMint: boolean;
    useReserveBeneficiaryAsDefault: boolean;
    transfersPausable: boolean;
    useVotingUnits: boolean;
    cantBeRemoved: boolean;
    cantIncreaseDiscountPercent: boolean;
    cantBuyWithCredits: boolean;
  };
  splitPercent: number;
  splits: never[];
};

/**
 * Validate the drafts and build the `adjustTiers` tier configs.
 *
 * Two order-sensitive store rules are handled here:
 * - tiers must be sorted by ascending category (`InvalidCategorySortOrder`);
 * - `recordAddTiers` validates each tier strictly IN ARRAY ORDER, so a tier
 *   with `reserveFrequency > 0` and no beneficiary reverts with
 *   `MissingReserveBeneficiary` unless a default was set BEFORE it. We avoid
 *   the trap at the root by requiring an explicit per-tier beneficiary for
 *   every reserved tier (`useReserveBeneficiaryAsDefault` stays false).
 */
function buildTierConfigs(items: DraftItem[], decimals: number): TierConfig[] | string {
  const configs: TierConfig[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const label = items.length > 1 ? `Item ${i + 1}: ` : "";

    let price: bigint;
    try {
      price = parseUnits(item.price.trim(), decimals);
    } catch {
      return `${label}enter a valid price.`;
    }
    if (price < 0n || price > MAX_UINT104) return `${label}the price must fit uint104.`;

    const supplyStr = item.supply.trim();
    if (supplyStr !== "" && !/^\d+$/.test(supplyStr)) {
      return `${label}the supply must be a whole number (or empty for unlimited).`;
    }
    const initialSupply = supplyStr === "" ? TIER_UNLIMITED_SUPPLY : Number(supplyStr);
    if (initialSupply <= 0 || initialSupply > TIER_UNLIMITED_SUPPLY) {
      return `${label}the supply must be between 1 and ${TIER_UNLIMITED_SUPPLY.toLocaleString("en-US")}, or empty for unlimited.`;
    }

    const categoryStr = item.category.trim() || "0";
    if (!/^\d+$/.test(categoryStr) || Number(categoryStr) > 0xffffff) {
      return `${label}the category must be a number that fits uint24.`;
    }
    const category = Number(categoryStr);

    const reserveStr = item.reserveFrequency.trim() || "0";
    if (!/^\d+$/.test(reserveStr) || Number(reserveStr) > 0xffff) {
      return `${label}the reserve frequency must fit uint16.`;
    }
    const reserveFrequency = Number(reserveStr);
    let reserveBeneficiary: Address = zeroAddress;
    if (reserveFrequency > 0) {
      if (initialSupply === 1) {
        return `${label}a reserved item needs a supply of at least 2 (or unlimited).`;
      }
      if (!isAddress(item.reserveBeneficiary.trim())) {
        return `${label}enter a reserve beneficiary address (required when a reserve frequency is set).`;
      }
      reserveBeneficiary = item.reserveBeneficiary.trim() as Address;
    }

    let encodedIpfsUri: Hex = ZERO_BYTES32;
    const uri = item.uri.trim();
    if (uri) {
      const cid = uri.startsWith("ipfs://") ? cidFromIpfsUri(uri) : uri;
      // Only CIDv0 (Qm…, a 32-byte sha2-256 digest) packs into bytes32 onchain.
      if (!cid || !/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid)) {
        return `${label}the media URI must be an ipfs:// URI with a CIDv0 (Qm…) hash.`;
      }
      try {
        encodedIpfsUri = encodeIpfsCid(cid);
      } catch {
        return `${label}could not encode the IPFS CID.`;
      }
    }

    configs.push({
      price,
      initialSupply,
      votingUnits: 0,
      reserveFrequency,
      reserveBeneficiary,
      encodedIpfsUri,
      category,
      discountPercent: 0,
      flags: {
        allowOwnerMint: false,
        useReserveBeneficiaryAsDefault: false,
        transfersPausable: false,
        useVotingUnits: false,
        cantBeRemoved: false,
        cantIncreaseDiscountPercent: false,
        cantBuyWithCredits: false,
      },
      splitPercent: 0,
      splits: [],
    });
  }
  // The store reverts InvalidCategorySortOrder unless categories ascend.
  return configs.sort((a, b) => a.category - b.category);
}

/**
 * Operator "+ Add items" (website/ openAddTierModal + submitAddTiers parity):
 * stage items → simulate `adjustTiers` on the 721 hook → send. Simulation runs
 * first on every submit so a would-revert call never reaches the wallet.
 */
export function AddItemsModal({
  shop,
  chainId,
  projectId,
  onClose,
}: {
  shop: ShopInventory;
  chainId: JBChainId;
  projectId: bigint;
  onClose: () => void;
}) {
  const config = useConfig();
  const queryClient = useQueryClient();
  const publicClient = usePublicClient({ chainId });
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [items, setItems] = useState<DraftItem[]>([newDraftItem()]);
  const [phase, setPhase] = useState<"form" | "simulating" | "sending" | "confirming" | "done">(
    "form",
  );
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const busy = phase === "simulating" || phase === "sending" || phase === "confirming";

  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setError(null);
  };

  const submit = async () => {
    if (!address || !publicClient || busy) return;
    setError(null);

    const configs = buildTierConfigs(items, shop.pricing.decimals);
    if (typeof configs === "string") {
      setError(configs);
      return;
    }

    try {
      // Simulate first — a revert (missing ADJUST_721_TIERS permission, bad
      // ordering, hook paused…) surfaces here instead of costing gas.
      setPhase("simulating");
      const { request } = await (publicClient as PublicClient).simulateContract({
        address: shop.hook,
        abi: jb721TiersHookAbi,
        functionName: "adjustTiers",
        args: [configs, []],
        account: address,
      });

      setPhase("sending");
      // The simulated request is the exact call — wagmi's union type just
      // can't carry the tuple inference across the runtime chain.
      const hash = await writeContractAsync(request as never);
      setTxHash(hash);

      setPhase("confirming");
      const receipt = await waitForTransactionReceipt(config, { chainId, hash });
      if (receipt.status !== "success") throw new Error("The transaction failed.");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["v6Shop721", chainId, projectId.toString()] }),
        queryClient.invalidateQueries({ queryKey: ["v6PayShop", chainId, projectId.toString()] }),
        queryClient.invalidateQueries({ queryKey: ["v6Shop721Media", chainId, shop.hook] }),
      ]);
      setPhase("done");
    } catch (err) {
      setPhase("form");
      setError(shortError(err));
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add items for sale</DialogTitle>
          <DialogDescription>
            Stage one or more items, then add them to the shop with a single{" "}
            <span className="font-mono text-xs">adjustTiers</span> transaction (operator only).
          </DialogDescription>
        </DialogHeader>

        {phase === "done" ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-zinc-900">
              {items.length} item{items.length === 1 ? "" : "s"} added.
            </p>
            {txHash ? (
              <p className="mt-1 break-all font-mono text-xs text-zinc-500">{txHash}</p>
            ) : null}
            <Button className="mt-4" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-5">
              {items.map((item, index) => (
                <div key={index} className="border border-zinc-200 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Item {index + 1}
                    </span>
                    {items.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                        disabled={busy}
                        className="text-xs text-zinc-400 hover:text-zinc-700"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Price ({shop.pricing.symbol})</Label>
                      <Input
                        value={item.price}
                        onChange={(e) => updateItem(index, { price: e.target.value })}
                        placeholder="0.01"
                        disabled={busy}
                        className="mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Supply (empty = unlimited)</Label>
                      <Input
                        value={item.supply}
                        onChange={(e) => updateItem(index, { supply: e.target.value })}
                        placeholder="Unlimited"
                        disabled={busy}
                        className="mt-1 h-9"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Media / metadata IPFS URI</Label>
                      <Input
                        value={item.uri}
                        onChange={(e) => updateItem(index, { uri: e.target.value })}
                        placeholder="ipfs://Qm… (metadata JSON with name + image)"
                        disabled={busy}
                        className="mt-1 h-9"
                      />
                      <p className="mt-1 text-[11px] text-zinc-500">
                        A pinned JSON file with <span className="font-mono">name</span>,{" "}
                        <span className="font-mono">description</span> and{" "}
                        <span className="font-mono">image</span>. CIDv0 (Qm…) only — it&apos;s
                        stored onchain as bytes32.
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Input
                        value={item.category}
                        onChange={(e) => updateItem(index, { category: e.target.value })}
                        placeholder="0"
                        disabled={busy}
                        className="mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Reserve frequency</Label>
                      <Input
                        value={item.reserveFrequency}
                        onChange={(e) => updateItem(index, { reserveFrequency: e.target.value })}
                        placeholder="0 (none)"
                        disabled={busy}
                        className="mt-1 h-9"
                      />
                      <p className="mt-1 text-[11px] text-zinc-500">
                        1 of every N sold is minted to the beneficiary.
                      </p>
                    </div>
                    {item.reserveFrequency.trim() !== "" &&
                    item.reserveFrequency.trim() !== "0" ? (
                      <div className="col-span-2">
                        <Label className="text-xs">Reserve beneficiary</Label>
                        <Input
                          value={item.reserveBeneficiary}
                          onChange={(e) =>
                            updateItem(index, { reserveBeneficiary: e.target.value })
                          }
                          placeholder="0x…"
                          disabled={busy}
                          className="mt-1 h-9 font-mono"
                        />
                        <p className="mt-1 text-[11px] text-zinc-500">
                          Required — reserved tiers without their own beneficiary revert unless a
                          default was set earlier in the batch.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setItems((current) => [...current, newDraftItem()])}
                disabled={busy}
                className="self-start text-sm text-zinc-500 hover:text-zinc-800"
              >
                + Add another item
              </button>
            </div>

            {error ? (
              <p role="alert" className="bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={busy}>
                Cancel
              </Button>
              <ButtonWithWallet
                targetChainId={chainId}
                loading={busy}
                onClick={() => void submit()}
              >
                {phase === "simulating"
                  ? "Simulating…"
                  : phase === "sending"
                    ? "Confirm in wallet…"
                    : phase === "confirming"
                      ? "Confirming…"
                      : "Add items"}
              </ButtonWithWallet>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function shortError(error: unknown): string {
  if (error && typeof error === "object") {
    const err = error as { shortMessage?: string; message?: string };
    return err.shortMessage || err.message || "Could not add the items.";
  }
  return "Could not add the items.";
}
