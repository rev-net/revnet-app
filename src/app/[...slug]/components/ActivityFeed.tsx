import { sdk } from "@farcaster/frame-sdk";
import Image from "next/image";
import { ChainLogo } from "@/components/ChainLogo";
import EtherscanLink from "@/components/EtherscanLink";
import FarcasterAvatar from "@/components/FarcasterAvatar";
import { FarcasterProfilesProvider } from "@/components/FarcasterAvatarContext";
import {
  ActivityEventsDocument,
  CashOutTokensEvent,
  PayEvent,
  ProjectDocument,
} from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { formatTokenSymbol } from "@/lib/utils";
import { formatDistance } from "date-fns";
import { Ether, JB_CHAINS, JBProjectToken } from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { useState, useEffect } from "react";
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
    | "newlyIssuedTokenCount"
    | "timestamp"
    | "txHash"
    | "memo"
  > & { chainId: JBChainId; identity?: any }
) {
  const { token } = useJBTokenContext();
  const composeCast = sdk.actions.composeCast;
  const chainId = payEvent.chainId;
  const chain = JB_CHAINS[chainId].chain;

  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    const checkMiniApp = async () => {
      const result = await sdk.isInMiniApp();
      setIsMiniApp(result);
    };
    checkMiniApp();
  }, []);

  if (!token?.data || !payEvent) return null;

  const activityItemData = {
    amount: new Ether(BigInt(payEvent.amount)),
    beneficiary: payEvent.beneficiary,
    beneficiaryTokenCount: new JBProjectToken(
      BigInt(payEvent.newlyIssuedTokenCount)
    ),
    memo: payEvent.memo,
  };

  // Compose Farcaster handle or fallback to address
  const handle = payEvent.identity?.username
    ? `@${payEvent.identity.username}`
    : `${payEvent.beneficiary.slice(0, 6)}…`;

  const shareText = `⏩ ${handle} paid ${activityItemData.amount.format(4)} ETH and received ${activityItemData.beneficiaryTokenCount?.format(2)} ${token.data?.symbol} — "${activityItemData.memo}"`;

  const formattedDate = formatDistance(payEvent.timestamp * 1000, new Date(), {
    addSuffix: true,
  });

  const embedUrl = typeof window !== "undefined" ? window.location.href : "";

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
        <FarcasterAvatar
          address={activityItemData.beneficiary as Address}
          withAvatar
          avatarProps={{ size: "sm" }}
          short
          chain={chain}
        />
        <div className="flex items-center gap-1">
          <span>
            got {activityItemData.beneficiaryTokenCount?.format(6)}{" "}
            {formatTokenSymbol(token.data.symbol)}
          </span>
        </div>
      </div>
      {activityItemData.memo && (
        <div className="ml-8 pb-4">
          {isMiniApp ? (
            <button
              onClick={() =>
                composeCast({
                  text: shareText,
                  embeds: [embedUrl],
                })
              }
              className="text-lg text-black-500 font-medium text-left hover:underline"
            >
              {activityItemData.memo}
            </button>
          ) : (
            <div className="text-lg text-black-500 font-medium">
              {activityItemData.memo}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RedeemActivityItem(
  cashOutEvent: Pick<
    CashOutTokensEvent,
    "reclaimAmount" | "beneficiary" | "txHash" | "timestamp" | "cashOutCount"
  > & { chainId: JBChainId; identity?: any }
) {
  const { token } = useJBTokenContext();
  const composeCast = sdk.actions.composeCast;

  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    const checkMiniApp = async () => {
      const result = await sdk.isInMiniApp();
      setIsMiniApp(result);
    };
    checkMiniApp();
  }, []);

  if (!token?.data || !cashOutEvent) return null;

  const activityItemData = {
    amount: new Ether(BigInt(cashOutEvent.reclaimAmount)),
    beneficiary: cashOutEvent.beneficiary,
    cashOutCount: new JBProjectToken(BigInt(cashOutEvent.cashOutCount)),
  };

  const handle = cashOutEvent.identity?.username
    ? `@${cashOutEvent.identity.username}`
    : `${cashOutEvent.beneficiary.slice(0, 6)}…`;

  const shareText = `⏩ ${handle} redeemed ${activityItemData.cashOutCount?.format(2)} ${token.data.symbol} for ${activityItemData.amount.format(4)} ETH`;

  const formattedDate = formatDistance(
    cashOutEvent.timestamp * 1000,
    new Date(),
    {
      addSuffix: true,
    }
  );

  const embedUrl = typeof window !== "undefined" ? window.location.href : "";

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
        <FarcasterAvatar
          address={activityItemData.beneficiary as Address}
          withAvatar
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
  const chainId = useJBChainId();
  const [isOpen, setIsOpen] = useState(true);

  const { data: project } = useBendystrawQuery(ProjectDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
  });

  const suckerGroupId = project?.project?.suckerGroupId;

  const { data: activityEvents } = useBendystrawQuery(
    ActivityEventsDocument,
    {
      orderBy: "timestamp",
      orderDirection: "desc",
      where: suckerGroupId
        ? {
            suckerGroupId,
            OR: [{ payEvent_not: null }, { cashOutTokensEvent_not: null }],
          }
        : undefined,
    },
    {
      pollInterval: 5000,
      enabled: !!suckerGroupId,
    }
  );

  return (
    <FarcasterProfilesProvider
      addresses={
        activityEvents?.activityEvents.items?.flatMap((e) =>
          e?.payEvent || e?.cashOutTokensEvent
            ? [
                (e?.payEvent?.beneficiary ||
                  e?.cashOutTokensEvent?.beneficiary) as `0x${string}`,
              ]
            : []
        ) ?? []
      }
    >
      {isOpen && (
        <div className="flex flex-col gap-1">
          {activityEvents?.activityEvents.items &&
          activityEvents.activityEvents.items.length > 0 ? (
            activityEvents.activityEvents.items?.map((event) => {
              if (event?.payEvent) {
                return (
                  <PayActivityItem
                    key={event.id}
                    chainId={event.chainId as JBChainId}
                    {...event.payEvent}
                  />
                );
              }
              if (event?.cashOutTokensEvent) {
                return (
                  <RedeemActivityItem
                    key={event.id}
                    chainId={event.chainId as JBChainId}
                    {...event.cashOutTokensEvent}
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
    </FarcasterProfilesProvider>
  );
}
