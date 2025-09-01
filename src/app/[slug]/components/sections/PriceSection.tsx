import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useSuckersTokenSurplus } from "@/hooks/useSuckersTokenSurplus";
import { ReservedPercent, formatUnits } from "juice-sdk-core";
import { useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";
import { PriceIncreaseCountdown } from "../PriceIncreaseCountdown";

export function PriceSection({ className }: { className?: string }) {
  const issuance = useFormattedTokenIssuance({
    reservedPercent: new ReservedPercent(0),
  });

  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { token } = useJBTokenContext();
  const baseToken = useProjectBaseToken();

  // Use the sucker token surplus hook with our token map
  const { data: surpluses, isLoading: surplusLoading } = useSuckersTokenSurplus(
    baseToken.tokenMap,
  );
  const boostRecipient = useBoostRecipient();

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return "Something went wrong";
  }

  const devTax = rulesetMetadata?.data?.reservedPercent;

  // Calculate total surplus across all chains
  const totalSurplus =
    surpluses?.reduce((acc, surplus) => {
      if (surplus.surplus) {
        return acc + surplus.surplus;
      }
      return acc;
    }, 0n) ?? 0n;

  // Format the surplus value
  const formattedSurplus = totalSurplus
    ? formatUnits(totalSurplus, baseToken.decimals, {
        fractionDigits: 4,
      })
    : "0";

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
