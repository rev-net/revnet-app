"use client";

import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { formatSeconds } from "@/lib/utils";
import { getNextRulesetWeight, ReservedPercent, RulesetWeight } from "juice-sdk-core";
import { useJBRulesetContext } from "juice-sdk-react";

export function CurrentIssuanceSection() {
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const boostRecipient = useBoostRecipient();

  const currentIssuance = useFormattedTokenIssuance({ reservedPercent: new ReservedPercent(0) });

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

  const nextIssuance = useFormattedTokenIssuance({
    weight: nextWeight,
    reservedPercent: new ReservedPercent(0),
  });

  const splitPercent = rulesetMetadata?.data?.reservedPercent;

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return <div className="h-16 animate-pulse bg-zinc-100 rounded" />;
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xl font-semibold tabular-nums tracking-tight">{currentIssuance}</span>

      {timeLeft && nextIssuance && (
        <p className="text-sm text-zinc-500">
          Cut to <span className="font-medium text-teal-600 tabular-nums">{nextIssuance}</span> in{" "}
          {formatSeconds(timeLeft)}
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
