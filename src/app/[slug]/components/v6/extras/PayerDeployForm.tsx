"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { formatWalletError } from "@/lib/utils";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { JB_CHAINS, JBChainId } from "@bananapus/nana-sdk-core";
import { getAccount, getPublicClient } from "@wagmi/core";
import { useMemo, useState } from "react";
import { Address, isAddress, parseEventLogs, PublicClient, zeroAddress } from "viem";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import {
  ChainProjectRow,
  PayerRow,
  PROJECT_PAYER_CHAIN_IDS,
  PROJECT_PAYER_DEPLOYER,
  projectPayerDeployerAbi,
} from "./projectPayers";

type DeployedPayer = { chainId: JBChainId; payer: Address | null; txHash: `0x${string}` };

type ReviewedDeploy = {
  /** One frozen call per selected chain — what's reviewed is what's sent. */
  calls: {
    chainId: JBChainId;
    projectId: number;
    args: readonly [bigint, Address, string, `0x${string}`, boolean, Address];
  }[];
  addToBalance: boolean;
  memo: string;
  /** The account the review was made for. */
  account: Address;
};

const HEX_BYTES = /^0x([0-9a-fA-F]{2})*$/;

function resolveAddressInput(raw: string): Address | null {
  const trimmed = raw.trim();
  return isAddress(trimmed) ? (trimmed as Address) : null;
}

/**
 * website/-parity renderExtrasSection: deploy a JBProjectPayer so plain ETH
 * transfers to a dedicated address pay the project. Permissionless; defaults
 * match the website — Pay behavior, zero beneficiary (the original payer gets
 * the tokens), zero admin (immutable settings), 0x metadata. Multi-chain
 * deploys run as sequential simulate-first transactions per selected chain.
 */
