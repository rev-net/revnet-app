import { formatPriceForDisplay } from "@/lib/price";

interface PriceDisplayProps {
  price: number | null;
  tokenSymbol: string;
  nativeTokenSymbol: string;
  showUSD?: boolean;
  usdPrice?: number | null;
  isLoading?: boolean;
  className?: string;
}

export function PriceDisplay({
  price,
  tokenSymbol,
  nativeTokenSymbol,
  showUSD = true,
  usdPrice = null,
  isLoading = false,
  className = ""
}: PriceDisplayProps) {
  if (isLoading) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Loading price...
      </div>
    );
  }

  if (price === null) {
    return (
      <div className={`text-sm text-gray-400 ${className}`}>
        Price unavailable
      </div>
    );
  }

  const formattedPrice = formatPriceForDisplay(price);
  const usdValue = showUSD && usdPrice ? price * usdPrice : null;

  return (
    <div className={`text-sm ${className}`}>
      <span className="font-medium">
        {formattedPrice} {tokenSymbol} per {nativeTokenSymbol}
      </span>
      {usdValue && (
        <span className="text-gray-500 ml-2">
          (${formatPriceForDisplay(usdValue, 2)} USD)
        </span>
      )}
    </div>
  );
}

interface PriceComparisonProps {
  currentPrice: number | null;
  issuancePrice: number | null;
  tokenSymbol: string;
  nativeTokenSymbol: string;
  className?: string;
}

export function PriceComparison({
  currentPrice,
  issuancePrice,
  tokenSymbol,
  nativeTokenSymbol,
  className = ""
}: PriceComparisonProps) {
  if (!currentPrice || !issuancePrice) {
    return (
      <div className={`text-sm text-gray-400 ${className}`}>
        Price comparison unavailable
      </div>
    );
  }

  const priceDifference = ((currentPrice - issuancePrice) / issuancePrice) * 100;
  const isAboveIssuance = priceDifference > 0;

  return (
    <div className={`text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <span>Current vs Issuance:</span>
        <span className={`font-medium ${isAboveIssuance ? 'text-green-600' : 'text-red-600'}`}>
          {isAboveIssuance ? '+' : ''}{priceDifference.toFixed(2)}%
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {currentPrice > issuancePrice ? 'Above' : 'Below'} issuance price
      </div>
    </div>
  );
}

interface PriceRangeDisplayProps {
  minPrice: number;
  maxPrice: number;
  currentPrice: number | null;
  tokenSymbol: string;
  nativeTokenSymbol: string;
  className?: string;
}

export function PriceRangeDisplay({
  minPrice,
  maxPrice,
  currentPrice,
  tokenSymbol,
  nativeTokenSymbol,
  className = ""
}: PriceRangeDisplayProps) {
  const isInRange = currentPrice ? currentPrice >= minPrice && currentPrice <= maxPrice : false;

  return (
    <div className={`text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <span>Range:</span>
        <span className="font-medium">
          {formatPriceForDisplay(minPrice)} - {formatPriceForDisplay(maxPrice)} {tokenSymbol} per {nativeTokenSymbol}
        </span>
      </div>
      {currentPrice && (
        <div className={`text-xs mt-1 ${isInRange ? 'text-green-600' : 'text-red-600'}`}>
          Current price is {isInRange ? 'within' : 'outside'} range
        </div>
      )}
    </div>
  );
}
