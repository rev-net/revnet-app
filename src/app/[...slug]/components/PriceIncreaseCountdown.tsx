import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { formatSeconds } from "@/lib/utils";
import {
  RulesetWeight,
  getNextRulesetWeight,
  ReservedPercent
} from "juice-sdk-core";
import { useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";

export function PriceIncreaseCountdown() {
  const { token } = useJBTokenContext();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const timeLeft = useCountdownToDate(
    new Date(
      ((ruleset?.data?.start ?? 0) + (ruleset?.data?.duration ?? 0)) * 1000
    )
  );
  const entryTax = ruleset?.data?.weightCutPercent;
  const nextWeight = new RulesetWeight(
    getNextRulesetWeight({
      weight: ruleset?.data?.weight.value ?? 0n,
      weightCutPercent: Number(ruleset?.data?.weightCutPercent.value ?? 0n),
    })
  );

  const nextFormattedTokenIssuance = useFormattedTokenIssuance({
    weight: nextWeight,
    reservedPercent: new ReservedPercent(0) //rulesetMetadata?.data?.reservedPercent
  });

  if (!timeLeft) return;

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="text-md text-teal-600 text-left">
          Cut to{" "}
          <span className="font-medium">{nextFormattedTokenIssuance}</span>
          {" "}
          <span>in {formatSeconds(timeLeft)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        +{entryTax?.formatPercentage()}% issuance cut scheduled for{" "}
        {formatSeconds(timeLeft)}
      </TooltipContent>
    </Tooltip>
  );
}
