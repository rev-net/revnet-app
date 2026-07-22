"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { TableSkeleton } from "@/components/loading/LoadingSkeletons";
import { ChainLogo } from "@/components/ChainLogo";
import { EthereumAddress } from "@/components/EthereumAddress";
import { toast } from "@/components/ui/use-toast";
import { formatWalletError } from "@/lib/utils";
import {
  buildV6ClaimTxFromRow,
  fetchV6BridgeRows,
  findToRemoteValue,
  V6BridgeRow,
} from "@/lib/v6/suckerProofs";
import { jbSuckerV6Abi } from "@bananapus/nana-sdk-core/v6";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import {
  bridgeEtaHint,
  bridgeTrackUrl,
  ChainProject,
  chainName,
  chainProjectsKey,
  fmtUnits,
  timeAgo,
  tokenSymbolOf,
  viemChainOf,
} from "./lib";

type Filter = "all" | "pending" | "claimable";

function StatusBadge({ status }: { status: V6BridgeRow["status"] }) {
  const styles =
    status === "claimable"
      ? "bg-teal-50 text-teal-700 border-teal-200"
      : status === "pending"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-zinc-100 text-zinc-500 border-zinc-200";
  return (
    <span className={`inline-block border px-1.5 py-0.5 text-xs uppercase tracking-wide ${styles}`}>
      {status}
    </span>
  );
}

/**
 * Claim runs on the DESTINATION chain against the peer sucker, with the locally
 * reconstructed + verified merkle proof. Simulate-first so a revert surfaces as
 * a readable error before the wallet prompt.
 */
function ClaimButton({ row, onDone }: { row: V6BridgeRow; onDone: () => void }) {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: row.peerChainId });
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);

  return (
    <ButtonWithWallet
      targetChainId={row.peerChainId}
      size="sm"
      variant="outline"
      forceChildren
      loading={busy}
      onClick={async () => {
        try {
          setBusy(true);
          const tx = buildV6ClaimTxFromRow(row);
          await publicClient?.simulateContract({ account: address, ...tx });
          await writeContractAsync(tx);
          toast({
            title: "Claimed",
            description: `Tokens claimed on ${chainName(row.peerChainId)}.`,
          });
          onDone();
        } catch (error) {
          console.error(error);
          toast({ variant: "destructive", title: "Claim failed", description: formatWalletError(error) });
        } finally {
          setBusy(false);
        }
      }}
    >
      Claim
    </ButtonWithWallet>
  );
}

/**
 * Execute ships the source sucker's queued outbox to the destination in one
 * bridge message (permissionless; it delivers every queued move for that token,
 * not just this row). The exact msg.value comes from findToRemoteValue — when no
 * budget can be verified the button explains instead of prompting a reverting tx.
 */
function ExecuteButton({ row, onDone }: { row: V6BridgeRow; onDone: () => void }) {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: row.chainId });
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);
  const [feeUnavailable, setFeeUnavailable] = useState(false);

  if (feeUnavailable) {
    return (
      <span
        className="text-xs text-zinc-400"
        title="The bridge messaging fee could not be verified by simulation — executing now would revert. Try again shortly."
      >
        Fee unavailable
      </span>
    );
  }

  return (
    <ButtonWithWallet
      targetChainId={row.chainId}
      size="sm"
      variant="outline"
      forceChildren
      loading={busy}
      onClick={async () => {
        try {
          setBusy(true);
          const value = await findToRemoteValue(row.chainId, row.sourceSucker, row.token, address);
          if (value == null) {
            setFeeUnavailable(true);
            throw new Error(
              "Could not determine the bridge messaging fee — no budget simulated cleanly. Try again shortly.",
            );
          }
          await publicClient?.simulateContract({
            account: address,
            address: row.sourceSucker,
            abi: jbSuckerV6Abi,
            functionName: "toRemote",
            args: [row.token],
            value,
          });
          await writeContractAsync({
            chainId: row.chainId,
            address: row.sourceSucker,
            abi: jbSuckerV6Abi,
            functionName: "toRemote",
            args: [row.token],
            value,
          });
          toast({
            title: "Bridge message sent",
            description: `The queued outbox is on its way to ${chainName(row.peerChainId)} — rows flip to claimable once it lands.`,
          });
          onDone();
        } catch (error) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Execute failed",
            description: formatWalletError(error),
          });
        } finally {
          setBusy(false);
        }
      }}
    >
      Execute
    </ButtonWithWallet>
  );
}

function BridgingLink({ row }: { row: V6BridgeRow }) {
  const url = bridgeTrackUrl(row);
  const eta = bridgeEtaHint(row);
  return (
    <span className="text-xs text-zinc-400 whitespace-nowrap">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-600 underline decoration-dotted"
          title={
            row.infra === "ccip"
              ? "Track this message on the CCIP explorer"
              : "Track on the source chain explorer"
          }
        >
          Bridging… ↗
        </a>
      ) : (
        "Bridging…"
      )}
      {eta && <span className="ml-1">~{eta}</span>}
    </span>
  );
}

