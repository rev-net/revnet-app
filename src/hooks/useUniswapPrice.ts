import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { Address } from "viem";
import { UNISWAP_ABIS, UNISWAP_CONSTANTS } from "@/lib/uniswap";
import { calculateTokensPerEth, calculateEthPerToken, tickToPrice } from "@/lib/price";

interface UseUniswapPriceParams {
  poolAddress: Address | null;
  token0Address: Address;
  token1Address: Address;
}

interface UseUniswapPriceReturn {
  currentPrice: number | null;
  sqrtPriceX96: bigint | null;
  tick: number | null;
  tokensPerEth: number | null;
  ethPerToken: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUniswapPrice({
  poolAddress,
  token0Address,
  token1Address
}: UseUniswapPriceParams): UseUniswapPriceReturn {
  const publicClient = usePublicClient();
  
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [sqrtPriceX96, setSqrtPriceX96] = useState<bigint | null>(null);
  const [tick, setTick] = useState<number | null>(null);
  const [tokensPerEth, setTokensPerEth] = useState<number | null>(null);
  const [ethPerToken, setEthPerToken] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current price from pool
  const fetchPrice = useCallback(async () => {
    if (!publicClient || !poolAddress) {
      setError("Public client or pool address not available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const slot0 = await publicClient.readContract({
        address: poolAddress,
        abi: UNISWAP_ABIS.POOL,
        functionName: "slot0"
      });

      const sqrtPriceX96Value = BigInt(slot0[0]);
      const tickValue = Number(slot0[1]);

      setSqrtPriceX96(sqrtPriceX96Value);
      setTick(tickValue);

      // Calculate prices
      const tokensPerEthValue = calculateTokensPerEth(sqrtPriceX96Value);
      const ethPerTokenValue = calculateEthPerToken(sqrtPriceX96Value);

      setTokensPerEth(tokensPerEthValue);
      setEthPerToken(ethPerTokenValue);

      // Determine which token is ETH/WETH and set current price accordingly
      // This assumes token1 is always ETH/WETH (common pattern)
      const isToken0Eth = token0Address.toLowerCase() < token1Address.toLowerCase();
      const priceValue = isToken0Eth ? ethPerTokenValue : tokensPerEthValue;
      
      setCurrentPrice(priceValue);

      console.log("📈 Pool Price Information:", {
        tickData: {
          currentTick: tickValue,
          sqrtPriceX96: sqrtPriceX96Value.toString(),
          tokensPerEth: tokensPerEthValue,
          ethPerToken: ethPerTokenValue,
        },
        priceRelation: {
          [`tokens per 1 ETH`]: tokensPerEthValue,
          [`ETH per 1 token`]: ethPerTokenValue,
        },
        tokenOrder: {
          token0: isToken0Eth ? "ETH" : "TOKEN",
          token1: isToken0Eth ? "TOKEN" : "ETH",
        },
        currentPrice: priceValue,
      });

    } catch (err) {
      console.error("Error fetching pool price:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch pool price");
      
      // Set fallback values
      setCurrentPrice(UNISWAP_CONSTANTS.FALLBACK_PRICE);
      setTokensPerEth(UNISWAP_CONSTANTS.FALLBACK_PRICE);
      setEthPerToken(1 / UNISWAP_CONSTANTS.FALLBACK_PRICE);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, poolAddress, token0Address, token1Address]);

  // Refetch price
  const refetch = useCallback(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Fetch price on mount and when dependencies change
  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  return {
    currentPrice,
    sqrtPriceX96,
    tick,
    tokensPerEth,
    ethPerToken,
    isLoading,
    error,
    refetch,
  };
}

// Hook for fetching price from tick (useful for positions)
export function usePriceFromTick(tick: number | null) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (tick !== null) {
      const priceFromTick = tickToPrice(tick);
      setPrice(priceFromTick);
    } else {
      setPrice(null);
    }
  }, [tick]);

  return price;
}

// Hook for calculating price from sqrtPriceX96
export function usePriceFromSqrtPriceX96(sqrtPriceX96: bigint | null) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (sqrtPriceX96 !== null) {
      const priceFromSqrt = calculateTokensPerEth(sqrtPriceX96);
      setPrice(priceFromSqrt);
    } else {
      setPrice(null);
    }
  }, [sqrtPriceX96]);

  return price;
}
