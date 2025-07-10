import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { useJBRulesetContext } from "juice-sdk-react";
import { CashOutTaxRate } from "juice-sdk-core";

export function SimulatedLoanCard({
  collateralAmount,
  tokenSymbol,
  amountBorrowed,
  prepaidPercent,
  grossBorrowedNative,
  feeData,
  totalFixedFees,
}: {
  collateralAmount: string;
  tokenSymbol: string;
  amountBorrowed: number;
  prepaidPercent: string;
  grossBorrowedNative: number;
  feeData: { year: number; totalCost: number }[];
  totalFixedFees: number;
}) {
    const nativeTokenSymbol = useNativeTokenSymbol();
    const { rulesetMetadata } = useJBRulesetContext();
    
    // Get the cashout tax rate from the current ruleset metadata
    const cashoutTaxRate = rulesetMetadata?.data?.cashOutTaxRate 
      ? new CashOutTaxRate(Number(rulesetMetadata.data.cashOutTaxRate.value)).value
      : undefined;
    
    const maxUnlockCost = feeData[feeData.length - 1]?.totalCost ?? 0;
    const protocolFees = amountBorrowed * (totalFixedFees / 1000);
    const protocolFeesPercentage = (totalFixedFees / 1000) * 100;
    return (
      <div className="mb-2 p-3 bg-zinc-50 rounded-md border border-zinc-200">
        <div className="space-y-1 text-sm text-zinc-600">
          <p><span className="font-semibold">{collateralAmount}</span> {tokenSymbol} used as collateral</p>
          <p><span className="font-semibold">
            {amountBorrowed.toFixed(8)} {nativeTokenSymbol}
          </span> borrowing (before fees)</p>
          <p><span className="font-semibold">
            {protocolFees.toFixed(8)} {nativeTokenSymbol}
          </span> protocol & project fees ({protocolFeesPercentage.toFixed(1)}%)</p>
          {cashoutTaxRate !== undefined && (
            <p><span className="font-semibold">
              {(amountBorrowed * Number(cashoutTaxRate) / 10000).toFixed(8)} {nativeTokenSymbol}
            </span> cash out exit fees ({(Number(cashoutTaxRate) / 100).toFixed(1)}%)</p>
          )}
          <p><span className="font-semibold">
            {maxUnlockCost.toFixed(8)} {nativeTokenSymbol}
          </span> max cost to unlock all collateral before 10 years</p>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Actual amount may vary slightly.</p>
      </div>
    );
  }