"use client";

import { ChainLogo } from "@/components/ChainLogo";
import { TableSkeleton } from "@/components/loading/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";
import {
  AcrossChainRow,
  ChainProject,
  chainName,
  chainProjectsKey,
  fetchAcrossChains,
  fmtUnits,
  pctOf,
} from "./lib";

/**
 * Per-chain token supply | terminal balance | unit cash-out value, with a totals
 * row (website/ renderAcrossChainsBody parity).
 */
export function AcrossChainsCard({
  chains,
  tokenSymbol,
}: {
  chains: ChainProject[];
  tokenSymbol: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["v6AcrossChains", chainProjectsKey(chains)],
    enabled: chains.length > 0,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: () => fetchAcrossChains(chains),
  });

  return (
    <div className="border border-zinc-200 bg-melon-50 p-4">
      <h3 className="font-medium text-zinc-900">Across chains</h3>
      <p className="text-sm text-zinc-500 mt-1">
        A project can settle funds on many chains, and holders can move funds between them.
      </p>
      <div
        className={
          !isLoading && !isError && data ? "-mx-4 mt-3 overflow-x-auto" : "mt-3"
        }
      >
        {isLoading ? (
          <TableSkeleton rows={Math.max(chains.length, 2)} columns={4} />
        ) : isError || !data ? (
          <div className="text-sm text-zinc-500 py-4">Could not read cross-chain state.</div>
        ) : (
          <AcrossChainsTable rows={data} tokenSymbol={tokenSymbol} />
        )}
      </div>
    </div>
  );
}

function AcrossChainsTable({ rows, tokenSymbol }: { rows: AcrossChainRow[]; tokenSymbol: string }) {
  const supplyComplete = rows.every((r) => r.supply != null);
  const totalSupply = supplyComplete
    ? rows.reduce((sum, r) => sum + (r.supply ?? 0n), 0n)
    : null;

  // Per-bucket balance totals across chains, driving each chain's share-%.
  const balancesComplete = rows.every((r) => r.balances != null);
  const totals = new Map<string, { sum: bigint; symbol: string; decimals: number }>();
  if (balancesComplete) {
    for (const r of rows) {
      for (const b of r.balances ?? []) {
        const key = `${b.symbol.toLowerCase()}@${b.decimals}`;
        const prev = totals.get(key);
        totals.set(key, {
          sum: (prev?.sum ?? 0n) + b.balance,
          symbol: b.symbol,
          decimals: b.decimals,
        });
      }
    }
  }

  const cellHead = "h-12 px-4 text-left align-middle text-sm font-bold text-zinc-500";
  const cell = "p-4 text-left align-middle text-sm text-zinc-700";

  return (
    <table className="w-full min-w-[720px] table-fixed">
      <thead className="bg-melon-100">
        <tr className="border-b border-zinc-100">
          <th className={cellHead}>Chain</th>
          <th className={cellHead}>Supply ({tokenSymbol})</th>
          <th className={cellHead}>Balance</th>
          <th className={cellHead}>Unit value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.chainId} className="border-b border-zinc-50">
            <td className={cell}>
              <span className="inline-flex items-center gap-2">
                <ChainLogo chainId={r.chainId} width={16} height={16} />
                {chainName(r.chainId)}
              </span>
            </td>
            <td className={cell}>
              {r.supply == null ? (
                "—"
              ) : (
                <>
                  {fmtUnits(r.supply, 18)}
                  {totalSupply != null && (
                    <span className="block text-xs text-zinc-400">{pctOf(r.supply, totalSupply)}</span>
                  )}
                </>
              )}
            </td>
            <td className={cell}>
              {r.balances == null || r.balances.length === 0 ? (
                "—"
              ) : (
                r.balances.map((b) => {
                  const key = `${b.symbol.toLowerCase()}@${b.decimals}`;
                  const total = totals.get(key)?.sum ?? null;
                  const share = b.balance > 0n ? pctOf(b.balance, total) : null;
                  return (
                    <span key={key} className="block">
                      {fmtUnits(b.balance, b.decimals)} {b.symbol}
                      {share && <span className="block text-xs text-zinc-400">{share}</span>}
                    </span>
                  );
                })
              )}
            </td>
            <td className={cell}>
              {r.unitValue == null
                ? "—"
                : `${fmtUnits(r.unitValue.value, r.unitValue.decimals)} ${r.unitValue.symbol}`}
            </td>
          </tr>
        ))}
        <tr>
          <td className={`${cell} font-medium text-zinc-900`}>Total</td>
          <td className={`${cell} font-medium text-zinc-900`}>
            {totalSupply == null ? "—" : fmtUnits(totalSupply, 18)}
          </td>
          <td className={`${cell} font-medium text-zinc-900`}>
            {!balancesComplete || totals.size === 0
              ? "—"
              : [...totals.values()].map((t) => (
                  <span key={`${t.symbol}@${t.decimals}`} className="block">
                    {fmtUnits(t.sum, t.decimals)} {t.symbol}
                  </span>
                ))}
          </td>
          <td className={cell} />
        </tr>
      </tbody>
    </table>
  );
}
