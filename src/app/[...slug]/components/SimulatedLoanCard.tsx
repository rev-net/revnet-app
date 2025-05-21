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
    const totalCost = feeData[feeData.length - 1]?.totalCost ?? 0;
    const maxUnlockCost = grossBorrowedEth + totalCost;
    return (
      <div className="mb-2 p-3 bg-zinc-50 rounded-md border border-zinc-200">
        <div className="space-y-1 text-sm text-zinc-600">
          <p><span className="font-semibold">{collateralAmount}</span> {tokenSymbol} used as collateral</p>
          <p><span className="font-semibold">
            {(ethToWallet * (1 - parseFloat(prepaidPercent) / 100)).toFixed(8)}
          </span> ETH sent to your wallet</p>
          <p><span className="font-semibold">
            {(ethToWallet * parseFloat(prepaidPercent) / 100).toFixed(8)}
          </span> ETH fees prepaid into {tokenSymbol} revnet</p>
          <p><span className="font-semibold">
            {totalCost.toFixed(8)}
          </span> ETH max cost to unlock all collateral before 10 years</p>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Actual amount may vary slightly.</p>
      </div>
    );
  }