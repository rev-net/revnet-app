import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { formatTokenSymbol } from "@/lib/utils";
import {
  useJBRulesetContext,
  useJBTokenContext,
  useSuckersTokenCashOutValue,
} from "juice-sdk-react";
import { ReservedPercent } from "juice-sdk-core";
import { PriceIncreaseCountdown } from "../../PriceIncreaseCountdown";

export function PriceSection({ className }: { className?: string }) {
  const issuance = useFormattedTokenIssuance({
    reservedPercent: new ReservedPercent(0)
  });

  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { token } = useJBTokenContext();
  const { data: cashOutValue, loading: cashOutLoading } =
    useSuckersTokenCashOutValue({
      targetCurrency: "eth",
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
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li className="flex">
            <div className="flex flex-col border-l border-zinc-300 pl-2">
              <div className="text-md">
                {formatTokenSymbol(token)} minimum cash out value of{" "}
                {!cashOutLoading
                  ? `${Number(cashOutValue).toFixed(4)} ETH`
                  : "..."}.
              </div>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}
