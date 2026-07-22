"use client";

import { ProfilesProvider } from "@/components/ProfilesContext";
import { ActivityFeedSkeleton } from "@/components/loading/LoadingSkeletons";
import { ActivityEventsDocument, SuckerGroupQuery } from "@/generated/graphql";
import { formatDecimals } from "@/lib/number";
import { JBProjectToken } from "@bananapus/nana-sdk-core";
import { JBChainId, useBendystrawQuery, useJBContractContext } from "@bananapus/nana-sdk-react";
import { useState } from "react";
import { Address, formatUnits } from "viem";
import { ActivityEvent, ActivityItem } from "./ActivityItem";

type Project = NonNullable<
  NonNullable<SuckerGroupQuery["suckerGroup"]>["projects"]
>["items"][number];

interface Props {
  suckerGroupId: string;
  projects: Project[];
}

const INITIAL_ITEMS = 10;
const LOAD_MORE_COUNT = 5;

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ActivityFeed({ suckerGroupId, projects }: Props) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);
  const { version } = useJBContractContext();

  // v6 gets the full multi-type feed (website/ parity); earlier versions keep the
  // original pay/cash-out-only query and rendering.
  const isV6 = version === 6;

  const { data, isLoading } = useBendystrawQuery(
    ActivityEventsDocument,
    {
      orderBy: "timestamp",
      orderDirection: "desc",
      where: isV6
        ? { suckerGroupId }
        : { suckerGroupId, OR: [{ payEvent_not: null }, { cashOutTokensEvent_not: null }] },
    },
    { pollInterval: 15_000 },
  );

  const items = data?.activityEvents.items ?? [];

  // mintTokensOf fires alongside pays, manual mints, and auto-issuance, each of which
  // already gets its own row — only surface mintTokensEvent rows for txs none of those
  // cover (e.g. bridge receipts). Same idea for manual mints inside auto-issue txs.
  const mintCoveredTxs = new Set<string>();
  const autoIssueTxs = new Set<string>();
  if (isV6) {
    for (const event of items) {
      if (!event) continue;
      const key = `${event.chainId}:${event.txHash}`;
      if (event.payEvent || event.manualMintTokensEvent || event.autoIssueEvent) {
        mintCoveredTxs.add(key);
      }
      if (event.autoIssueEvent) autoIssueTxs.add(key);
    }
  }

  const events: ActivityEvent[] = [];
  for (const event of items) {
    if (!event) continue;

    const chainId = event.chainId as JBChainId;
    const projectForChain = projects.find((p) => p.chainId === chainId);
    if (!projectForChain?.tokenSymbol) continue;

    const baseTokenSymbol = projectForChain.tokenSymbol;
    const baseTokenDecimals = projectForChain.decimals ?? 18;
    const txKey = `${event.chainId}:${event.txHash}`;

    if (event.payEvent) {
      const amount = formatDecimals(
        Number(formatUnits(BigInt(event.payEvent.amount), baseTokenDecimals)),
      );
      const tokenCount = new JBProjectToken(BigInt(event.payEvent.newlyIssuedTokenCount)).format(6);

      events.push({
        id: event.id,
        type: "in",
        txHash: event.payEvent.txHash,
        timestamp: event.payEvent.timestamp,
        beneficiary: event.payEvent.beneficiary as Address,
        chainId,
        baseAmount: amount,
        baseTokenSymbol,
        tokenCount,
        memo: event.payEvent.memo || undefined,
      });
    } else if (event.cashOutTokensEvent) {
      const amount = formatDecimals(
        Number(formatUnits(BigInt(event.cashOutTokensEvent.reclaimAmount), baseTokenDecimals)),
      );
      const tokenCount = new JBProjectToken(BigInt(event.cashOutTokensEvent.cashOutCount)).format(
        6,
      );

      events.push({
        id: event.id,
        type: "out",
        txHash: event.cashOutTokensEvent.txHash,
        timestamp: event.cashOutTokensEvent.timestamp,
        beneficiary: event.cashOutTokensEvent.beneficiary as Address,
        chainId,
        baseAmount: amount,
        baseTokenSymbol,
        tokenCount,
      });
    } else if (!isV6) {
      continue;
    } else if (event.addToBalanceEvent) {
      const e = event.addToBalanceEvent;
      events.push({
        id: event.id,
        type: "addToBalance",
        txHash: e.txHash,
        timestamp: e.timestamp,
        beneficiary: e.from as Address,
        chainId,
        baseAmount: formatDecimals(Number(formatUnits(BigInt(e.amount), baseTokenDecimals))),
        baseTokenSymbol,
        memo: e.memo || undefined,
      });
    } else if (event.mintTokensEvent) {
      if (mintCoveredTxs.has(txKey)) continue;
      const e = event.mintTokensEvent;
      events.push({
        id: event.id,
        type: "mint",
        txHash: e.txHash,
        timestamp: e.timestamp,
        beneficiary: e.beneficiary as Address,
        chainId,
        tokenCount: new JBProjectToken(BigInt(e.beneficiaryTokenCount)).format(6),
        memo: e.memo || undefined,
      });
    } else if (event.manualMintTokensEvent) {
      if (autoIssueTxs.has(txKey)) continue;
      const e = event.manualMintTokensEvent;
      events.push({
        id: event.id,
        type: "mint",
        txHash: e.txHash,
        timestamp: e.timestamp,
        beneficiary: e.beneficiary as Address,
        chainId,
        tokenCount: new JBProjectToken(BigInt(e.beneficiaryTokenCount)).format(6),
        memo: e.memo || undefined,
      });
    } else if (event.autoIssueEvent) {
      const e = event.autoIssueEvent;
      events.push({
        id: event.id,
        type: "autoIssue",
        txHash: e.txHash,
        timestamp: e.timestamp,
        beneficiary: e.beneficiary as Address,
        chainId,
        tokenCount: new JBProjectToken(BigInt(e.count)).format(6),
      });
    } else if (event.deployErc20Event) {
      const e = event.deployErc20Event;
      events.push({
        id: event.id,
        type: "deployErc20",
        txHash: e.txHash,
        timestamp: e.timestamp,
        beneficiary: e.from as Address,
        chainId,
        detail: e.symbol.replace(/^\$+/, ""),
      });
    } else if (event.projectCreateEvent) {
      const e = event.projectCreateEvent;
      events.push({
        id: event.id,
        type: "projectCreate",
        txHash: e.txHash,
        timestamp: e.timestamp,
        beneficiary: e.from as Address,
        chainId,
      });
    } else if (event.projectTransferEvent) {
      const e = event.projectTransferEvent;
      events.push({
        id: event.id,
        type: "projectTransfer",
        txHash: e.txHash,
        timestamp: e.timestamp,
        beneficiary: e.previousOwner as Address,
        chainId,
        detail: truncateAddress(e.owner),
      });
    } else if (event.operatorPermissionsSetEvent) {
      const e = event.operatorPermissionsSetEvent;
      events.push({
        id: event.id,
        type: "operatorPermissionsSet",
        txHash: e.txHash,
        timestamp: e.timestamp,
        beneficiary: e.from as Address,
        chainId,
      });
    } else if (event.rulesetQueuedEvent) {
      const e = event.rulesetQueuedEvent;
      events.push({
        id: event.id,
        type: "rulesetQueued",
        txHash: e.txHash,
        timestamp: e.timestamp,
        beneficiary: e.from as Address,
        chainId,
      });
    } else if (event.buybackPoolEvent) {
      const e = event.buybackPoolEvent;
      events.push({
        id: event.id,
        type: "buybackPool",
        txHash: e.txHash,
        timestamp: e.timestamp,
        beneficiary: e.from as Address,
        chainId,
      });
    }
  }

  const visibleEvents = events.slice(0, visibleCount);
  const hasMore = events.length > visibleCount;
  const addresses = visibleEvents.map((e) => e.beneficiary);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-2">Activity</h3>
      <ProfilesProvider addresses={addresses}>
        <div className="pr-1">
          {visibleEvents.length > 0 ? (
            <div className="flex flex-col">
              {visibleEvents.map((event) => (
                <ActivityItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className={isLoading ? "py-2" : "py-4 text-center"}>
              {isLoading ? (
                <ActivityFeedSkeleton />
              ) : (
                <p className="text-sm text-zinc-500">No activity yet</p>
              )}
            </div>
          )}
        </div>

        {hasMore && (
          <button
            onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
            className="w-full mt-3 py-2 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
          >
            Load more
          </button>
        )}
      </ProfilesProvider>
    </div>
  );
}
