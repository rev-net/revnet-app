import { PriceIncreaseCountdown } from "../../PriceIncreaseCountdown";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EthereumAddress } from "@/components/EthereumAddress";
import { useEtherPrice } from "@/hooks/useEtherPrice";
import { ForwardIcon } from "@heroicons/react/24/solid";
import { formatEther } from "juice-sdk-core";
import { Badge } from "@/components/ui/badge";
import { useJBRulesetContext } from "juice-sdk-react";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { cn } from "@/lib/utils"
import { useSuckersTokenRedemptionQuote } from "../../UserTokenBalanceCard/useSuckersTokenRedemptionQuote";
import {
  useJBTokenContext
} from "juice-sdk-react";
import { formatTokenSymbol } from "@/lib/utils";

export function PriceSection({ className }: { className?: string }) {
  const issuance = useFormattedTokenIssuance();

  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { data: ethPrice, isLoading: isEthLoading } = useEtherPrice();
  const { token } = useJBTokenContext();

  const boostRecipient = useBoostRecipient();

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return "Something went wrong";
  }

  const devTax = rulesetMetadata?.data?.reservedPercent;
  // console.log("totalBalance", totalBalance)

  const redeemQuoteQuery = useSuckersTokenRedemptionQuote(1000000000000000000n);
  console.log("redeemQuery", redeemQuoteQuery)
  const loading =
    redeemQuoteQuery.isLoading || isEthLoading;

  const redeemQuote = redeemQuoteQuery?.data ?? 0n;
  
  return (
    <>
      <div className={className}>
          {/* <div className="text-2xl font-semibold">Current issuance price</div> */}
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li className="flex">
              <div className="flex flex-col border-l border-zinc-300 pl-2">
                <div className="text-md">
                  Currently issuing {issuance} 
                </div> 
                <PriceIncreaseCountdown />
              </div>
            </li>
          </ul>
        {devTax && boostRecipient ?   (
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li className="flex">
              <div className="flex flex-col border-l border-zinc-300 pl-2">
            <span>
                {devTax.formatPercentage().toFixed(2)}%
                {" "}
                <span>of issuance and buybacks split to </span>
           
             <Tooltip>
               <TooltipTrigger>
               <Badge variant="secondary" className="border border-visible">
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
              </div>
            </li>
          </ul>
            ) : null}
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li className="flex">
              <div className="flex flex-col border-l border-zinc-300 pl-2">
                <div className="text-md">
                Current {formatTokenSymbol(token)} cash out value of {!loading && ethPrice
                  ? `$${(
                      Number(formatEther(redeemQuote ?? 0n)) * ethPrice
                    ).toFixed(4)}`
                  : "..."}. Up only.
                </div> 
              </div>
            </li>
          </ul>
      </div>
    </>
  );
}
