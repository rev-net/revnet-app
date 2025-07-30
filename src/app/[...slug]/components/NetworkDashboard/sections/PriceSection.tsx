import { EthereumAddress } from "@/components/EthereumAddress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";

import { formatTokenSymbol } from "@/lib/utils";
import { ForwardIcon } from "@heroicons/react/24/solid";
import {
  useJBRulesetContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { ReservedPercent, formatUnits } from "juice-sdk-core";
import { PriceIncreaseCountdown } from "../../PriceIncreaseCountdown";

export function PriceSection({ className }: { className?: string }) {
  const issuance = useFormattedTokenIssuance({
    reservedPercent: new ReservedPercent(0)
  });

  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { token } = useJBTokenContext();
  const baseToken = useProjectBaseToken();
  

  const boostRecipient = useBoostRecipient();

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return "Something went wrong";
  }

  const devTax = rulesetMetadata?.data?.reservedPercent;



  return (
    <>
      <div className={className}>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li className="flex">
            <div className="flex flex-col border-l border-zinc-300 pl-2">
              <div className="text-md">Issuing {issuance}</div>
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
                  <span>of issuance and buybacks to splits.</span>
                </span>
              </div>
            </li>
          </ul>
        ) : null}
        {/* TODO: Add back in when we have a way to get the minimum cash out value for a project
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li className="flex">
            <div className="flex flex-col border-l border-zinc-300 pl-2">
              <div className="text-md">
                {formatTokenSymbol(token)} minimum cash out value of{" "}
                {!surplusLoading
                  ? `${formattedSurplus} ${baseToken.symbol}`
                  : "..."}.
              </div>
            </div>
          </li>
        </ul> */}
      </div>
    </>
  );
}
