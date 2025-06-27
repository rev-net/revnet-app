export function SimulatedLoanCard({
  collateralAmount,
  tokenSymbol,
  ethToWallet,
  prepaidPercent,
  grossBorrowedEth,
  feeData,
}: {
  collateralAmount: string;
  tokenSymbol: string;
  ethToWallet: number;
  prepaidPercent: string;
  grossBorrowedEth: number;
  feeData: { year: number; totalCost: number }[];
}) {
    const totalFeeCost = feeData[feeData.length - 1]?.totalCost ?? 0;
    const totalUnlockCost = grossBorrowedEth + totalFeeCost;
    
    // Calculate amounts based on the same logic as generateFeeData
    const prepaidFeeAmount = grossBorrowedEth * (parseFloat(prepaidPercent) / 100);
    const amountToWallet = ethToWallet * (1 - parseFloat(prepaidPercent) / 100);
    
    // Check if the total unlock cost is very small (less than 0.000001 ETH)
    const isVerySmallCost = totalUnlockCost < 0.000001;
    
    return (
      <div className="mb-2 p-3 bg-zinc-50 rounded-md border border-zinc-200">
        <div className="space-y-1 text-sm text-zinc-600">
          <p><span className="font-semibold">{collateralAmount}</span> {tokenSymbol} used as collateral</p>
          <p><span className="font-semibold">
            {amountToWallet.toFixed(6)}
          </span> ETH sent to your wallet</p>
          <p><span className="font-semibold">
            {prepaidFeeAmount.toFixed(6)}
          </span> ETH fees prepaid into {tokenSymbol} revnet</p>
          <p><span className="font-semibold">
            {totalUnlockCost.toFixed(6)}
          </span> ETH max cost to unlock all collateral before 10 years</p>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Actual amount may vary slightly.</p>
        {isVerySmallCost && (
          <p className="text-xs text-amber-600 mt-1 font-medium">
            Fees are very small but not zero. The actual cost may be higher than shown due to rounding.
          </p>
        )}
      </div>
    );
  }