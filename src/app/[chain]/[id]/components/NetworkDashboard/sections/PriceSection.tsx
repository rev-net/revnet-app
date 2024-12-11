import { EthereumAddress } from "@/components/EthereumAddress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useCashOutValue } from "@/hooks/useCashOutValue";
import { useEtherPrice } from "@/hooks/useEtherPrice";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { formatTokenSymbol } from "@/lib/utils";
import { ForwardIcon } from "@heroicons/react/24/solid";
import { useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";
import { PriceIncreaseCountdown } from "../../PriceIncreaseCountdown";

export function PriceSection({ className }: { className?: string }) {
  const issuance = useFormattedTokenIssuance();

  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { data: ethPrice } = useEtherPrice();
  const { token } = useJBTokenContext();
  const { data: cashOutValue, loading: cashOutLoading } = useCashOutValue({
    targetCurrency: "usd",
  });
  const boostRecipient = useBoostRecipient();

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return "Something went wrong";
  }

  const devTax = rulesetMetadata?.data?.reservedPercent;
  // console.log("totalBalance", totalBalance)

  return (
    <>
      <div className={className}>
        {/* <div className="text-2xl font-semibold">Current issuance price</div> */}
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li className="flex">
            <div className="flex flex-col border-l border-zinc-300 pl-2">
              <div className="text-md">Currently issuing {issuance}</div>
              <PriceIncreaseCountdown />
            </div>
          </li>
        </ul>
        {devTax && boostRecipient ? (
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li className="flex">
              <div className="flex flex-col border-l border-zinc-300 pl-2">
                <span>
                  {devTax.formatPercentage().toFixed(2)}%{" "}
                  <span>of issuance and buybacks split to </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="secondary"
                        className="border border-visible"
                      >
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
                Current {formatTokenSymbol(token)} cash out value of{" "}
                {!cashOutLoading
                  ? `$${Number(cashOutValue).toFixed(4)}`
                  : "..."}
                . Up only.
              </div>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}
