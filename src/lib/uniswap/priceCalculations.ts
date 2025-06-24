import { calculateSqrtPriceX96 } from "./utils";

export interface PriceRange {
  lower: number;
  upper: number;
}

export interface PriceInfo {
  issuancePrice: number | null;  // Price from Juicebox (tokens per ETH)
  poolPrice: number | null;      // Current pool price (tokens per ETH)
}

/**
 * Calculate price range for single-sided liquidity around a target price
 * Uses ±10% range by default
 */
export const calculatePriceRange = (
  targetPrice: string,
  poolPrice: number | null,
  rangeMultiplier: number = 0.1
): PriceRange | null => {
  if (!targetPrice || !poolPrice) return null;

  const targetPriceNum = parseFloat(targetPrice);
  
  // Calculate a range around the target price
  const lowerPrice = targetPriceNum * (1 - rangeMultiplier);
  const upperPrice = targetPriceNum * (1 + rangeMultiplier);
  
  // Convert to ticks using proper Uniswap V3 calculation
  const lowerTick = Math.floor(Math.log(lowerPrice) / Math.log(1.0001));
  const upperTick = Math.floor(Math.log(upperPrice) / Math.log(1.0001));
  
  return { lower: lowerTick, upper: upperTick };
};

/**
 * Calculate initial sqrt price for single-sided liquidity
 */
export const calculateInitialSqrtPrice = (targetPrice: string): bigint | undefined => {
  if (!targetPrice) return undefined;
  
  const targetPriceNum = parseFloat(targetPrice);
  return calculateSqrtPriceX96(targetPriceNum);
};

/**
 * Format price for display with specified decimal places
 */
export const formatPrice = (
  price: number | null,
  decimals: number = 6,
  symbol: string = ""
): string => {
  if (price === null || price === undefined) {
    return `0.${"0".repeat(decimals)} ${symbol}`.trim();
  }
  
  const formatted = price.toLocaleString(undefined, { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: decimals 
  });
  
  return symbol ? `${formatted} ${symbol}` : formatted;
};

/**
 * Calculate price impact percentage
 */
export const calculatePriceImpact = (
  inputAmount: bigint,
  outputAmount: bigint,
  inputDecimals: number,
  outputDecimals: number
): number => {
  const inputValue = Number(inputAmount) / Math.pow(10, inputDecimals);
  const outputValue = Number(outputAmount) / Math.pow(10, outputDecimals);
  
  if (inputValue === 0) return 0;
  
  // Price impact is typically calculated as (expected - actual) / expected
  // For now, returning a simple percentage difference
  return Math.abs((inputValue - outputValue) / inputValue) * 100;
};

/**
 * Validate price input
 */
export const isValidPrice = (price: string): boolean => {
  const priceNum = parseFloat(price);
  return !isNaN(priceNum) && priceNum > 0;
};

/**
 * Get default target price from current pool price
 */
export const getDefaultTargetPrice = (
  poolPrice: number | null,
  decimals: number = 6
): string => {
  if (!poolPrice) return "";
  return poolPrice.toFixed(decimals);
}; 