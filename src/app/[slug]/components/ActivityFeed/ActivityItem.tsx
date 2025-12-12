"use client";

import { ChainLogo } from "@/components/ChainLogo";
import { DateRelative } from "@/components/DateRelative";
import EtherscanLink from "@/components/EtherscanLink";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { formatTokenSymbol } from "@/lib/utils";
import { sdk } from "@farcaster/frame-sdk";
import { JB_CHAINS } from "juice-sdk-core";
import { JBChainId, useJBTokenContext } from "juice-sdk-react";
import { useEffect, useState } from "react";
import { Address } from "viem";

export interface ActivityEvent {
  type: "in" | "out";
  txHash: string;
  timestamp: number;
  beneficiary: Address;
  chainId: JBChainId;
  baseAmount: string;
  baseTokenSymbol: string;
  tokenCount: string;
  memo?: string;
}

export function ActivityItem({ event }: { event: ActivityEvent }) {
  const { token } = useJBTokenContext();
  const chain = JB_CHAINS[event.chainId].chain;
  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    sdk.isInMiniApp().then(setIsMiniApp);
  }, []);

  if (!token?.data) return null;

  const projectTokenSymbol = formatTokenSymbol(token.data.symbol);
  const isPayEvent = event.type === "in";

  const handleShare = () => {
    const embedUrl = typeof window !== "undefined" ? window.location.href : "";
    const handle = `${event.beneficiary.slice(0, 6)}…`;
    const shareText = isPayEvent
      ? `⏩ ${handle} paid ${event.baseAmount} ${event.baseTokenSymbol} and received ${event.tokenCount} ${projectTokenSymbol} — "${event.memo}"`
      : `⏩ ${handle} cashed out ${event.tokenCount} ${projectTokenSymbol} for ${event.baseAmount} ${event.baseTokenSymbol}`;
    sdk.actions.composeCast({ text: shareText, embeds: [embedUrl] });
  };

  return (
    <div className="py-3 border-b border-zinc-200 last:border-b-0 flex gap-2">
      <ProfileAvatar
        address={event.beneficiary}
        withAvatar
        avatarProps={{ size: "sm" }}
        chain={chain}
        className="[&>*:last-child]:hidden"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <EtherscanLink type="tx" value={event.txHash} chain={chain}>
            <DateRelative timestamp={event.timestamp} />
          </EtherscanLink>
          <div className="flex items-center gap-1">
            <span>
              {event.baseAmount} {event.baseTokenSymbol}
            </span>
            {isPayEvent ? (
              <span className="border border-teal-600 bg-teal-50 text-teal-600 text-[10px] px-1 py-0.5">
                in
              </span>
            ) : (
              <span className="border border-orange-500 bg-orange-50 text-orange-500 text-[10px] px-1 py-0.5">
                out
              </span>
            )}
            <ChainLogo chainId={event.chainId} width={14} height={14} />
          </div>
        </div>
        <div className="text-sm mt-0.5">
          <ProfileAvatar address={event.beneficiary} short chain={chain} />
          <span className="text-zinc-600">
            {" "}
            {isPayEvent ? "got" : "cashed out"} {event.tokenCount} {projectTokenSymbol}
          </span>
        </div>
        {event.memo && (
          <p className="text-sm text-zinc-700 break-all mt-1">
            {isMiniApp ? (
              <button onClick={handleShare} className="text-left hover:underline">
                {event.memo}
              </button>
            ) : (
              event.memo
            )}
          </p>
        )}
      </div>
    </div>
  );
}
