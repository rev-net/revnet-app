import { EthereumAddress } from "@/components/EthereumAddress";
import EtherscanLink from "@/components/EtherscanLink";
import {
  OrderDirection,
  PayEvent,
  ProjectEvent,
  ProjectEvent_OrderBy,
  ProjectEventsDocument,
  ProjectEventsQuery,
  RedeemEvent,
} from "@/generated/graphql";
import { useSubgraphQuery } from "@/graphql/useSubgraphQuery";
import { formatDistance } from "date-fns";
import { Ether, JBProjectToken } from "juice-sdk-core";
import { useJBContractContext, useJBTokenContext } from "juice-sdk-react";
import { Address } from "viem";

type PayActivityItemData = {
  id: string;
  amount: Ether;
  beneficiary: Address;
  beneficiaryTokenCount?: JBProjectToken;
  timestamp: number;
  txHash: string;
};

function PayActivityItem(
  payEvent: Pick<
    PayEvent,
    "amount" | "beneficiary" | "beneficiaryTokenCount" | "timestamp" | "txHash"
  >
) {
  const { token } = useJBTokenContext();
  if (!token?.data || !payEvent) return null;

  const activityItemData = {
    amount: new Ether(BigInt(payEvent.amount)),
    beneficiary: payEvent.beneficiary,
    beneficiaryTokenCount: new JBProjectToken(
      BigInt(payEvent.beneficiaryTokenCount)
    ),
  };

  const formattedDate = formatDistance(
    payEvent.timestamp ?? 0 * 1000,
    new Date(),
    {
      addSuffix: true,
    }
  );

  return (
    <div>
      <div className="flex items-center gap-1 text-sm flex-wrap">
        <EthereumAddress
          address={activityItemData.beneficiary}
          withEnsName
          withEnsAvatar
          avatarProps={{ size: "sm" }}
          short
        />
        <div>
          bought {activityItemData.beneficiaryTokenCount?.format(6)}{" "}
          {token.data.symbol}
        </div>
      </div>
      <div className="text-xs text-zinc-500 ml-7">
        Paid {activityItemData.amount.format(6)} ETH •{" "}
        <EtherscanLink type="tx" value={payEvent.txHash}>
          {formattedDate}
        </EtherscanLink>
      </div>
    </div>
  );
}

function RedeemActivityItem(
  payEvent: Pick<
    RedeemEvent,
    "reclaimAmount" | "beneficiary" | "txHash" | "timestamp" | "redeemCount"
  >
) {
  const { token } = useJBTokenContext();
  if (!token?.data || !payEvent) return null;

  const activityItemData = {
    amount: new Ether(BigInt(payEvent.reclaimAmount)),
    beneficiary: payEvent.beneficiary,
    redeemCount: new JBProjectToken(BigInt(payEvent.redeemCount)),
  };

  const formattedDate = formatDistance(
    payEvent.timestamp ?? 0 * 1000,
    new Date(),
    {
      addSuffix: true,
    }
  );

  return (
    <div>
      <div className="flex items-center gap-1 text-sm flex-wrap">
        <EthereumAddress
          address={activityItemData.beneficiary}
          withEnsName
          withEnsAvatar
          avatarProps={{ size: "sm" }}
          short
        />
        <div>
          cashed out {activityItemData.redeemCount?.format(6)}{" "}
          {token.data.symbol}
        </div>
      </div>
      <div className="text-xs text-zinc-500 ml-7">
        Received {activityItemData.amount.format(6)} ETH •{" "}
        <EtherscanLink type="tx" value={payEvent.txHash}>
          {formattedDate}
        </EtherscanLink>
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const { projectId } = useJBContractContext();
  const { data } = useSubgraphQuery(ProjectEventsDocument, {
    orderBy: ProjectEvent_OrderBy.timestamp,
    orderDirection: OrderDirection.desc,
    where: {
      projectId: Number(projectId),
    },
  });

  const projectEvents = data?.projectEvents;

  return (
    <div>
      <div className="mb-3 font-medium">Activity</div>
      <div className="flex flex-col gap-3">
        {projectEvents && projectEvents.length > 0 ? (
          projectEvents?.map((event) => {
            if (event.payEvent) {
              return <PayActivityItem key={event.id} {...event.payEvent} />;
            }
            if (event.redeemEvent) {
              return (
                <RedeemActivityItem key={event.id} {...event.redeemEvent} />
              );
            }

            return null;
          })
        ) : (
          <span className="text-zinc-500 text-sm">No activity yet.</span>
        )}
      </div>
    </div>
  );
}
