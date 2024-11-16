import { PriceIncreaseCountdown } from "../../PriceIncreaseCountdown";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EthereumAddress } from "@/components/EthereumAddress";
import { ForwardIcon } from "@heroicons/react/24/solid";
import { Badge } from "@/components/ui/badge";
import { useJBRulesetContext } from "juice-sdk-react";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { cn } from "@/lib/utils"

export function PriceSection({ className }: { className?: string }) {
  const issuance = useFormattedTokenIssuance();

  const { ruleset, rulesetMetadata } = useJBRulesetContext();

  const boostRecipient = useBoostRecipient();

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return "Something went wrong";
  }

  const devTax = rulesetMetadata?.data?.reservedPercent;

  return (
    <>
      <div className={cn("overflow-scroll whitespace-nowrap", className)}>
          {/* <div className="text-2xl font-semibold">Current issuance price</div> */}
          <div className="text-md text-zinc-600">
            Issuing {issuance}
          {devTax && boostRecipient ?   (
            <span>
                {", "}<span className="font-medium">
                  {devTax.formatPercentage().toFixed(2)}%
                </span>{" "}
                <span>split to </span>
           
             <Tooltip>
               <TooltipTrigger>
               <Badge variant="secondary">
                 <ForwardIcon className="w-4 h-4 mr-1 inline-block" />
                 Operator
               </Badge>
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
            </span>
            ) : null}
          </div>
        <PriceIncreaseCountdown />
      </div>
    </>
  );
}
