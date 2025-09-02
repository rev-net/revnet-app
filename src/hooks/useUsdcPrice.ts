import { useQuery } from "wagmi/query";

/**
 * Returns the price of USDC in USD.
 * Since USDC is pegged to USD, this always returns 1.
 * In a real implementation, you might want to fetch this from a price oracle
 * to account for any potential depegging events.
 */
export function useUsdcPrice() {
  return useQuery({
    queryKey: ["usdcPrice"],
    queryFn: async () => {
      // In a real implementation, you might fetch from a price oracle
      // For now, return 1 since USDC is pegged to USD
      return 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
