"use client";

import { ChainLogo } from "@/components/ChainLogo";
import EtherscanLink from "@/components/EtherscanLink";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { CashOutTokensEvent } from "@/generated/graphql";
import { getTokenConfigForChain, getTokenSymbolFromAddress } from "@/lib/tokenUtils";
import { formatTokenSymbol } from "@/lib/utils";
import { sdk } from "@farcaster/frame-sdk";
import { formatDistance } from "date-fns";
import { JBProjectToken } from "juice-sdk-core";
import { JBChainId, useJBTokenContext } from "juice-sdk-react";
import { useEffect, useState } from "react";
import { Address, formatUnits } from "viem";

export function RedeemActivityItem(
  cashOutEvent: Pick<
    CashOutTokensEvent,
    "reclaimAmount" | "beneficiary" | "txHash" | "timestamp" | "cashOutCount"
  > & { chainId: JBChainId; identity?: any; suckerGroupData?: any },
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

  // Get token configuration for this event's chain
  const chainTokenConfig = getTokenConfigForChain(
    cashOutEvent.suckerGroupData,
    cashOutEvent.chainId,
  );
  const baseTokenSymbol = getTokenSymbolFromAddress(chainTokenConfig.token);
  const baseTokenDecimals = chainTokenConfig.decimals;

  // Format amount using correct decimals
  const formattedAmount = Number(
    formatUnits(BigInt(cashOutEvent.reclaimAmount), baseTokenDecimals),
  ).toFixed(6);

  const activityItemData = {
    amount: formattedAmount,
    beneficiary: cashOutEvent.beneficiary,
    cashOutCount: new JBProjectToken(BigInt(cashOutEvent.cashOutCount)),
  };

  const handle = cashOutEvent.identity?.username
    ? `@${cashOutEvent.identity.username}`
    : `${cashOutEvent.beneficiary.slice(0, 6)}…`;

  const shareText = `⏩ ${handle} redeemed ${activityItemData.cashOutCount?.format(2)} ${token.data.symbol} for ${activityItemData.amount} ${baseTokenSymbol}`;

  const formattedDate = formatDistance(cashOutEvent.timestamp * 1000, new Date(), {
    addSuffix: true,
  });

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
            {activityItemData.amount} {baseTokenSymbol}{" "}
            <span className="border border-orange-500 bg-orange-50 text-orange-500 px-1 py-0.5">
              out
            </span>{" "}
            on{" "}
          </div>
          <ChainLogo chainId={cashOutEvent.chainId} width={15} height={15} />
        </div>
      </div>
      <div className="flex items-center pb-4 gap-1 text-md flex-wrap">
        <ProfileAvatar
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
