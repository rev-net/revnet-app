import { PriceIncreaseCountdown } from "../../PriceIncreaseCountdown";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EthereumAddress } from "@/components/EthereumAddress";
import { ForwardIcon } from "@heroicons/react/24/solid";
import { Badge } from "@/components/ui/badge";
import { useJBRulesetContext } from "juice-sdk-react";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";

export function PriceSection() {
  const issuance = useFormattedTokenIssuance();

  const { ruleset, rulesetMetadata } = useJBRulesetContext();

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return "Something went wrong";
  }

  const devTax = rulesetMetadata?.data?.reservedPercent;
  const boostRecipient = useBoostRecipient();

  return (
    <>
      <div className="mb-2">
        <div>
          {/* <div className="text-2xl font-semibold">Current issuance price</div> */}
          <span className="text-xs text-zinc-600">
            Issuing {issuance}
          {devTax && boostRecipient ?   (
            <Tooltip>
              <TooltipTrigger>
            <div className="flex justify-between gap-1">
              <span className="flex items-center gap-1">
                <span className="font-medium">
                  {devTax.formatPercentage().toFixed(2)}%
                </span>{" "}
                <span>tokens to </span>
              </span>
              <Badge variant="secondary" className="">
                <ForwardIcon className="w-4 h-4 mr-1 inline-block" />
                Operator
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <EthereumAddress
              address={boostRecipient}
              short
              withEnsName
              className="font-medium"
            />{" "}
            is the split operator and can direct this split
              </TooltipContent>
            </Tooltip>
          ) : null}
          </span>
        </div>
        <PriceIncreaseCountdown />
      </div>
    </>
  );
}
