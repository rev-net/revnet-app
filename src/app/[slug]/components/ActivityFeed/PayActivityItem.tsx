"use client";

import { ChainLogo } from "@/components/ChainLogo";
import EtherscanLink from "@/components/EtherscanLink";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { PayEvent } from "@/generated/graphql";
import { getTokenConfigForChain, getTokenSymbolFromAddress } from "@/lib/tokenUtils";
import { formatTokenSymbol } from "@/lib/utils";
import { sdk } from "@farcaster/frame-sdk";
import { formatDistance } from "date-fns";
import { JB_CHAINS, JBProjectToken } from "juice-sdk-core";
import { JBChainId, useJBTokenContext } from "juice-sdk-react";
import { useEffect, useState } from "react";
import { Address, formatUnits } from "viem";

export function PayActivityItem(
  payEvent: Pick<
    PayEvent,
    "amount" | "beneficiary" | "newlyIssuedTokenCount" | "timestamp" | "txHash" | "memo"
  > & { chainId: JBChainId; identity?: any; suckerGroupData?: any },
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

  // Get token configuration for this event's chain
  const chainTokenConfig = getTokenConfigForChain(payEvent.suckerGroupData, payEvent.chainId);
  const baseTokenSymbol = getTokenSymbolFromAddress(chainTokenConfig.token);
  const baseTokenDecimals = chainTokenConfig.decimals;

  // Format amount using correct decimals
  const formattedAmount = Number(formatUnits(BigInt(payEvent.amount), baseTokenDecimals)).toFixed(
    6,
  );

  const activityItemData = {
    amount: formattedAmount,
    beneficiary: payEvent.beneficiary,
    beneficiaryTokenCount: new JBProjectToken(BigInt(payEvent.newlyIssuedTokenCount)),
    memo: payEvent.memo,
  };

  // Compose Farcaster handle or fallback to address
  const handle = payEvent.identity?.username
    ? `@${payEvent.identity.username}`
    : `${payEvent.beneficiary.slice(0, 6)}…`;

  const shareText = `⏩ ${handle} paid ${activityItemData.amount} ${baseTokenSymbol} and received ${activityItemData.beneficiaryTokenCount?.format(2)} ${token.data?.symbol} — "${activityItemData.memo}"`;

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
            {activityItemData.amount} {baseTokenSymbol}{" "}
            <span className="border border-teal-600 bg-teal-50 text-teal-600 px-1 py-0.5">in</span>{" "}
            on{" "}
          </div>
          <ChainLogo chainId={payEvent.chainId} width={15} height={15} />
        </div>
      </div>
      <div className="flex items-center gap-1 text-md flex-wrap">
        <ProfileAvatar
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
              onClick={() => composeCast({ text: shareText, embeds: [embedUrl] })}
              className="text-lg text-black-500 font-medium text-left hover:underline"
            >
              {activityItemData.memo}
            </button>
          ) : (
            <div className="text-lg text-black-500 font-medium break-all">
              {activityItemData.memo}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
