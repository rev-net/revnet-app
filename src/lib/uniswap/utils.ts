import { parseEther as viemParseEther } from 'viem'
import { Token } from '@uniswap/sdk-core'
import { Address, PublicClient } from 'viem'
import { useState, useEffect } from 'react'

// Add the POOL_ABI for slot0
const POOL_ABI = [
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

/**
 * Calculate sqrtPriceX96 from a price (tokens per ETH)
 */
export function calculateSqrtPriceX96(price: number): bigint {
  const tokensPerNative = 1 / price;
  const sqrt = Math.sqrt(tokensPerNative);
  return BigInt(Math.floor(sqrt * 2 ** 96));
}

/**
 * Safe parseEther with fallback for different token decimals
 */
export function safeParseEther(amount: string, decimals: number = 18): bigint {
  try {
    return viemParseEther(amount);
  } catch (error) {
    console.warn('parseEther failed, using fallback conversion:', error);
    return BigInt(Math.floor(parseFloat(amount) * 10 ** decimals));
  }
}

/**
 * Convert price to tick (proper Uniswap V3 calculation)
 */
export function priceToTick(price: number, projectTokenDecimals: number, nativeTokenDecimals: number): number {
  // Proper Uniswap V3 price to tick calculation
  return Math.floor(Math.log(price) / Math.log(1.0001));
}

/**
 * Convert tick to price (proper Uniswap V3 calculation)
 */
export function tickToPrice(tick: number, projectTokenDecimals: number, nativeTokenDecimals: number): number {
  // Proper Uniswap V3 tick to price calculation
  // For negative ticks, this should give us a small number
  const price = 1.0001 ** tick;
  
  console.log('🔍 tickToPrice calculation:', {
    tick,
    price,
    '1.0001^tick': 1.0001 ** tick
  });
  
  return price;
}

/**
 * Format tick range to price range for display
 */
export function formatTickRangeToPriceRange(
  tickLower: number,
  tickUpper: number,
  projectToken: Token,
  nativeToken: Token,
  format: 'tokensPerNative' | 'nativePerToken' = 'nativePerToken'
): string {
  try {
    // Check if this is a full-range position
    const isFullRange = tickLower <= -887200 && tickUpper >= 887200;
    
    if (isFullRange) {
      return `Full Range (0 to ∞ ${projectToken.symbol}/${nativeToken.symbol})`;
    }
    
    // Convert ticks to prices
    const lowerPrice = tickToPrice(tickLower, projectToken.decimals, nativeToken.decimals);
    const upperPrice = tickToPrice(tickUpper, projectToken.decimals, nativeToken.decimals);
    
    // Check for extreme values that would be unreadable
    if (lowerPrice < 1e-10 || upperPrice > 1e10) {
      return `Range: ${tickLower} to ${tickUpper} (ticks)`;
    }
    
    if (format === 'nativePerToken') {
      // For single-sided liquidity, show native token per project token
      return `${lowerPrice.toFixed(6)} - ${upperPrice.toFixed(6)} ${nativeToken.symbol} per 1 ${projectToken.symbol}`;
    } else {
      // Show tokens per native token
      const token0IsProject = projectToken.address.toLowerCase() < nativeToken.address.toLowerCase();
      if (token0IsProject) {
        return `${lowerPrice.toFixed(6)} - ${upperPrice.toFixed(6)} ${projectToken.symbol}/${nativeToken.symbol}`;
      } else {
        return `${lowerPrice.toFixed(6)} - ${upperPrice.toFixed(6)} ${nativeToken.symbol}/${projectToken.symbol}`;
      }
    }
  } catch (error) {
    console.error('Error formatting tick range to price range:', error);
    return `${tickLower} to ${tickUpper} (ticks)`;
  }
}

/**
 * Get current pool price from slot0
 */
export async function getPoolPrice(
  poolAddress: Address,
  projectToken: Token,
  nativeToken: Token,
  publicClient: PublicClient
): Promise<{ tokensPerEth: number; ethPerToken: number; tick: number } | null> {
  try {
    const slot0 = await publicClient.readContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'slot0',
    });

    const sqrtPriceX96 = BigInt(slot0[0]);
    const tick = Number(slot0[1]);

    const token0IsProject = projectToken.address.toLowerCase() < nativeToken.address.toLowerCase();
    
    // Calculate tokens per ETH directly from sqrtPriceX96
    const sqrt = Number(sqrtPriceX96) / 2 ** 96;
    const tokensPerEth = sqrt ** 2; // This is already tokens per ETH
    const ethPerToken = 1 / tokensPerEth;
    
    console.log('📈 Pool Price Information:', {
      tickData: {
        currentTick: tick,
        sqrt: sqrt,
        sqrtPriceX96: sqrtPriceX96.toString(),
        tokensPerEth: tokensPerEth,
      },
      priceRelation: {
        [`${projectToken.symbol} per 1 ${nativeToken.symbol}`]: tokensPerEth,
        [`${nativeToken.symbol} per 1 ${projectToken.symbol}`]: ethPerToken,
      },
      tokenOrder: {
        token0: token0IsProject ? projectToken.symbol : nativeToken.symbol,
        token1: token0IsProject ? nativeToken.symbol : projectToken.symbol,
      },
      note: `tokensPerEth = ${projectToken.symbol} per 1 ${nativeToken.symbol} (directly from sqrtPriceX96)`,
    });
    
    return {
      tokensPerEth,
      ethPerToken,
      tick
    };
  } catch (error) {
    console.error('Error getting pool price:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    return null;
  }
}

/**
 * Hook for getting and auto-updating pool price
 */
export function usePoolPrice(
  poolAddress: Address | null,
  projectToken: Token | null,
  nativeToken: Token | null,
  publicClient: PublicClient | null | undefined,
  blockNumber?: number
) {
  const [priceInfo, setPriceInfo] = useState<{
    tokensPerEth: number | null;
    ethPerToken: number | null;
    tick: number | null;
  }>({
    tokensPerEth: null,
    ethPerToken: null,
    tick: null
  });

  useEffect(() => {
    const fetchPrice = async () => {
      if (!poolAddress || !projectToken || !nativeToken || !publicClient) return;

      const result = await getPoolPrice(poolAddress, projectToken, nativeToken, publicClient);
      if (result) {
        setPriceInfo({
          tokensPerEth: result.tokensPerEth,
          ethPerToken: result.ethPerToken,
          tick: result.tick
        });
      }
    };

    fetchPrice();
  }, [poolAddress, projectToken, nativeToken, publicClient, blockNumber]);

  return priceInfo;
} 