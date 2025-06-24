import { Token } from "@uniswap/sdk-core";
import { FixedInt } from "fpnum";

/**
 * Get the display symbol for native token, handling WETH -> ETH conversion
 */
export const getNativeTokenDisplaySymbol = (
  nativeToken: Token,
  chainId: number
): string => {
  // Check if native token is WETH by comparing addresses
  const { WETH_ADDRESSES } = require('@/constants');
  const wethAddress = WETH_ADDRESSES[chainId];
  
  if (wethAddress && nativeToken.address.toLowerCase() === wethAddress.toLowerCase()) {
    return "ETH";
  }
  
  return nativeToken.symbol || "Unknown";
};

/**
 * Get the display symbol for native token in balance messages
 * For LP section, always show ETH since we wrap ETH to WETH
 */
export const getNativeTokenDisplaySymbolForBalance = (
  nativeToken: Token,
  chainId: number,
  activeView: string
): string => {
  // For LP section, always show ETH since we wrap ETH to WETH
  if (activeView === 'lp') {
    return "ETH";
  }
  
  return getNativeTokenDisplaySymbol(nativeToken, chainId);
};

/**
 * Format token amount for display
 */
export const formatTokenAmount = (
  amount: bigint,
  decimals: number,
  symbol: string,
  displayDecimals: number = 6
): string => {
  const formattedAmount = Number(amount) / Math.pow(10, decimals);
  return `${formattedAmount.toFixed(displayDecimals)} ${symbol}`;
};

/**
 * Format token amount using FixedInt for consistent formatting
 */
export const formatTokenAmountWithFixedInt = (
  tokenAmount: { amount: FixedInt<number>; symbol: string | undefined } | null,
  decimals: number = 6
): string => {
  if (!tokenAmount) return "0";
  return tokenAmount.amount.format(decimals);
};

/**
 * Check if user has sufficient balance for a transaction
 */
export const hasSufficientBalance = (
  projectAmount: string,
  nativeAmount: string,
  projectTokenBalance: bigint | undefined,
  nativeTokenBalance: bigint | undefined,
  ethBalance: bigint | undefined,
  isSingleSided: boolean,
  activeView: string
): boolean => {
  if (!projectAmount) return true;
  
  const projectAmountWei = BigInt(parseFloat(projectAmount) * Math.pow(10, 18));
  const hasProjectBalance = (projectTokenBalance ?? 0n) >= projectAmountWei;
  
  if (isSingleSided) {
    return hasProjectBalance;
  }
  
  if (!nativeAmount) return hasProjectBalance;
  
  const nativeAmountWei = BigInt(parseFloat(nativeAmount) * Math.pow(10, 18));
  // Use ETH balance for LP section, WETH balance for other sections
  const relevantNativeBalance = activeView === 'lp' ? (ethBalance ?? 0n) : (nativeTokenBalance ?? 0n);
  const hasNativeBalance = relevantNativeBalance >= nativeAmountWei;
  
  return hasProjectBalance && hasNativeBalance;
};

/**
 * Generate balance error message for insufficient funds
 */
export const getBalanceErrorMessage = (
  projectAmount: string,
  nativeAmount: string,
  projectToken: Token,
  projectTokenBalance: bigint | undefined,
  nativeTokenBalance: bigint | undefined,
  ethBalance: bigint | undefined,
  isSingleSided: boolean,
  activeView: string,
  projectTokenAmount: { amount: FixedInt<number>; symbol: string | undefined } | null,
  ethTokenAmount: { amount: FixedInt<number>; symbol: string | undefined } | null,
  nativeTokenAmount: { amount: FixedInt<number>; symbol: string | undefined } | null
): string | null => {
  if (!projectAmount) return null;
  
  const projectAmountWei = BigInt(parseFloat(projectAmount) * Math.pow(10, 18));
  
  if ((projectTokenBalance ?? 0n) < projectAmountWei) {
    return `Insufficient ${projectToken.symbol} balance. You have ${formatTokenAmountWithFixedInt(projectTokenAmount)} ${projectToken.symbol}`;
  }
  
  if (!isSingleSided && nativeAmount) {
    const nativeAmountWei = BigInt(parseFloat(nativeAmount) * Math.pow(10, 18));
    
    // Use ETH balance for LP section, WETH balance for other sections
    const relevantNativeBalance = activeView === 'lp' ? (ethBalance ?? 0n) : (nativeTokenBalance ?? 0n);
    const relevantNativeAmount = activeView === 'lp' ? ethTokenAmount : nativeTokenAmount;
    const relevantNativeSymbol = getNativeTokenDisplaySymbolForBalance(projectToken, projectToken.chainId, activeView);
    
    if (relevantNativeBalance < nativeAmountWei) {
      return `Insufficient ${relevantNativeSymbol} balance. You have ${formatTokenAmountWithFixedInt(relevantNativeAmount)} ${relevantNativeSymbol}`;
    }
  }
  
  return null;
}; 