"use client";

import { ChainLogo } from "@/components/ChainLogo";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  ChainProject,
  chainName,
  chainProjectsKey,
  explorerAddressUrl,
  fmtUnits,
} from "../settlement/lib";
import { AmmChainState, fetchAmmStates } from "./lib";

function formatPrice(price: number): string {
  if (!isFinite(price) || price <= 0) return "—";
  if (price < 0.0001) return price.toExponential(2);
  return Intl.NumberFormat("en", { maximumFractionDigits: price >= 1 ? 4 : 8 }).format(price);
}

function AmmChainRow({ state, tokenSymbol }: { state: AmmChainState; tokenSymbol: string }) {
  const { pool, composition } = state;
  const explorer = pool ? explorerAddressUrl(state.chainId, pool.poolManager) : null;
  return (
    <div className="border-b border-zinc-50 py-3 last:border-b-0">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
        <ChainLogo chainId={state.chainId} width={16} height={16} />
        {chainName(state.chainId)}
      </div>
      {!state.hook ? (
        <p className="text-sm text-zinc-400 mt-1">No buyback hook configured on this chain.</p>
      ) : !pool ? (
        <p className="text-sm text-zinc-400 mt-1">
          Buyback hook configured, but its pool is not initialized yet.
        </p>
      ) : (
        <div className="mt-2 text-sm text-zinc-700 space-y-1">
          <div>
            <span className="text-zinc-400">Price</span>{" "}
            {pool.price == null ? "—" : `${formatPrice(pool.price)} ${pool.pair.symbol}/${tokenSymbol}`}
          </div>
          <div>
            <span className="text-zinc-400">Composition</span>{" "}
            {composition == null ? (
              <span className="text-zinc-400">
                unavailable (the RPC could not return the complete pool history)
              </span>
            ) : (
              <>
                {fmtUnits(composition.tokenAmount, 18)} {tokenSymbol} +{" "}
                {fmtUnits(composition.pairAmount, pool.pair.decimals)} {pool.pair.symbol}
              </>
            )}
          </div>
          <div className="text-xs text-zinc-400">
            Uniswap V4 pool (fee {pool.key.fee / 10_000}%) held by the{" "}
            {explorer ? (
              <a
                href={explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted hover:text-zinc-600"
              >
                PoolManager ↗
              </a>
            ) : (
              "PoolManager"
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The project's buyback-hook Uniswap V4 pool per chain: live price, exact pool
 * reserves (net LP ranges valued at the current price), and the PoolManager
 * explorer link. The pool is keyed by (projectId, PAIR/accounting token) — a
 * USDC project's pool is only found by passing its USDC context, never a
 * hardcoded native token.
 */
export function AmmCard({ chains, tokenSymbol }: { chains: ChainProject[]; tokenSymbol: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["v6AmmStates", chainProjectsKey(chains)],
    enabled: chains.length > 0,
    staleTime: 60_000,
    queryFn: () => fetchAmmStates(chains),
  });

  const anyHook = data?.some((s) => s.hook) ?? false;

  return (
    <div className="border border-zinc-200 bg-white p-4">
      <h3 className="font-medium text-zinc-900">
        Market <span className="text-xs uppercase tracking-wide text-zinc-400 ml-1">AMM</span>
      </h3>
      <p className="text-sm text-zinc-500 mt-1">
        The market is used to fill orders that give payers more {tokenSymbol} than issuance would.
      </p>
      <div className="mt-2">
        {isLoading ? (
          <SkeletonLines lines={Math.max(chains.length, 2)} className="py-3" />
        ) : isError || !data ? (
          <div className="text-sm text-zinc-500 py-3">Could not read the buyback pool.</div>
        ) : !anyHook ? (
          <div className="text-sm text-zinc-400 py-3">
            No buyback hook configured — payments always mint at the issuance rate, and there is no
            project-owned AMM pool to show.
          </div>
        ) : (
          data.map((state) => (
            <AmmChainRow key={state.chainId} state={state} tokenSymbol={tokenSymbol} />
          ))
        )}
      </div>
    </div>
  );
}
