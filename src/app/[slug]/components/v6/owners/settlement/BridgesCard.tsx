"use client";

import { ChainLogo } from "@/components/ChainLogo";
import { SkeletonLines } from "@/components/ui/skeleton";
import { JBChainId } from "@bananapus/nana-sdk-core";
import { useQuery } from "@tanstack/react-query";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { ChainProject, chainName, chainProjectsKey, fetchBridges, SuckerInfra } from "./lib";

function InfraTag({ infra }: { infra: SuckerInfra }) {
  const styles =
    infra === "ccip"
      ? "bg-teal-50 text-teal-700 border-teal-200"
      : infra === "native"
        ? "bg-zinc-100 text-zinc-600 border-zinc-200"
        : "bg-amber-50 text-amber-700 border-amber-200";
  const label = infra === "ccip" ? "CCIP" : infra === "native" ? "native" : "unknown";
  return (
    <span className={`inline-block border px-1.5 py-0.5 text-xs uppercase tracking-wide ${styles}`}>
      {label}
    </span>
  );
}

/**
 * The project's sucker bridge edges, one row per chain pair with its bridge
 * infra tags (a pair can carry both a native and a CCIP sucker for redundancy).
 */
export function BridgesCard({ chains, tokenSymbol }: { chains: ChainProject[]; tokenSymbol: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["v6Bridges", chainProjectsKey(chains)],
    enabled: chains.length > 0,
    staleTime: 5 * 60_000,
    queryFn: () => fetchBridges(chains),
  });

  // A single-chain project (or one with no suckers) has no bridges to show.
  if (!isLoading && !isError && (data?.length ?? 0) === 0) return null;

  // Group by pair so a native+CCIP pair renders one row with both tags.
  const grouped = new Map<string, { a: JBChainId; b: JBChainId; infras: SuckerInfra[] }>();
  for (const e of data ?? []) {
    const key = `${e.a}-${e.b}`;
    const g = grouped.get(key) ?? { a: e.a, b: e.b, infras: [] };
    if (!g.infras.includes(e.infra)) g.infras.push(e.infra);
    grouped.set(key, g);
  }

  return (
    <div className="border border-zinc-200 bg-melon-50 p-4">
      <h3 className="font-medium text-zinc-900">Bridges</h3>
      <p className="text-sm text-zinc-500 mt-1">
        {tokenSymbol}, funds, and information can move through available bridges.
      </p>
      <div className="mt-3">
        {isLoading ? (
          <SkeletonLines lines={Math.max(chains.length - 1, 2)} className="py-2" />
        ) : isError ? (
          <div className="text-sm text-zinc-500 py-2">
            Could not verify the project&apos;s bridge routes.
          </div>
        ) : (
          [...grouped.values()].map((g) => (
            <div
              key={`${g.a}-${g.b}`}
              className="flex items-center justify-between border-b border-zinc-50 py-2 last:border-b-0"
            >
              <span className="inline-flex items-center gap-2 text-sm text-zinc-700">
                <ChainLogo chainId={g.a} width={16} height={16} />
                {chainName(g.a)}
                <ArrowsRightLeftIcon
                  aria-label="bridged with"
                  className="h-4 w-4 shrink-0 text-melon-800"
                  strokeWidth={2.25}
                />
                <ChainLogo chainId={g.b} width={16} height={16} />
                {chainName(g.b)}
              </span>
              <span className="inline-flex gap-1">
                {g.infras
                  .slice()
                  .sort((x, y) => (x === "native" ? 0 : 1) - (y === "native" ? 0 : 1))
                  .map((infra) => (
                    <InfraTag key={infra} infra={infra} />
                  ))}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
