import { Address } from "viem";

// Price calculation utilities
export function calculateTokensPerEth(sqrtPriceX96: bigint): number {
  const sqrt = Number(sqrtPriceX96) / 2 ** 96;
  return sqrt ** 2;
}

export function calculateEthPerToken(sqrtPriceX96: bigint): number {
  const tokensPerEth = calculateTokensPerEth(sqrtPriceX96);
  return 1 / tokensPerEth;
}

export function formatPriceForDisplay(price: number, decimals: number = 6): string {
  if (price === 0) return "0";
  
  // Handle very small numbers
  if (price < 0.000001) {
    return price.toExponential(2);
  }
  
  // Handle very large numbers
  if (price > 1000000) {
    return price.toLocaleString(undefined, {
      maximumSignificantDigits: 6,
    });
  }
  
  return price.toFixed(decimals);
}

export function validatePriceRange(minPrice: number, maxPrice: number): boolean {
  return minPrice > 0 && maxPrice > 0 && minPrice < maxPrice;
}

export function calculatePriceImpact(
  inputAmount: number,
  outputAmount: number,
  marketPrice: number
): number {
  const expectedOutput = inputAmount * marketPrice;
  const priceImpact = ((expectedOutput - outputAmount) / expectedOutput) * 100;
  return Math.max(0, priceImpact);
}

export function calculateSlippage(
  expectedPrice: number,
  actualPrice: number
): number {
  return Math.abs((expectedPrice - actualPrice) / expectedPrice) * 100;
}

export function estimateOutputAmount(
  inputAmount: number,
  price: number,
  slippageTolerance: number = 0.5
): { minOutput: number; expectedOutput: number } {
  const expectedOutput = inputAmount * price;
  const slippageMultiplier = 1 - (slippageTolerance / 100);
  const minOutput = expectedOutput * slippageMultiplier;
  
  return {
    minOutput,
    expectedOutput
  };
}

// Convert price between different representations
export function priceToTick(price: number): number {
  return Math.log(price) / Math.log(1.0001);
}

export function tickToPrice(tick: number): number {
  return Math.pow(1.0001, tick);
}

// Price validation helpers
export function isValidPrice(price: number): boolean {
  return price > 0 && isFinite(price) && !isNaN(price);
}

export function isPriceInRange(
  price: number,
  minPrice: number,
  maxPrice: number
): boolean {
  return price >= minPrice && price <= maxPrice;
}

// Price comparison helpers
export function comparePrices(price1: number, price2: number, tolerance: number = 0.001): boolean {
  return Math.abs(price1 - price2) / Math.max(price1, price2) < tolerance;
}

export function getPriceDirection(currentPrice: number, targetPrice: number): "up" | "down" | "same" {
  const diff = targetPrice - currentPrice;
  const tolerance = currentPrice * 0.001; // 0.1% tolerance
  
  if (Math.abs(diff) < tolerance) return "same";
  return diff > 0 ? "up" : "down";
}
