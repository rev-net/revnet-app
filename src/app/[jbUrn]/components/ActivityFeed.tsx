import { ChainLogo } from "@/components/ChainLogo";
import { EthereumAddress } from "@/components/EthereumAddress";
import EtherscanLink from "@/components/EtherscanLink";
import {
  CashOutEvent,
  OrderDirection,
  PayEvent,
  ProjectEvent_OrderBy,
  ProjectEventsDocument,
} from "@/generated/graphql";
import { useOmnichainSubgraphQuery } from "@/graphql/useOmnichainSubgraphQuery";
import { formatTokenSymbol } from "@/lib/utils";
import { formatDistance } from "date-fns";
import { Ether, JB_CHAINS, JBProjectToken } from "juice-sdk-core";
import {
  JBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { useMemo, useState } from "react";
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
    | "amount"
    | "beneficiary"
    | "beneficiaryTokenCount"
    | "timestamp"
    | "txHash"
    | "note"
  > & { chainId: JBChainId }
) {
  const { token } = useJBTokenContext();
  const chainId = payEvent.chainId;
  const chain = JB_CHAINS[chainId].chain;
  if (!token?.data || !payEvent) return null;

  const activityItemData = {
    amount: new Ether(BigInt(payEvent.amount)),
    beneficiary: payEvent.beneficiary,
    beneficiaryTokenCount: new JBProjectToken(
      BigInt(payEvent.beneficiaryTokenCount)
    ),
    memo: payEvent.note,
  };

  const formattedDate = formatDistance(payEvent.timestamp * 1000, new Date(), {
    addSuffix: true,
  });

  return (
    <div className="border-b border-zinc-200 pb-2 mb-1">
      <div className="flex items-center justify-between">
        <div className="text-md text-zinc-500 mb-2">
          <EtherscanLink type="tx" value={payEvent.txHash} chain={chain}>
            {formattedDate}
          </EtherscanLink>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-md text-zinc-500 ml-7">
            {activityItemData.amount.format(6)} ETH{" "}
            <span className="border border-teal-600 bg-teal-50 text-teal-600 px-1 py-0.5">
              in
            </span>{" "}
            on{" "}
          </div>
          <ChainLogo chainId={payEvent.chainId} width={15} height={15} />
        </div>
      </div>
      <div className="flex items-center gap-1 text-md flex-wrap">
        <EthereumAddress
          address={activityItemData.beneficiary}
          withEnsName
          withEnsAvatar
          avatarProps={{ size: "sm" }}
          short
        />
        <div className="flex items-center gap-1">
          <span>
            got {activityItemData.beneficiaryTokenCount?.format(6)}{" "}
            {formatTokenSymbol(token.data.symbol)}
          </span>
        </div>
      </div>
      <div className="text-lg text-black-500 font-medium ml-7 pb-4">
        {activityItemData.memo}
      </div>
    </div>
  );
}

function RedeemActivityItem(
  cashOutEvent: Pick<
    CashOutEvent,
    "reclaimAmount" | "beneficiary" | "txHash" | "timestamp" | "cashOutCount"
  > & { chainId: JBChainId }
) {
  const { token } = useJBTokenContext();
  if (!token?.data || !cashOutEvent) return null;

  const activityItemData = {
    amount: new Ether(BigInt(cashOutEvent.reclaimAmount)),
    beneficiary: cashOutEvent.beneficiary,
    cashOutCount: new JBProjectToken(BigInt(cashOutEvent.cashOutCount)),
  };

  const formattedDate = formatDistance(
    cashOutEvent.timestamp * 1000,
    new Date(),
    {
      addSuffix: true,
    }
  );

  return (
    <div className="border-b border-zinc-200 pb-2 mb-1">
      <div className="flex items-center justify-between">
        <div className="text-md text-zinc-500 mb-2">
          <EtherscanLink type="tx" value={cashOutEvent.txHash}>
            {formattedDate}
          </EtherscanLink>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-md text-zinc-500 ml-7">
            {activityItemData.amount.format(6)} ETH{" "}
            <span className="border border-orange-500 bg-orange-50 text-orange-500 px-1 py-0.5">
              out
            </span>{" "}
            on{" "}
          </div>
          <ChainLogo chainId={cashOutEvent.chainId} width={15} height={15} />
        </div>
      </div>
      <div className="flex items-center pb-4 gap-1 text-md flex-wrap">
        <EthereumAddress
          address={activityItemData.beneficiary}
          withEnsName
          withEnsAvatar
          avatarProps={{ size: "sm" }}
          short
        />
        <div className="flex items-center gap-1">
          <span>
            cashed out {activityItemData.cashOutCount?.format(6)}{" "}
            {formatTokenSymbol(token.data.symbol)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const { projectId } = useJBContractContext();
  const [isOpen, setIsOpen] = useState(true);

  const { data } = useOmnichainSubgraphQuery(ProjectEventsDocument, {
    orderBy: ProjectEvent_OrderBy.timestamp,
    orderDirection: OrderDirection.desc,
    where: {
      projectId: Number(projectId),
    },
  });
  const projectEvents = useMemo(() => {
    return data
      ?.flatMap((d) => {
        return d.value?.response?.projectEvents.map((e) => {
          return {
            ...e,
            chainId: d.value.chainId,
          };
        });
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [data]);

  return (
    <>
      {isOpen && (
        <div className="flex flex-col gap-1">
          {projectEvents && projectEvents.length > 0 ? (
            projectEvents?.map((event) => {
              if (event?.payEvent) {
                return (
                  <PayActivityItem
                    key={event.id}
                    chainId={event.chainId}
                    {...event.payEvent}
                  />
                );
              }
              if (event?.cashOutEvent) {
                return (
                  <RedeemActivityItem
                    key={event.id}
                    chainId={event.chainId}
                    {...event.cashOutEvent}
                  />
                );
              }

              return null;
            })
          ) : (
            <span className="text-zinc-500 text-md">No activity yet.</span>
          )}
        </div>
      )}
    </>
  );
}
