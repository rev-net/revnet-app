export function SimulatedLoanCard({ collateralAmount, tokenSymbol, ethToWallet, prepaidPercent }: {
    collateralAmount: string;
    tokenSymbol: string;
    ethToWallet: number;
    prepaidPercent: string;
  }) {
    return (
      <div className="mb-2 p-3 bg-zinc-50 rounded-md border border-zinc-200">
        <h3 className="text-sm font-medium text-zinc-700 mb-1">Simulated Loan</h3>
        <div className="space-y-1 text-sm text-zinc-600">
          <p><span className="font-semibold">{collateralAmount}</span> {tokenSymbol} pays fees and mints collateral</p>
          <p><span className="font-semibold">3.5%</span> loan processing fee applied</p>
          <p><span className="font-semibold">{ethToWallet.toFixed(8)}</span> ETH borrowed</p>
          <p><span className="font-semibold">{prepaidPercent}%</span> prepaid interest (fee)</p>
          <p><span className="font-semibold">
            {(ethToWallet * (1 - parseFloat(prepaidPercent) / 100)).toFixed(8)}
          </span> ETH sent to your wallet</p>
        </div>
        <p className="text-xs text-zinc-500 mt-1">(Actual amount may vary slightly.)</p>
      </div>
    );
  }