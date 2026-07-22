"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
import { CardSkeleton } from "@/components/loading/LoadingSkeletons";
import { toast } from "@/components/ui/use-toast";
import { formatWalletError } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import {
  ChainProject,
  chainName,
  chainProjectsKey,
  explorerAddressUrl,
  fmtUnits,
} from "../settlement/lib";
import { fetchSplitHookStates, lpSplitHookAbi, SplitHookChainState } from "./lib";

/** Simulate-first write against the LP split hook on its chain. */
function HookActionButton({
  state,
  label,
  functionName,
  args,
  title,
  onDone,
}: {
  state: SplitHookChainState;
  label: string;
  functionName: "deployPool" | "collectAndRouteLPFees";
  args: readonly [bigint, bigint] | readonly [bigint, `0x${string}`];
  title?: string;
  onDone: () => void;
}) {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: state.chainId });
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);

  return (
    <ButtonWithWallet
      targetChainId={state.chainId}
      size="sm"
      variant="outline"
      forceChildren
      loading={busy}
      title={title}
      onClick={async () => {
        try {
          setBusy(true);
          const sim = await publicClient?.simulateContract({
            account: address,
            address: state.hook,
            abi: lpSplitHookAbi,
            functionName,
            args: args as never,
          });
          if (!sim) throw new Error("Could not simulate the transaction.");
          await writeContractAsync(sim.request);
          toast({ title: `${label} confirmed`, description: `${label} on ${chainName(state.chainId)}.` });
          onDone();
        } catch (error) {
          console.error(error);
          toast({ variant: "destructive", title: `${label} failed`, description: formatWalletError(error) });
        } finally {
          setBusy(false);
        }
      }}
    >
      {label}
    </ButtonWithWallet>
  );
}

function SplitHookChainBlock({
  state,
  tokenSymbol,
  onDone,
}: {
  state: SplitHookChainState;
  tokenSymbol: string;
  onDone: () => void;
}) {
  const explorer = explorerAddressUrl(state.chainId, state.hook);
  const row = "flex justify-between text-sm text-zinc-700 py-1 border-b border-zinc-50 last:border-b-0";
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
          <ChainLogo chainId={state.chainId} width={16} height={16} />
          {chainName(state.chainId)}
        </span>
        {explorer ? (
          <a
            href={explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 underline decoration-dotted hover:text-zinc-600 font-mono"
          >
            {state.hook.slice(0, 6)}…{state.hook.slice(-4)} ↗
          </a>
        ) : (
          <span className="text-xs text-zinc-400 font-mono">{state.hook}</span>
        )}
      </div>
      <div className="mt-2">
        <div className={row}>
          <span className="text-zinc-400">Pool</span>
          <span>{state.hasPool ? "Deployed" : "Not deployed yet"}</span>
        </div>
        <div className={row}>
          <span className="text-zinc-400">Accumulated {tokenSymbol}</span>
          <span>{fmtUnits(state.accumulated, 18)}</span>
        </div>
        {state.hasPool && state.tokenId > 0n && (
          <div className={row}>
            <span className="text-zinc-400">LP position</span>
            <span>
              #{state.tokenId.toString()}
              {state.tickLower != null && state.tickUpper != null
                ? ` (ticks ${state.tickLower} → ${state.tickUpper})`
                : ""}
            </span>
          </div>
        )}
        <div className={row}>
          <span className="text-zinc-400">Claimable LP fees</span>
          <span>
            {fmtUnits(state.claimableFees, state.pairDecimals)} {state.pairSymbol}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {!state.hasPool ? (
          <>
            <HookActionButton
              state={state}
              label="Deploy pool"
              functionName="deployPool"
              args={[state.projectId, 0n] as const}
              title="Seed the Uniswap V4 pool from accumulated tokens (accepts any cash out return)"
              onDone={onDone}
            />
            {state.deployGated && (
              <span className="text-xs text-zinc-400 max-w-md">
                Deploying currently requires the operator (SET_BUYBACK_POOL permission). It becomes
                permissionless once the issuance rate decays to 10% of what it was when tokens
                started accumulating.
              </span>
            )}
          </>
        ) : (
          <HookActionButton
            state={state}
            label="Collect fees"
            functionName="collectAndRouteLPFees"
            args={[state.projectId, state.terminalToken] as const}
            title="Collect LP trading fees and route them into the project's terminal balance (anyone can call this)"
            onDone={onDone}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Shown only when a reserved split routes to the LP split hook: reserved tokens
 * accumulate there until the pool is seeded (Deploy pool — operator-gated until
 * the issuance decay threshold), after which Collect fees is permissionless and
 * routes trading fees back into the project.
 */
export function SplitHookCard({ chains, tokenSymbol }: { chains: ChainProject[]; tokenSymbol: string }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["v6SplitHookStates", chainProjectsKey(chains)],
    enabled: chains.length > 0,
    staleTime: 60_000,
    queryFn: () => fetchSplitHookStates(chains),
  });

  if (isLoading) return <CardSkeleton rows={5} />;

  // Hidden entirely when no reserved split routes to the LP hook anywhere.
  if (!data || data.length === 0) return null;

  return (
    <div className="border border-zinc-200 bg-white p-4">
      <h3 className="font-medium text-zinc-900">
        Split hook <span className="text-xs uppercase tracking-wide text-zinc-400 ml-1">LP</span>
      </h3>
      <p className="text-sm text-zinc-500 mt-1">
        Reserved {tokenSymbol} routed here accumulates until the pool is seeded: Deploy pool cashes
        out part of the accumulated {tokenSymbol} for the terminal token and mints a two-sided
        Uniswap V4 position. Collect fees routes the position&apos;s trading fees into the
        project&apos;s terminal balance.
      </p>
      {data.map((state) => (
        <SplitHookChainBlock
          key={state.chainId}
          state={state}
          tokenSymbol={tokenSymbol}
          onDone={() => refetch()}
        />
      ))}
    </div>
  );
}
