"use client";

import { ProfilesProvider } from "@/components/ProfilesContext";
import { ActivityEventsDocument, SuckerGroupDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { JBChainId } from "juice-sdk-react";
import { Loader2 } from "lucide-react";
import { PayActivityItem } from "./PayActivityItem";
import { RedeemActivityItem } from "./RedeemActivityItem";

export function ActivityFeed(props: { suckerGroupId: string }) {
  const { suckerGroupId } = props;

  const { data: suckerGroupData } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: suckerGroupId },
    { pollInterval: 10000 },
  );

  const { data: activityEvents, isLoading: activityLoading } = useBendystrawQuery(
    ActivityEventsDocument,
    {
      orderBy: "timestamp",
      orderDirection: "desc",
      where: { suckerGroupId, OR: [{ payEvent_not: null }, { cashOutTokensEvent_not: null }] },
    },
    { pollInterval: 5000 },
  );

  return (
    <ProfilesProvider
      addresses={
        activityEvents?.activityEvents.items?.flatMap((e) =>
          e?.payEvent || e?.cashOutTokensEvent
            ? [(e?.payEvent?.beneficiary || e?.cashOutTokensEvent?.beneficiary) as `0x${string}`]
            : [],
        ) ?? []
      }
    >
      <div className="flex flex-col gap-1">
        {activityEvents?.activityEvents.items && activityEvents.activityEvents.items.length > 0 ? (
          activityEvents.activityEvents.items.map((event) => {
            if (event?.payEvent) {
              return (
                <PayActivityItem
                  key={event.id}
                  chainId={event.chainId as JBChainId}
                  {...event.payEvent}
                  suckerGroupData={suckerGroupData}
                />
              );
            }
            if (event?.cashOutTokensEvent) {
              return (
                <RedeemActivityItem
                  key={event.id}
                  chainId={event.chainId as JBChainId}
                  {...event.cashOutTokensEvent}
                  suckerGroupData={suckerGroupData}
                />
              );
            }

            return null;
          })
        ) : (
          <div>
            {activityLoading && <Loader2 className="animate-spin" size={64} />}
            <p className="text-sm text-zinc-500 mt-2">
              {activityLoading ? "Loading activity events..." : "No pay or cash out events yet"}
            </p>
            {!activityLoading && (
              <p className="text-xs text-zinc-400 mt-1">
                Activity feed will show when users pay into or cash out of this project
              </p>
            )}
          </div>
        )}
      </div>
    </ProfilesProvider>
  );
}
