import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { formatSeconds } from "@/lib/utils";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import {
  RulesetWeight,
  getNextRulesetWeight,
  getTokenBPrice,
} from "juice-sdk-core";
import { useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";

export function PriceIncreaseCountdown() {
  const { token } = useJBTokenContext();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const nativeTokenSymbol = useNativeTokenSymbol();
  const timeLeft = useCountdownToDate(
    new Date(
      Number(
        ((ruleset?.data?.start ?? 0n) + (ruleset?.data?.duration ?? 0n)) * 1000n
      )
    )
  );
  const entryTax = ruleset?.data?.decayRate;
  const tokenA = { symbol: nativeTokenSymbol, decimals: 18 };
  const nextWeight = new RulesetWeight(
    getNextRulesetWeight({
      weight: ruleset?.data?.weight.val ?? 0n,
      decayRate: ruleset?.data?.decayRate.val ?? 0n,
    })
  );

  const nextTokenBPrice =
    ruleset?.data && rulesetMetadata?.data
      ? getTokenBPrice(tokenA.decimals, {
          weight: nextWeight,
          reservedRate: rulesetMetadata?.data?.reservedRate,
        })
      : null;

  if (!timeLeft) return;

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="text-sm mt-1 text-red-600">
          <span>
            {nextTokenBPrice?.format(4)} {tokenA.symbol}
          </span>
          <span className="text-base leading-tight">
            {" "}
            / {token?.data?.symbol}
          </span>{" "}
          <span>in {formatSeconds(timeLeft)}</span>
          <QuestionMarkCircleIcon className="h-4 w-4 inline ml-1 mb-1" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        +{entryTax?.formatPercentage()}% price ceiling increase scheduled for{" "}
        {formatSeconds(timeLeft)}
      </TooltipContent>
    </Tooltip>
  );
}
