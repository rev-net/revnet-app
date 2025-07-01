import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";

// Utility function to format a number with native token symbol
function formatNativeTokenValue(value: number, decimals: number = 8): string {
  return `${value.toFixed(decimals)}`;
}

export function SimulatedLoanCard({
  collateralAmount,
  tokenSymbol,
  amountBorrowed,
  prepaidPercent,
  grossBorrowedNative,
  feeData,
}: {
  collateralAmount: string;
  tokenSymbol: string;
  amountBorrowed: number;
  prepaidPercent: string;
  grossBorrowedNative: number;
  feeData: { year: number; totalCost: number }[];
}) {
    const nativeTokenSymbol = useNativeTokenSymbol();
    const totalCost = feeData[feeData.length - 1]?.totalCost ?? 0;
    // const maxUnlockCost = grossBorrowedNative + totalCost;
    const protocolFees = amountBorrowed * 0.035; // 3.5% protocol & project fees
    return (
      <div className="mb-2 p-3 bg-zinc-50 rounded-md border border-zinc-200">
        <div className="space-y-1 text-sm text-zinc-600">
          <p><span className="font-semibold">{collateralAmount}</span> {tokenSymbol} used as collateral</p>
          <p><span className="font-semibold">
            {formatNativeTokenValue(amountBorrowed)} {nativeTokenSymbol}
          </span> borrowed</p>
          <p><span className="font-semibold">
            {formatNativeTokenValue(protocolFees)} {nativeTokenSymbol}
          </span> protocol & project fees (3.5%)</p>
          <p><span className="font-semibold">
            {formatNativeTokenValue(totalCost)} {nativeTokenSymbol}
          </span> max cost to unlock all collateral before 10 years</p>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Actual amount may vary slightly.</p>
      </div>
    );
  }