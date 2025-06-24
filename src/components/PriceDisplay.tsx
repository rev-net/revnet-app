import { Token } from "@uniswap/sdk-core";
import { NativeTokenValue } from "@/components/NativeTokenValue";

interface PriceDisplayProps {
  poolPriceInfo: {
    tokensPerEth: number | null;
    ethPerToken: number | null;
  };
  priceInfo: {
    issuancePrice: number | null;
    poolPrice: number | null;
  };
  exitFloorPrice: bigint | null;
  projectToken: Token;
  getNativeTokenDisplaySymbol: string;
  className?: string;
}

export const PriceDisplay = ({
  poolPriceInfo,
  priceInfo,
  exitFloorPrice,
  projectToken,
  getNativeTokenDisplaySymbol,
  className = "",
}: PriceDisplayProps) => {
  if (!poolPriceInfo.tokensPerEth) return null;

  return (
    <div className={`text-sm text-zinc-700 mb-4 p-3 border rounded bg-gray-50 ${className}`}>
      {/* Issuance Price */}
      {priceInfo.issuancePrice && (
        <div className="flex justify-between items-center mb-2">
          <span>Issuance Price (post splits):</span>
          <span>{(priceInfo.issuancePrice).toFixed(6)} {getNativeTokenDisplaySymbol}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-2">
        <span>Spot Price:</span>
        <span>{(poolPriceInfo.tokensPerEth || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {getNativeTokenDisplaySymbol}</span>
      </div>
      
      {exitFloorPrice && (
        <div className="flex justify-between items-center mb-2">
          <span>Cash Out:</span>
          <span><NativeTokenValue wei={exitFloorPrice} decimals={6} /></span>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
        <span>1 {getNativeTokenDisplaySymbol} buys:</span>
        <span>{(poolPriceInfo.ethPerToken || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {projectToken.symbol}</span>
      </div>
    </div>
  );
}; 