export function PayerDeployForm({
  rows,
  existingRows,
  onDeployed,
}: {
  rows: ChainProjectRow[];
  existingRows: PayerRow[];
  onDeployed: () => void;
}) {
  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const deployableRows = useMemo(
    () => rows.filter((row) => PROJECT_PAYER_CHAIN_IDS.has(row.chainId)),
    [rows],
  );

  const [addToBalance, setAddToBalance] = useState(false);
  const [originalPayer, setOriginalPayer] = useState(true);
  const [beneficiary, setBeneficiary] = useState("");
  const [beneficiaryByChain, setBeneficiaryByChain] = useState<Record<number, string>>({});
  const [memo, setMemo] = useState("");
  const [editable, setEditable] = useState(false);
  const [admin, setAdmin] = useState("");
  const [adminByChain, setAdminByChain] = useState<Record<number, string>>({});
  const [metadata, setMetadata] = useState("0x");
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(deployableRows.map((row) => row.chainId)),
  );

  const [review, setReview] = useState<ReviewedDeploy | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deployed, setDeployed] = useState<DeployedPayer[]>([]);

  const invalidate = () => {
    setReview(null);
    setError(null);
  };

  const selectedRows = deployableRows.filter((row) => selected.has(row.chainId));

  // Surface identical already-deployed payers so nobody redeploys one they
  // could just reuse — matching behavior + beneficiary on a selected chain.
  const duplicates = useMemo(() => {
    const formBeneficiary = originalPayer ? "" : beneficiary.trim().toLowerCase();
    if (!originalPayer && !isAddress(formBeneficiary)) return [];
    return existingRows.filter((row) => {
      if (!selected.has(Number(row.chainId))) return false;
      if (Boolean(row.defaultAddToBalance) !== addToBalance) return false;
      const rowBeneficiary =
        row.defaultBeneficiary && row.defaultBeneficiary.toLowerCase() !== zeroAddress
          ? row.defaultBeneficiary.toLowerCase()
          : "";
      return rowBeneficiary === formBeneficiary;
    });
  }, [existingRows, selected, addToBalance, originalPayer, beneficiary]);

  const buildReview = () => {
    setError(null);
    if (!address) return;
    if (!selectedRows.length) {
      setError("Select at least one chain.");
      return;
    }
    const trimmedMetadata = metadata.trim() || "0x";
    if (!HEX_BYTES.test(trimmedMetadata)) {
      setError("Metadata must be even-length hex bytes (or 0x).");
      return;
    }
    const calls: ReviewedDeploy["calls"] = [];
    for (const row of selectedRows) {
      const chainName = JB_CHAINS[row.chainId]?.name ?? row.chainId;
      let beneficiaryAddress: Address = zeroAddress;
      if (!originalPayer) {
        const raw = beneficiaryByChain[row.chainId]?.trim() || beneficiary;
        const resolved = resolveAddressInput(raw);
        if (!resolved) {
          setError(`Enter a valid beneficiary address for ${chainName}.`);
          return;
        }
        beneficiaryAddress = resolved;
      }
      let owner: Address = zeroAddress;
      if (editable) {
        const raw = adminByChain[row.chainId]?.trim() || admin.trim() || address;
        const resolved = resolveAddressInput(raw);
        if (!resolved || resolved === zeroAddress) {
          setError(`Editable payer addresses need a nonzero address admin on ${chainName}.`);
          return;
        }
        owner = resolved;
      }
      calls.push({
        chainId: row.chainId,
        projectId: row.projectId,
        args: [
          BigInt(row.projectId),
          beneficiaryAddress,
          memo.trim(),
          trimmedMetadata as `0x${string}`,
          addToBalance,
          owner,
        ],
      });
    }
    setReview({ calls, addToBalance, memo: memo.trim(), account: address });
  };

  const submitDeploys = async () => {
    if (!review || busy || !address) return;
    if (address.toLowerCase() !== review.account.toLowerCase()) {
      setReview(null);
      setError("Your connected account changed — review the deploy again.");
      return;
    }
    setBusy(true);
    setError(null);
    setDeployed([]);
    const results: DeployedPayer[] = [];
    try {
      for (const call of review.calls) {
        const chainName = JB_CHAINS[call.chainId]?.name ?? call.chainId;
        // Read the LIVE wallet chain — the hook value is stale inside this
        // loop once the first switch lands.
        if (getAccount(wagmiConfig).chainId !== call.chainId) {
          setStatus(`Switch your wallet to ${chainName}…`);
          await switchChainAsync({ chainId: call.chainId });
        }
        // Plain viem PublicClient: wagmi's per-chain client union trips TS2590
        // on simulateContract's generics.
        const client = getPublicClient(wagmiConfig, {
          chainId: call.chainId,
        }) as unknown as PublicClient;
        setStatus(`Simulating the deploy on ${chainName}…`);
        await client.simulateContract({
          account: address,
          address: PROJECT_PAYER_DEPLOYER,
          abi: projectPayerDeployerAbi,
          functionName: "deployProjectPayer",
          args: call.args,
        });
        setStatus(`Confirm the deploy on ${chainName} in your wallet…`);
        const txHash = await writeContractAsync({
          chainId: call.chainId,
          address: PROJECT_PAYER_DEPLOYER,
          abi: projectPayerDeployerAbi,
          functionName: "deployProjectPayer",
          args: call.args,
        });
        setStatus(`Waiting for confirmation on ${chainName}…`);
        const receipt = await client.waitForTransactionReceipt({ hash: txHash });
        // The new payer address comes from the DeployProjectPayer event — the
        // function's return value isn't available from a transaction.
        let payer: Address | null = null;
        try {
          const logs = parseEventLogs({
            abi: projectPayerDeployerAbi,
            eventName: "DeployProjectPayer",
            logs: receipt.logs,
          });
          payer = logs[0]?.args.projectPayer ?? null;
        } catch {
          payer = null;
        }
        results.push({ chainId: call.chainId, payer, txHash });
        setDeployed([...results]);
      }
      setStatus(
        `Payer address deployment complete on ${review.calls.length} chain${
          review.calls.length === 1 ? "" : "s"
        }.`,
      );
      setReview(null);
      toast({
        title: "Payer address deployed",
        description: "Send ETH to it to pay this project.",
      });
      setTimeout(onDeployed, 5000); // give the indexer time to catch up
    } catch (e) {
      const message = formatWalletError(e) || "Could not deploy the payer address.";
      setStatus(
        results.length
          ? `Deployed on ${results.length} of ${review.calls.length} chains before failing.`
          : null,
      );
      setError(message);
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setBusy(false);
    }
  };

  if (!deployableRows.length) {
    return (
      <div className="text-sm text-zinc-500">
        Payer addresses aren&apos;t available on this project&apos;s chains — the deployer contract
        isn&apos;t there.
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="pb-10">
        <div>
          <h4 className="text-md font-semibold">1. Payment behavior</h4>
          <p className="mt-3 text-sm text-zinc-500">
            Choose what an incoming ETH transfer does and who receives newly issued tokens.
          </p>
        </div>
        <div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Behavior</label>
            <Select
              value={addToBalance ? "balance" : "pay"}
              onValueChange={(value) => {
                setAddToBalance(value === "balance");
                invalidate();
              }}
              disabled={busy}
            >
              <SelectTrigger className="w-full border-melon-300 bg-melon-25 sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pay">Pay</SelectItem>
                <SelectItem value="balance">Add to balance</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500 mt-1">
              {addToBalance
                ? "Adds funds to the project without minting tokens."
                : "Pays the project and mints its tokens to the beneficiary."}
            </p>
          </div>

          {!addToBalance ? (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Token beneficiary</label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={originalPayer}
                  disabled={busy}
                  onChange={(e) => {
                    setOriginalPayer(e.target.checked);
                    invalidate();
                  }}
                />
                Original payer
              </label>
              {!originalPayer ? (
                <div className="mt-2">
                  <Input
                    className="border-melon-300 bg-melon-25"
                    value={beneficiary}
                    onChange={(e) => {
                      setBeneficiary(e.target.value);
                      invalidate();
                    }}
                    disabled={busy}
                    placeholder="0x… fixed beneficiary"
                    aria-label="Default beneficiary"
                  />
                  <PerChainOverrides
                    label="beneficiary"
                    rows={selectedRows}
                    values={beneficiaryByChain}
                    fallback={beneficiary}
                    disabled={busy}
                    onChange={(next) => {
                      setBeneficiaryByChain(next);
                      invalidate();
                    }}
                  />
                </div>
              ) : (
                <p className="text-xs text-zinc-500 mt-1">
                  Whoever sends the ETH receives the project&apos;s tokens.
                </p>
              )}
            </div>
          ) : null}

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Default memo</label>
            <Input
              className="border-melon-300 bg-melon-25"
              value={memo}
              onChange={(e) => {
                setMemo(e.target.value.slice(0, 256));
                invalidate();
              }}
              disabled={busy}
              placeholder="optional memo attached to payments"
              aria-label="Default memo"
            />
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div>
          <h4 className="text-md font-semibold">2. Address control</h4>
          <p className="mt-3 text-sm text-zinc-500">
            Keep the payer immutable, or assign an admin and optional terminal metadata.
          </p>
        </div>
        <div>
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={editable}
                disabled={busy}
                onChange={(e) => {
                  setEditable(e.target.checked);
                  if (e.target.checked && !admin && address) setAdmin(address);
                  invalidate();
                }}
              />
              Editable
            </label>
            {editable ? (
              <div className="mt-2">
                <Input
                  className="border-melon-300 bg-melon-25"
                  value={admin}
                  onChange={(e) => {
                    setAdmin(e.target.value);
                    invalidate();
                  }}
                  disabled={busy}
                  placeholder="0x… address admin"
                  aria-label="Address admin"
                />
                <PerChainOverrides
                  label="address admin"
                  rows={selectedRows}
                  values={adminByChain}
                  fallback={admin}
                  disabled={busy}
                  onChange={(next) => {
                    setAdminByChain(next);
                    invalidate();
                  }}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  The address admin can later change this payer address&apos;s destination project,
                  Pay/Add to balance behavior, beneficiary, memo, and metadata, or transfer or
                  renounce the admin role. The role does not receive payments or control either
                  project.
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 mt-1">
                Off by default: no address admin. The settings above are permanent once deployed.
              </p>
            )}
          </div>

          <details className="mt-4">
            <summary className="text-sm text-zinc-500 cursor-pointer">Extra options</summary>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Default metadata</label>
              <Input
                className="border-melon-300 bg-melon-25"
                value={metadata}
                onChange={(e) => {
                  setMetadata(e.target.value);
                  invalidate();
                }}
                disabled={busy}
                placeholder="0x"
                spellCheck={false}
                aria-label="Default metadata"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Hex bytes forwarded to pay/addToBalance. Leave 0x unless you need custom terminal
                metadata.
              </p>
            </div>
          </details>
        </div>
      </section>

      <section>
        <div>
          <h4 className="text-md font-semibold">3. Deployment</h4>
          <p className="mt-3 text-sm text-zinc-500">
            Select the chains, review the configuration, then deploy the payer addresses.
          </p>
        </div>
        <div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Deploy on</label>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {deployableRows.map((row) => (
                <label key={row.chainId} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.has(row.chainId)}
                    disabled={busy}
                    onChange={(e) => {
                      setSelected((current) => {
                        const next = new Set(current);
                        if (e.target.checked) next.add(row.chainId);
                        else next.delete(row.chainId);
                        return next;
                      });
                      invalidate();
                    }}
                  />
                  <ChainLogo chainId={row.chainId} width={16} height={16} />
                  {JB_CHAINS[row.chainId]?.name ?? row.chainId}
                </label>
              ))}
            </div>
          </div>

          {duplicates.length > 0 ? (
            <div className="mt-4 border border-amber-300 bg-amber-50 text-amber-800 text-xs p-3 rounded">
              This project already has a payer address with these settings:{" "}
              {duplicates
                .map(
                  (row) =>
                    `${JB_CHAINS[row.chainId as JBChainId]?.name ?? row.chainId} ${row.address.slice(0, 6)}…${row.address.slice(-4)}`,
                )
                .join(", ")}
              . Anyone can pay it directly — deploying again creates another address that behaves
              the same.
            </div>
          ) : null}

          {review ? (
            <div className="mt-4 border border-zinc-200 bg-zinc-50 text-xs p-3 rounded space-y-1">
              <p>
                Deploys a payer address on{" "}
                {review.calls.map((c) => JB_CHAINS[c.chainId]?.name ?? c.chainId).join(", ")} that{" "}
                {review.addToBalance
                  ? "adds every ETH transfer to the project balance without minting tokens"
                  : "pays the project with every ETH transfer"}
                .
              </p>
              {review.calls.map((call) => (
                <p key={call.chainId} className="font-mono break-all">
                  {JB_CHAINS[call.chainId]?.name ?? call.chainId}: project #{call.projectId}
                  {!review.addToBalance
                    ? ` · tokens to ${call.args[1] === zeroAddress ? "the sender" : call.args[1]}`
                    : ""}
                  {` · admin ${call.args[5] === zeroAddress ? "none (immutable)" : call.args[5]}`}
                </p>
              ))}
              {review.memo ? <p>Memo: {review.memo}</p> : null}
            </div>
          ) : null}

          <div className="mt-4">
            <ButtonWithWallet
              targetChainId={review?.calls[0]?.chainId ?? selectedRows[0]?.chainId}
              connectWalletText="Connect wallet to deploy"
              loading={busy}
              disabled={busy || selectedRows.length === 0}
              onClick={review ? submitDeploys : buildReview}
            >
              {review
                ? `Deploy payer address${review.calls.length > 1 ? "es" : ""}`
                : "Review deploy"}
            </ButtonWithWallet>
          </div>

          {status ? <p className="text-xs text-zinc-500 mt-2">{status}</p> : null}
          {error ? <p className="text-xs text-red-600 mt-2">{error}</p> : null}

          {deployed.length > 0 ? (
            <div className="mt-4 border border-zinc-200 p-3 rounded">
              <p className="text-sm font-medium">
                Send ETH to {deployed.length === 1 ? "this address" : "these addresses"} to pay the
                project:
              </p>
              <div className="mt-2 space-y-1">
                {deployed.map((result) => (
                  <div key={result.chainId} className="flex items-center gap-2 text-sm">
                    <ChainLogo chainId={result.chainId} width={16} height={16} />
                    {result.payer ? (
                      <>
                        <code className="font-mono text-xs break-all">{result.payer}</code>
                        <CopyButton value={result.payer} />
                      </>
                    ) : (
                      <span className="text-zinc-500 text-xs">
                        Deployed — see the transaction on the explorer.
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function PerChainOverrides({
  label,
  rows,
  values,
  fallback,
  disabled,
  onChange,
}: {
  label: string;
  rows: ChainProjectRow[];
  values: Record<number, string>;
  fallback: string;
  disabled: boolean;
  onChange: (next: Record<number, string>) => void;
}) {
  if (rows.length <= 1) return null;
  return (
    <details className="mt-2">
      <summary className="text-xs text-zinc-500 cursor-pointer">Set the {label} per chain</summary>
      <div className="mt-2 space-y-2">
        {rows.map((row) => (
          <div key={row.chainId} className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs w-36 shrink-0">
              <ChainLogo chainId={row.chainId} width={14} height={14} />
              {JB_CHAINS[row.chainId]?.name ?? row.chainId}
            </span>
            <Input
              className="h-8 border-melon-300 bg-melon-25 text-xs"
              value={values[row.chainId] ?? ""}
              onChange={(e) => onChange({ ...values, [row.chainId]: e.target.value })}
              disabled={disabled}
              placeholder={fallback || "0x…"}
            />
          </div>
        ))}
      </div>
    </details>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-6 px-2 text-[11px]"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
