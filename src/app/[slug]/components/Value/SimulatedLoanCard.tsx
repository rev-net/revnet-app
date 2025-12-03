import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SimulatedLoanCard({
  collateralAmount,
  tokenSymbol,
  collateralTokenSymbol,
  amountBorrowed,
  prepaidPercent,
  feeData,
  totalFixedFees,
}: {
  collateralAmount: string;
  tokenSymbol: string; // Base token being borrowed (ETH, USDC, etc.)
  collateralTokenSymbol: string; // Project token being used as collateral (USCD2, etc.)
  amountBorrowed: number;
  prepaidPercent: string;
  feeData: { year: number; totalCost: number }[];
  totalFixedFees: number;
}) {
  const maxUnlockCost = feeData[feeData.length - 1]?.totalCost ?? 0;
  const protocolFees = amountBorrowed * (totalFixedFees / 1000);
  const protocolFeesPercentage = (totalFixedFees / 1000) * 100;
  const prepaidAmount = (Number(prepaidPercent) / 100) * amountBorrowed;
  const amountToWallet = amountBorrowed - protocolFees - prepaidAmount;

  if (!collateralAmount || Number(collateralAmount) === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mb-2 p-3 bg-zinc-50 rounded-md border border-zinc-200 cursor-help">
            <div className="space-y-1 text-sm text-zinc-600">
              <p>
                <span className="font-semibold">
                  {amountBorrowed.toFixed(8)} {tokenSymbol}
                </span>{" "}
                borrowing
              </p>
              <p>
                <span className="font-semibold">
                  {amountToWallet.toFixed(8)} {tokenSymbol}
                </span>{" "}
                to beneficiary after fees
              </p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-semibold">{collateralAmount}</span> {collateralTokenSymbol} used
              as collateral
            </p>
            <p>
              <span className="font-semibold">
                {protocolFees.toFixed(8)} {tokenSymbol}
              </span>{" "}
              protocol & project fees ({protocolFeesPercentage.toFixed(1)}%)
            </p>
            <p>
              <span className="font-semibold">
                {maxUnlockCost.toFixed(8)} {tokenSymbol}
              </span>{" "}
              max cost to unlock all collateral before 10 years
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
