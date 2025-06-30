export function SimulatedLoanCard({
  collateralAmount,
  tokenSymbol,
  ethToWallet,
  prepaidPercent,
  grossBorrowedEth,
  feeData,
  actualPrepaidFee,
  feeConstants,
  actualPrepaidFee,
}: {
  collateralAmount: string;
  tokenSymbol: string;
  ethToWallet: number;
  prepaidPercent: string;
  grossBorrowedEth: number;
  feeData: { year: number; totalCost: number }[];
  actualPrepaidFee?: number;
  actualPrepaidFee?: number;
  feeConstants?: {
    totalProtocolFeePercent?: number;
    minPrepaidFeePercent?: number;
    revPrepaidFeePercent?: number;
  };
}) {
    // Get the max cost from the fee data (last data point)
    const maxCost = feeData[feeData.length - 1]?.totalCost ?? grossBorrowedEth;
    
    // Calculate loan processing fees (protocol fee + REV fee = 3%)
    const protocolFee = grossBorrowedEth * (feeConstants?.minPrepaidFeePercent ?? 2.5) / 100;
    const revFee = grossBorrowedEth * (feeConstants?.revPrepaidFeePercent ?? 0.5) / 100;
    const totalProcessingFees = protocolFee + revFee;
    
    // Prepaid fee should be based on the slider percentage, not the SDK calculation
    const prepaidFee = grossBorrowedEth * (parseFloat(prepaidPercent) / 100);
    
    const totalUpfrontFees = totalProcessingFees + prepaidFee;
    const totalUpfrontFeePercent = (totalUpfrontFees / grossBorrowedEth) * 100;
    
    // Calculate prepaid duration
    const monthsToPrepay = Math.round((parseFloat(prepaidPercent) / 50) * 120);
    const prepaidYears = Math.floor(monthsToPrepay / 12);
    const prepaidMonths = monthsToPrepay % 12;
    
    // The amount to wallet is already calculated correctly and passed in as ethToWallet
    const amountToWallet = ethToWallet;
    
    // Check if the total unlock cost is very small (less than 0.000001 ETH)
    const isVerySmallCost = maxCost < 0.000001;
    
    return (
      <div className="mb-2 p-3 bg-zinc-50 rounded-md border border-zinc-200">
        <div className="space-y-1 text-sm text-zinc-600">
          <p><span className="font-semibold">{collateralAmount}</span> {tokenSymbol} used as collateral</p>
          <p><span className="font-semibold">
            {grossBorrowedEth.toFixed(6)}
          </span> ETH total borrowed</p>
          <p><span className="font-semibold">
            {amountToWallet.toFixed(6)}
          </span> ETH sent to your wallet</p>
          <p><span className="font-semibold">
            {totalUpfrontFees.toFixed(6)}
          </span> ETH total upfront fees ({totalUpfrontFeePercent.toFixed(1)}%)</p>
          <p className="text-xs text-zinc-500 ml-4">
            • Loan processing fees: {totalProcessingFees.toFixed(6)} ETH ({(totalProcessingFees/grossBorrowedEth*100).toFixed(1)}%)
          </p>
          <p className="text-xs text-zinc-500 ml-4">
            • Prepaid interest: {prepaidFee.toFixed(6)} ETH ({(prepaidFee/grossBorrowedEth*100).toFixed(1)}%)
          </p>
          <p><span className="font-semibold">
            {prepaidYears > 0 ? `${prepaidYears} year${prepaidYears > 1 ? 's' : ''}` : ''}
            {prepaidMonths > 0 ? `${prepaidYears > 0 ? ' ' : ''}${prepaidMonths} month${prepaidMonths > 1 ? 's' : ''}` : ''}
          </span> prepaid period (no additional fees)</p>
          <p><span className="font-semibold">
            {maxCost.toFixed(6)}
          </span> ETH max cost to unlock all collateral before 10 years</p>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Actual amounts may vary slightly due to rounding.</p>
        {isVerySmallCost && (
          <p className="text-xs text-amber-600 mt-1 font-medium">
            Fees are very small but not zero. The actual cost may be higher than shown due to rounding.
          </p>
        )}
      </div>
    );
  }
