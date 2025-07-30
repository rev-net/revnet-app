import { JBChainId } from "juice-sdk-core";
import { useEtherPrice } from "juice-sdk-react";
import { formatUnits } from "viem";

/**
 * Hook to calculate aggregated balance totals across all chains
 * Converts all balances to USD for display
 */
export function useAggregatedBalance(
  tokenMap: Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }> | undefined,
  surpluses: Array<{ surplus: bigint; chainId: JBChainId; projectId: bigint }> | undefined,
  isAllUsdc: boolean,
  isAllEth: boolean,
  targetDecimals: number
) {
  const { data: ethPrice } = useEtherPrice();

  // Convert surpluses to a common format
  const convertedSurpluses = surpluses?.map((surplus) => {
    const tokenConfig = tokenMap?.[surplus.chainId];
    if (!tokenConfig || !surplus.surplus) return { ...surplus, convertedSurplus: 0n };

    // If all chains use the same token type, we can aggregate directly
    if (isAllUsdc || isAllEth) {
      return { ...surplus, convertedSurplus: surplus.surplus };
    } else {
      // For mixed tokens, we'd need price conversion
      // TODO: Add proper currency conversion using price oracles
      return { ...surplus, convertedSurplus: surplus.surplus };
    }
  }) || [];

  // Calculate total amount across all chains
  const totalAmount = convertedSurpluses?.reduce((acc, curr) => {
    return acc + BigInt(curr.convertedSurplus || 0);
  }, 0n) ?? 0n;

  // Convert to USD: USDC is already USD, ETH needs price conversion
  const usdValue = isAllUsdc
    ? totalAmount ? Number(formatUnits(totalAmount, targetDecimals)) : 0
    : totalAmount && ethPrice
    ? Number(formatUnits(totalAmount, targetDecimals)) * ethPrice
    : 0;

  const formattedUsd = usdValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    convertedSurpluses,
    totalAmount,
    usdValue,
    formattedUsd,
    ethPrice,
  };
} 