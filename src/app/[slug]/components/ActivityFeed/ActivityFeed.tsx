"use client";

import { ProfilesProvider } from "@/components/ProfilesContext";
import { ActivityEventsDocument, SuckerGroupQuery } from "@/generated/graphql";
import { JBProjectToken } from "juice-sdk-core";
import { JBChainId, useBendystrawQuery } from "juice-sdk-react";
import { Loader2 } from "lucide-react";
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

export function ActivityFeed({ suckerGroupId, projects }: Props) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);

  const { data, isLoading } = useBendystrawQuery(
    ActivityEventsDocument,
    {
      orderBy: "timestamp",
      orderDirection: "desc",
      where: { suckerGroupId, OR: [{ payEvent_not: null }, { cashOutTokensEvent_not: null }] },
    },
    { pollInterval: 5000 },
  );

  const events: ActivityEvent[] = [];
  for (const event of data?.activityEvents.items ?? []) {
    if (!event) continue;

    const chainId = event.chainId as JBChainId;
    const projectForChain = projects.find((p) => p.chainId === chainId);
    if (!projectForChain?.tokenSymbol) continue;

    const baseTokenSymbol = projectForChain.tokenSymbol;
    const baseTokenDecimals = projectForChain.decimals ?? 18;

    if (event.payEvent) {
      const amount = Number(formatUnits(BigInt(event.payEvent.amount), baseTokenDecimals)).toFixed(
        6,
      );
      const tokenCount = new JBProjectToken(BigInt(event.payEvent.newlyIssuedTokenCount)).format(6);

      events.push({
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
      const amount = Number(
        formatUnits(BigInt(event.cashOutTokensEvent.reclaimAmount), baseTokenDecimals),
      ).toFixed(6);
      const tokenCount = new JBProjectToken(BigInt(event.cashOutTokensEvent.cashOutCount)).format(
        6,
      );

      events.push({
        type: "out",
        txHash: event.cashOutTokensEvent.txHash,
        timestamp: event.cashOutTokensEvent.timestamp,
        beneficiary: event.cashOutTokensEvent.beneficiary as Address,
        chainId,
        baseAmount: amount,
        baseTokenSymbol,
        tokenCount,
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
        <div className="max-h-[400px] overflow-y-auto pr-1">
          {visibleEvents.length > 0 ? (
            <div className="flex flex-col">
              {visibleEvents.map((event) => (
                <ActivityItem key={event.txHash} event={event} />
              ))}
            </div>
          ) : (
            <div className="py-4 text-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-zinc-400" size={24} />
                  <p className="text-sm text-zinc-500">Loading activity…</p>
                </div>
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
