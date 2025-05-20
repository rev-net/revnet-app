export function SimulatedLoanCard({ collateralAmount, tokenSymbol, ethToWallet, prepaidPercent }: {
    collateralAmount: string;
    tokenSymbol: string;
    ethToWallet: number;
    prepaidPercent: string;
  }) {
    return (
      <div className="mb-2 p-3 bg-zinc-50 rounded-md border border-zinc-200">
        <div className="space-y-1 text-sm text-zinc-600">
          <p><span className="font-semibold">{collateralAmount}</span> {tokenSymbol} used as collateral</p>
          <p><span className="font-semibold">{ethToWallet.toFixed(8)}</span> ETH borrowed</p>
          <p><span className="font-semibold">
            {(ethToWallet * (parseFloat(prepaidPercent) / 100)).toFixed(8)}
          </span> ETH paid as fee to this revnet</p>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Actual amount may vary slightly.</p>
      </div>
    );
  }