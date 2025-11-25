export function ImportantInfo({
  collateralAmount,
  tokenSymbol,
}: {
  collateralAmount: string;
  tokenSymbol: string;
}) {
  return (
    <div className="mt-2 text-sm text-gray-700 space-y-1">
      <p>
        • Your {collateralAmount || "0"} {tokenSymbol} tokens will be burned as collateral
      </p>
      <p>• You'll receive an NFT to reclaim them when repaying</p>
      <p>• After 10 years, loan is liquidated and collateral is lost</p>
    </div>
  );
}
