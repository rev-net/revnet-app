import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { useJBRulesetContext } from "juice-sdk-react";
import { CashOutTaxRate, NATIVE_TOKEN_DECIMALS, formatUnits } from "juice-sdk-core";
import { parseUnits } from "viem";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

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
    const prepaidAmount = (Number(prepaidPercent) / 100) * amountBorrowed;
    const amountToWallet = amountBorrowed - protocolFees - prepaidAmount;
    
    // Don't render if we don't have valid data
    if (!collateralAmount || Number(collateralAmount) === 0) {
      return null;
    }

    // Build tooltip content with additional details
    const tooltipContent = (
      <div className="space-y-1 text-sm">
        <p><span className="font-semibold">{collateralAmount}</span> {tokenSymbol} used as collateral</p>
        <p><span className="font-semibold">
          {protocolFees.toFixed(8)} {nativeTokenSymbol}
        </span> protocol & project fees ({protocolFeesPercentage.toFixed(1)}%)</p>
        <p><span className="font-semibold">
          {maxUnlockCost.toFixed(8)} {nativeTokenSymbol}
        </span> max cost to unlock all collateral before 10 years</p>
      </div>
    );
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="mb-2 p-3 bg-zinc-50 rounded-md border border-zinc-200 cursor-help">
              <div className="space-y-1 text-sm text-zinc-600">
                <p><span className="font-semibold">
                  {amountBorrowed.toFixed(8)} {nativeTokenSymbol}
                </span> borrowing</p>
                <p><span className="font-semibold">
                  {amountToWallet.toFixed(8)} {nativeTokenSymbol}
                </span> to beneficiary after fees</p>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }