"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
import { SkeletonLines } from "@/components/ui/skeleton";
import { EthereumAddress } from "@/components/EthereumAddress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { formatWalletError } from "@/lib/utils";
import { JB_CHAINS, RevnetCoreContracts, revOwnerAbi } from "@bananapus/nana-sdk-core";
import { useBendystrawQuery, useJBContractContext } from "@bananapus/nana-sdk-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Address, isAddress, zeroAddress } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import {
  ChainProjectRow,
  ChainWrite,
  PermissionHoldersDocument,
  chainName,
  permissionHoldersWhere,
  publicClientFor,
  runSequentialWrites,
  v6ContractAddress,
} from "./operatorLib";

// Onchain Safe probe — no Safe transaction-service dependency, just bytecode +
// the two view calls every Safe exposes.
const safeProbeAbi = [
  {
    type: "function",
    name: "getOwners",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address[]" }],
  },
  {
    type: "function",
    name: "getThreshold",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

type AccountRow = ChainProjectRow & {
  operator: Address | null;
  accountType: "EOA" | "Safe multisig" | "Contract" | "Unknown";
  safe: { owners: readonly Address[]; threshold: number } | null;
};

type AccountGroup = {
  key: string;
  operator: Address | null;
  accountType: AccountRow["accountType"];
  safe: AccountRow["safe"];
  rows: AccountRow[];
};

function groupRows(rows: AccountRow[]): AccountGroup[] {
  const groups = new Map<string, AccountGroup>();
  for (const row of rows) {
    const safeKey = row.safe
      ? `${row.safe.threshold}/${[...row.safe.owners]
          .map((o) => o.toLowerCase())
          .sort()
          .join(",")}`
      : "";
    const key = `${row.operator?.toLowerCase() ?? "unknown"}:${row.accountType}:${safeKey}`;
    const group = groups.get(key) ?? {
      key,
      operator: row.operator,
      accountType: row.accountType,
      safe: row.safe,
      rows: [],
    };
    group.rows.push(row);
    groups.set(key, group);
  }
  return [...groups.values()];
}

/**
 * website/-parity renderAccountCard for revnets: the operator on every chain
 * (bendystraw's isRevnetOperator permission holder), its account type (EOA vs
 * Safe via an onchain bytecode + getOwners/getThreshold probe), and the
 * Transfer operator action — REVOwner.setOperatorOf per chain, which only the
 * current operator can call.
 */
export function OperatorAccountCard({
  rows,
  fallbackOperator,
}: {
  rows: ChainProjectRow[];
  /** Server-resolved operator for the page chain (bendystraw fallback). */
  fallbackOperator?: string;
}) {
  const { version } = useJBContractContext();

  const holdersQuery = useBendystrawQuery(
    PermissionHoldersDocument,
    { where: permissionHoldersWhere(rows, version, { isRevnetOperator: true }) },
    { enabled: rows.length > 0 },
  );

  const operatorByChain = useMemo(() => {
    const map = new Map<number, Address>();
    for (const item of holdersQuery.data?.permissionHolders?.items ?? []) {
      if (item.isRevnetOperator && isAddress(item.operator) && !map.has(item.chainId)) {
        map.set(item.chainId, item.operator as Address);
      }
    }
    if (map.size === 0 && fallbackOperator && isAddress(fallbackOperator)) {
      for (const row of rows) map.set(row.chainId, fallbackOperator as Address);
    }
    return map;
  }, [holdersQuery.data, fallbackOperator, rows]);

  const operatorKey = rows
    .map((row) => `${row.chainId}:${operatorByChain.get(row.chainId) ?? ""}`)
    .join(",");

  const accountQuery = useQuery({
    queryKey: ["v6-operator-account-types", operatorKey],
    enabled: !holdersQuery.isLoading,
    staleTime: 30_000,
    queryFn: async (): Promise<AccountRow[]> =>
      Promise.all(
        rows.map(async (row): Promise<AccountRow> => {
          const operator = operatorByChain.get(row.chainId) ?? null;
          if (!operator) return { ...row, operator, accountType: "Unknown", safe: null };
          try {
            const client = publicClientFor(row.chainId);
            const code = await client.getCode({ address: operator }).catch(() => undefined);
            if (!code || code === "0x") {
              return { ...row, operator, accountType: "EOA", safe: null };
            }
            try {
              const [owners, threshold] = await Promise.all([
                client.readContract({
                  address: operator,
                  abi: safeProbeAbi,
                  functionName: "getOwners",
                }),
                client.readContract({
                  address: operator,
                  abi: safeProbeAbi,
                  functionName: "getThreshold",
                }),
              ]);
              return {
                ...row,
                operator,
                accountType: "Safe multisig",
                safe: { owners, threshold: Number(threshold) },
              };
            } catch {
              return { ...row, operator, accountType: "Contract", safe: null };
            }
          } catch {
            return { ...row, operator, accountType: "Unknown", safe: null };
          }
        }),
      ),
  });

  const accountRows = useMemo(() => accountQuery.data ?? [], [accountQuery.data]);
  const groups = useMemo(() => groupRows(accountRows), [accountRows]);
  const known = accountRows.filter((row) => row.operator);
  const differs =
    known.length > 1 &&
    known.some((row) => row.operator!.toLowerCase() !== known[0].operator!.toLowerCase());

  return (
    <div>
      <h3 className="mb-2 text-base font-semibold text-zinc-700">Account</h3>
      <div className="max-w-screen-sm">
        <p className="text-sm text-zinc-500">
          Revnets have no owner. The operator holds only the permissions granted at launch, and can
          pass the role on.
        </p>
        {holdersQuery.isLoading || accountQuery.isLoading ? (
          <SkeletonLines lines={4} className="mt-3" />
        ) : (
          <div className="mt-3 space-y-3">
            {differs ? (
              <div className="border border-amber-300 bg-amber-50 text-amber-800 text-xs p-3 rounded">
                The operator differs by chain. The transfer action below is scoped to each matching
                group so a change cannot silently target the wrong account.
              </div>
            ) : null}
            {groups.map((group) => (
              <div key={group.key} className="bg-melon-50 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  {group.rows.map((row) => (
                    <span
                      key={row.chainId}
                      className="inline-flex items-center gap-1.5 text-sm text-zinc-700"
                    >
                      <ChainLogo chainId={row.chainId} width={16} height={16} />
                      {chainName(row.chainId)}
                    </span>
                  ))}
                </div>
                <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[7rem_1fr]">
                  <dt className="text-zinc-500">Operator</dt>
                  <dd>
                    {group.operator ? (
                      <EthereumAddress
                        address={group.operator}
                        short
                        withEnsName
                        chain={JB_CHAINS[group.rows[0].chainId]?.chain}
                      />
                    ) : (
                      <span className="text-zinc-400">Unknown</span>
                    )}
                  </dd>
                  <dt className="text-zinc-500">Type</dt>
                  <dd>{group.accountType}</dd>
                  {group.safe ? (
                    <>
                      <dt className="text-zinc-500">Policy</dt>
                      <dd>
                        Requires {group.safe.threshold} of {group.safe.owners.length} signatures
                      </dd>
                      <dt className="text-zinc-500">Signers</dt>
                      <dd className="flex flex-wrap gap-x-3 gap-y-1">
                        {group.safe.owners.map((owner) => (
                          <EthereumAddress
                            key={owner}
                            address={owner}
                            short
                            withEnsName
                            chain={JB_CHAINS[group.rows[0].chainId]?.chain}
                          />
                        ))}
                      </dd>
                    </>
                  ) : null}
                </dl>
                {group.operator ? (
                  <TransferOperatorFlow
                    group={group}
                    onDone={() => {
                      holdersQuery.refetch();
                      accountQuery.refetch();
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TransferOperatorFlow({ group, onDone }: { group: AccountGroup; onDone: () => void }) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCurrentOperator =
    !!address && !!group.operator && address.toLowerCase() === group.operator.toLowerCase();
  const relinquishing = destination.trim().toLowerCase() === zeroAddress;

  const submit = async () => {
    if (busy || !address) return;
    const to = destination.trim();
    if (!isAddress(to)) {
      setError("Enter a valid destination address.");
      return;
    }
    if (!ack) return;
    setBusy(true);
    setError(null);
    try {
      const writes: ChainWrite[] = group.rows.map((row) => {
        const target = v6ContractAddress(RevnetCoreContracts.REVOwner, row.chainId);
        if (!target) throw new Error(`REVOwner isn't deployed on ${chainName(row.chainId)}.`);
        return {
          chainId: row.chainId,
          address: target,
          abi: revOwnerAbi,
          functionName: "setOperatorOf",
          args: [BigInt(row.projectId), to as Address],
        };
      });
      const done = await runSequentialWrites({
        writes,
        account: address,
        writeContractAsync,
        onProgress: setStatus,
      });
      setStatus(`Operator transferred on ${done} chain${done === 1 ? "" : "s"}.`);
      toast({ title: "Operator transferred" });
      setOpen(false);
      onDone();
    } catch (e) {
      const message = formatWalletError(e) || "Could not transfer the operator.";
      setError(message);
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <Button
        variant="default"
        size="sm"
        className="mt-3"
        onClick={() => {
          setOpen(true);
          setStatus(null);
          setError(null);
        }}
      >
        Transfer operator
      </Button>
    );
  }

  return (
    <div className="mt-3 bg-melon-100 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Transfer operator</p>
        <button
          type="button"
          className="text-xs text-zinc-500 hover:text-zinc-800"
          onClick={() => setOpen(false)}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
      {!isCurrentOperator ? (
        <p className="text-xs text-amber-700 mt-2">
          Only the current operator ({group.operator}) can transfer this role — connect that account
          to proceed. The transaction is simulated first and will not send otherwise.
        </p>
      ) : null}
      <div className="mt-2">
        <Input
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value);
            setError(null);
          }}
          disabled={busy}
          placeholder="0x… new operator (zero address relinquishes)"
          aria-label="New operator"
        />
      </div>
      <p className="text-xs text-zinc-500 mt-1">
        Applies on {group.rows.map((row) => chainName(row.chainId)).join(", ")}.
      </p>
      <label className="mt-3 flex items-start gap-2 border border-red-300 bg-red-50 rounded p-3">
        <input
          type="checkbox"
          checked={ack}
          disabled={busy}
          onChange={(e) => setAck(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-xs text-red-700">
          {relinquishing
            ? "I understand that relinquishing the operator role is permanent."
            : "I verified the new operator. They receive every power attached to this role."}
        </span>
      </label>
      <ButtonWithWallet
        targetChainId={group.rows[0]?.chainId}
        connectWalletText="Connect wallet to transfer"
        size="sm"
        className="mt-3"
        loading={busy}
        disabled={busy || !ack || !destination.trim()}
        onClick={submit}
      >
        Transfer operator
      </ButtonWithWallet>
      {status ? <p className="text-xs text-zinc-500 mt-2">{status}</p> : null}
      {error ? <p className="text-xs text-red-600 mt-2">{error}</p> : null}
    </div>
  );
}