/**
 * "Queued movements" — every cross-chain token movement still in flight, from
 * locally reconstructed sucker outboxes (verified proofs; no external prover).
 * Claimed leaves drop out — a cleared move lives in the activity feed.
 */
export function QueuedMovementsCard({
  chains,
  tokenSymbol,
}: {
  chains: ChainProject[];
  tokenSymbol: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["v6BridgeRows", chainProjectsKey(chains)],
    enabled: chains.length > 1,
    // In-flight movements flip to claimable on their own once the destination
    // inbox receives the root — keep re-reading so no manual reload is needed.
    refetchInterval: 45_000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const rows = await fetchV6BridgeRows(chains.map((c) => ({ chainId: c.chainId, projectId: c.projectId })));
      const live = rows.filter((r) => r.status !== "claimed");
      // Resolve terminal-token symbols once per (chain, token) for the Value column.
      const symbols = new Map<string, string>();
      await Promise.all(
        live.map(async (r) => {
          const key = `${r.chainId}:${r.token.toLowerCase()}`;
          if (!symbols.has(key)) symbols.set(key, await tokenSymbolOf(r.chainId, r.token));
        }),
      );
      return live.map((r) => ({
        ...r,
        tokenSymbol: symbols.get(`${r.chainId}:${r.token.toLowerCase()}`) ?? "tokens",
      }));
    },
  });

  const rows = data ?? [];
  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const counts = {
    all: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    claimable: rows.filter((r) => r.status === "claimable").length,
  };

  const cellHead = "h-12 px-4 text-left align-middle text-sm font-bold text-zinc-500";
  const cell = "whitespace-nowrap p-4 align-middle text-sm text-zinc-700";

  return (
    <div className="border border-zinc-200 bg-melon-50 p-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-medium text-zinc-900">Queued movements</h3>
        <div className="flex gap-1">
          {(["all", "pending", "claimable"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-xs border ${
                filter === f
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
              }`}
            >
              {f === "all" ? "All" : f === "pending" ? "Pending" : "Claimable"}
              {counts[f] > 0 ? ` (${counts[f]})` : ""}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-zinc-500 mt-1">
        Anything moving between chains shows here until it clears.
      </p>
      <div
        className={visible.length > 0 && !isLoading ? "-mx-4 mt-3 overflow-x-auto" : "mt-3"}
      >
        {isLoading ? (
          <TableSkeleton rows={4} columns={7} />
        ) : isError && rows.length === 0 ? (
          <div className="text-sm text-zinc-500 py-4">Could not load bridge transactions.</div>
        ) : visible.length === 0 ? (
          <div className="text-sm text-zinc-400 py-4">
            No queued movements — anything in flight shows here until it clears.
          </div>
        ) : (
          <table className="w-full min-w-[1040px]">
            <thead className="bg-melon-100">
              <tr className="border-b border-zinc-100">
                <th className={cellHead}>Initiated</th>
                <th className={cellHead}>Chains</th>
                <th className={cellHead}>Beneficiary</th>
                <th className={cellHead}>Tokens</th>
                <th className={cellHead}>Value</th>
                <th className={cellHead}>Status</th>
                <th className={cellHead}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr
                  key={`${row.chainId}:${row.sourceSucker}:${row.token}:${row.index}`}
                  className="border-b border-zinc-50 last:border-b-0"
                >
                  <td className={cell}>{timeAgo(row.createdAt)}</td>
                  <td className={cell}>
                    <span className="inline-flex items-center gap-1">
                      <ChainLogo chainId={row.chainId} width={16} height={16} />
                      <span className="text-zinc-300">→</span>
                      <ChainLogo chainId={row.peerChainId} width={16} height={16} />
                    </span>
                  </td>
                  <td className={cell}>
                    <EthereumAddress
                      address={row.beneficiary}
                      short
                      withEnsName
                      chain={viemChainOf(row.peerChainId)}
                    />
                  </td>
                  <td className={cell}>
                    {fmtUnits(row.projectTokenCount, 18)} {tokenSymbol}
                  </td>
                  <td className={cell}>
                    {fmtUnits(row.terminalTokenAmount, row.tokenDecimals)} {row.tokenSymbol}
                  </td>
                  <td className={cell}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className={cell}>
                    {row.status === "claimable" ? (
                      <ClaimButton row={row} onDone={() => refetch()} />
                    ) : row.status === "pending" && row.canExecute ? (
                      <ExecuteButton row={row} onDone={() => refetch()} />
                    ) : row.status === "pending" ? (
                      <BridgingLink row={row} />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
