"use client";

import { MAX_RULESET_COUNT, RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import { ChainLogo } from "@/components/ChainLogo";
import { EthereumAddress } from "@/components/EthereumAddress";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/loading/LoadingSkeletons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectOperatorDocument } from "@/generated/graphql";
import { formatTokenSymbol } from "@/lib/utils";
import {
  formatUnits,
  JB_CHAINS,
  JBChainId,
  JBCoreContracts,
  jbControllerAbi,
  jbRulesetsAbi,
  jbSplitsAbi,
} from "@bananapus/nana-sdk-core";
import {
  useBendystrawQuery,
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "@bananapus/nana-sdk-react";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { zeroAddress } from "viem";
import { useReadContracts } from "wagmi";
import { ChangeSplitRecipientsDialog } from "../../../owners/components/ChangeSplitRecipientsDialog";
import { DistributeReservedTokensButton } from "../../../owners/components/DistributeReservedTokensButton";
import { ProjectItem } from "../shared";

const BURN_SENTINEL = "0x000000000000000000000000000000000000dead";

type Split = {
  beneficiary: `0x${string}`;
  hook: `0x${string}`;
  percent: number;
};

/**
 * Splits subtab, every chain inline (jbm-v6 presentation, website/
 * renderOwnersSplits data): the operator, stage tabs, and per-chain split
 * tables for the selected stage. A split routed to a hook shows the hook's
 * address (the beneficiary is unused there); the 0xdead beneficiary is the
 * burn sentinel.
 */
export function V6SplitsSubtab({ projects }: { projects: ProjectItem[] }) {
  const { projectId, version, contractAddress } = useJBContractContext();
  const chainId = useJBChainId();
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);

  const [selectedStageIdx, setSelectedStageIdx] = useState(0);

  const chains = projects
    .filter((p) => Boolean(JB_CHAINS[p.chainId as JBChainId]))
    .map((p) => ({ chainId: p.chainId as JBChainId, projectId: p.projectId }));

  // The real operator (bendystraw permissionHolders isRevnetOperator) — NOT the
  // first split's beneficiary, which is zero when the split routes to a hook.
  const operatorQuery = useBendystrawQuery(ProjectOperatorDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
    version,
  });
  const operator = operatorQuery.data?.permissionHolders?.items?.[0]?.operator;

  // Each chain's ruleset list (chronological). Stage tabs follow the context
  // chain; per-chain reads use each chain's own ruleset id at that index.
  const rulesetReads = useReadContracts({
    contracts: chains.map((c) => ({
      chainId: c.chainId,
      address: contractAddress(JBCoreContracts.JBRulesets, c.chainId),
      abi: jbRulesetsAbi,
      functionName: "allOf" as const,
      args: [BigInt(c.projectId), 0n, BigInt(MAX_RULESET_COUNT)] as const,
    })),
    query: { enabled: chains.length > 0 },
  });

  type RulesetRow = { id: number; start: number; metadata: bigint };
  const rulesetsByChain = new Map<number, RulesetRow[]>();
  chains.forEach((c, i) => {
    const result = rulesetReads.data?.[i];
    if (result?.status === "success") {
      rulesetsByChain.set(
        Number(c.chainId),
        (result.result as unknown as readonly RulesetRow[]).slice().reverse(),
      );
    }
  });

  const homeRulesets = rulesetsByChain.get(Number(chainId)) ?? [];
  const now = Date.now() / 1000;
  const currentStageIdx = Math.max(
    homeRulesets.filter((r) => Number(r.start) <= now).length - 1,
    0,
  );

  // Reserved percent (the stage's split limit) comes from the ruleset metadata:
  // bits 4-19 hold reservedPercent (out of 10_000).
  const splitLimitPercent = (() => {
    const metadata = homeRulesets[selectedStageIdx]?.metadata;
    if (metadata === undefined) return undefined;
    return Number((metadata >> 4n) & 0xffffn) / 100;
  })();

  // Per-chain splits + pending balances for the selected stage.
  const splitReads = useReadContracts({
    contracts: chains.flatMap((c) => {
      const ruleset = rulesetsByChain.get(Number(c.chainId))?.[selectedStageIdx];
      return [
        {
          chainId: c.chainId,
          address: contractAddress(JBCoreContracts.JBSplits, c.chainId),
          abi: jbSplitsAbi,
          functionName: "splitsOf" as const,
          args: [BigInt(c.projectId), ruleset?.id ?? 0n, RESERVED_TOKEN_SPLIT_GROUP_ID] as const,
        },
        {
          chainId: c.chainId,
          address: contractAddress(JBCoreContracts.JBController, c.chainId),
          abi: jbControllerAbi,
          functionName: "pendingReservedTokenBalanceOf" as const,
          args: [BigInt(c.projectId)] as const,
        },
      ];
    }),
    query: { enabled: chains.length > 0 && rulesetsByChain.size > 0 },
  });

  if (rulesetReads.isLoading) return <TableSkeleton rows={4} columns={3} />;

  return (
    <div>
      <p className="text-md text-black font-light italic mb-2">
        Splits can be adjusted by the Operator at any time, within the permanent split limit of a
        stage.
      </p>

      <div className="text-sm font-medium text-zinc-500 mt-2 border-l border-zinc-300 pl-2 py-1">
        Operator is currently{" "}
        {operator ? (
          <EthereumAddress
            address={operator as `0x${string}`}
            chain={chainId ? JB_CHAINS[chainId].chain : undefined}
            short
            withEnsName
          />
        ) : (
          <Skeleton className="inline-block h-3 w-28 align-middle" />
        )}
      </div>

      <div className="flex gap-4 my-2">
        {homeRulesets.map((ruleset, idx) => (
          <Button
            variant={selectedStageIdx === idx ? "tab-selected" : "bottomline"}
            className={twJoin("text-md text-zinc-400", selectedStageIdx === idx && "text-inherit")}
            key={String(ruleset.id)}
            onClick={() => setSelectedStageIdx(idx)}
          >
            Stage {idx + 1}
            {idx === currentStageIdx && (
              <span className="rounded-full h-2 w-2 bg-orange-400 border-[2px] border-orange-200 ml-1" />
            )}
          </Button>
        ))}
      </div>

      {splitLimitPercent !== undefined && (
        <div className="text-sm font-medium text-zinc-500 mb-4">
          The split limit for this stage is {splitLimitPercent}%
        </div>
      )}

      <div className="flex flex-col gap-6">
        {chains.map((c, chainIdx) => {
          const splitsResult = splitReads.data?.[chainIdx * 2];
          const pendingResult = splitReads.data?.[chainIdx * 2 + 1];
          const splits =
            splitsResult?.status === "success" ? (splitsResult.result as readonly Split[]) : null;
          const pending =
            pendingResult?.status === "success" ? (pendingResult.result as bigint) : undefined;

          return (
            <div key={c.chainId}>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <ChainLogo chainId={c.chainId} />
                {JB_CHAINS[c.chainId].name}
              </div>
              <div className="overflow-auto">
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-auto md:w-1/2">Account</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Pending splits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {splitReads.isLoading ? (
                        Array.from({ length: 3 }, (_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-3 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-3 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-3 w-28" /></TableCell>
                          </TableRow>
                        ))
                      ) : !splits ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-zinc-400">
                            Couldn&apos;t load this chain&apos;s splits.
                          </TableCell>
                        </TableRow>
                      ) : splits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-zinc-400">
                            No splits on this chain.
                          </TableCell>
                        </TableRow>
                      ) : (
                        splits.map((split, i) => {
                          const routesToHook = split.hook.toLowerCase() !== zeroAddress;
                          const isBurn = split.beneficiary.toLowerCase() === BURN_SENTINEL;
                          const shown = routesToHook ? split.hook : split.beneficiary;
                          return (
                            <TableRow key={`${shown}-${i}`}>
                              <TableCell>
                                <span className="inline-flex items-center gap-2 text-sm">
                                  <EthereumAddress
                                    address={shown}
                                    chain={JB_CHAINS[c.chainId].chain}
                                    short
                                    withEnsAvatar
                                    withEnsName
                                  />
                                  {routesToHook && <span className="text-zinc-400">(hook)</span>}
                                  {isBurn && !routesToHook && (
                                    <span className="text-zinc-400">(burn)</span>
                                  )}
                                </span>
                              </TableCell>
                              <TableCell>
                                {splitLimitPercent !== undefined ? (
                                  <>
                                    {formatUnits(
                                      (BigInt(split.percent) *
                                        BigInt(Math.round(splitLimitPercent))) /
                                        100n,
                                      7,
                                    )}
                                    %
                                    <span className="text-zinc-500 ml-2">
                                      ({formatUnits(BigInt(split.percent), 7)}% of limit)
                                    </span>
                                  </>
                                ) : (
                                  `${formatUnits(BigInt(split.percent), 7)}% of limit`
                                )}
                              </TableCell>
                              <TableCell>
                                {pending !== undefined
                                  ? `${Number(formatUnits(pending, 18)).toLocaleString("en-US", {
                                      maximumFractionDigits: 2,
                                    })} ${tokenSymbol}`
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {pending !== undefined && pending > 0n && (
                <div className="mt-2">
                  <DistributeReservedTokensButton
                    chainId={c.chainId}
                    projectId={BigInt(c.projectId)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {chainId && homeRulesets[selectedStageIdx] && (
        <div className="mt-4">
          <ChangeSplitRecipientsDialog
            stageId={Number(homeRulesets[selectedStageIdx].id)}
            initialChainId={chainId}
          />
        </div>
      )}
    </div>
  );
}
