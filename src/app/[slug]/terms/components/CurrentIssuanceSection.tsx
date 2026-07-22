"use client";

import { SkeletonLines } from "@/components/ui/skeleton";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { getTokenSymbolFromAddress } from "@/lib/tokenUtils";
import { formatSeconds } from "@/lib/utils";
import {
  getNextRulesetWeight,
  JBCoreContracts,
  jbMultiTerminalAbi,
  ReservedPercent,
  RulesetWeight,
} from "@bananapus/nana-sdk-core";
import { useJBChainId, useJBContractContext, useJBRulesetContext } from "@bananapus/nana-sdk-react";
import { useReadContract } from "wagmi";

export function CurrentIssuanceSection() {
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { projectId, version, contractAddress } = useJBContractContext();
  const chainId = useJBChainId();
  const boostRecipient = useBoostRecipient();

  // useFormattedTokenIssuance resolves the unit after the slash from the
  // indexer's base-token row; when that row is unavailable it interpolates
  // "undefined". For v6 the terminal's on-chain accounting context is
  // authoritative (e.g. Artizen's USDC context, currency uint32(token)), so
  // fill the unit from it. v4/v5 output is untouched.
  const { data: accountingContexts } = useReadContract({
    abi: jbMultiTerminalAbi,
    functionName: "accountingContextsOf",
    chainId,
    address:
      version === 6 && chainId
        ? contractAddress(JBCoreContracts.JBMultiTerminal, chainId)
        : undefined,
    args: [projectId],
    query: { enabled: version === 6 && !!chainId },
  });
  const accountingSymbol = accountingContexts?.[0]
    ? getTokenSymbolFromAddress(accountingContexts[0].token)
    : undefined;
  const withUnit = (issuance: string | undefined) => {
    if (version !== 6 || !issuance?.endsWith(" / undefined")) return issuance;
    return accountingSymbol
      ? issuance.replace(/undefined$/, accountingSymbol)
      : issuance.slice(0, -" / undefined".length);
  };

  const currentIssuance = withUnit(
    useFormattedTokenIssuance({ reservedPercent: new ReservedPercent(0) }),
  );

  const nextCutTime = ruleset?.data
    ? new Date((ruleset.data.start + ruleset.data.duration) * 1000)
    : undefined;
  const timeLeft = useCountdownToDate(nextCutTime);

  const nextWeight = ruleset?.data
    ? new RulesetWeight(
        getNextRulesetWeight({
          weight: ruleset.data.weight.value,
          weightCutPercent: Number(ruleset.data.weightCutPercent.value),
        }),
      )
    : undefined;

  const nextIssuance = withUnit(
    useFormattedTokenIssuance({
      weight: nextWeight,
      reservedPercent: new ReservedPercent(0),
    }),
  );

  const splitPercent = rulesetMetadata?.data?.reservedPercent;

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return <SkeletonLines lines={2} className="w-64 py-1" />;
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="self-start bg-peel-100 px-1 text-xl font-normal tabular-nums text-black">
        {currentIssuance}
      </span>

      {timeLeft && nextIssuance && (
        <p className="text-sm text-zinc-500">
          Cut to{" "}
          <span className="bg-peel-50 px-1 font-normal tabular-nums text-black">
            {nextIssuance}
          </span>{" "}
          in {formatSeconds(timeLeft)}
        </p>
      )}

      {splitPercent && boostRecipient && (
        <p className="text-sm text-zinc-500">
          {splitPercent.formatPercentage().toFixed(2)}% of issuance and buybacks to splits
        </p>
      )}
    </div>
  );
}
