import { Pool, computePoolAddress, FeeAmount } from '@uniswap/v3-sdk'
import { Token } from '@uniswap/sdk-core'
import { Address, PublicClient } from 'viem'
import { UNISWAP_V3_FACTORY_ADDRESSES } from '@/constants'
import JSBI from 'jsbi'

// Pool ABI for getting pool data
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
] as const

export interface PoolState {
  exists: boolean
  initialized: boolean
  liquidity: bigint
  sqrtPriceX96: bigint
  tick: number
}

/**
 * Compute the pool address for a given token pair and fee
 */
export function computePoolAddressForTokens(
  token0: Token,
  token1: Token,
  fee: FeeAmount,
  chainId: number
): Address {
  const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainId]
  if (!factoryAddress) {
    throw new Error(`No factory address found for chain ${chainId}`)
  }

  return computePoolAddress({
    factoryAddress,
    tokenA: token0,
    tokenB: token1,
    fee,
  }) as Address
}

/**
 * Check if a pool exists and get its state
 */
export async function getPoolState(
  poolAddress: Address,
  publicClient: PublicClient,
  token0?: Token,
  token1?: Token
): Promise<PoolState> {
  try {
    const [liquidity, slot0] = await Promise.all([
      publicClient.readContract({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'liquidity',
      }),
      publicClient.readContract({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'slot0',
      }),
    ])

    const sqrtPriceX96 = BigInt(slot0[0])
    const tick = Number(slot0[1])

    // Log token addresses when pool is found
    if (token0 && token1) {
      console.log('🏊 Pool found with tokens:', {
        poolAddress,
        token0: {
          symbol: token0.symbol,
          address: token0.address,
          decimals: token0.decimals
        },
        token1: {
          symbol: token1.symbol,
          address: token1.address,
          decimals: token1.decimals
        },
        liquidity: liquidity.toString(),
        tick,
        sqrtPriceX96: sqrtPriceX96.toString()
      })
    }

    return {
      exists: true,
      initialized: sqrtPriceX96 > 0n,
      liquidity: BigInt(liquidity),
      sqrtPriceX96,
      tick,
    }
  } catch (error) {
    // Pool doesn't exist or contract call failed
    return {
      exists: false,
      initialized: false,
      liquidity: 0n,
      sqrtPriceX96: 0n,
      tick: 0,
    }
  }
}

/**
 * Create a Pool instance from token pair and fee
 */
export async function createPoolInstance(
  token0: Token,
  token1: Token,
  fee: FeeAmount,
  publicClient: PublicClient
): Promise<Pool | null> {
  const poolAddress = computePoolAddressForTokens(token0, token1, fee, token0.chainId)
  const poolState = await getPoolState(poolAddress, publicClient, token0, token1)

  if (!poolState.exists || !poolState.initialized) {
    return null
  }

  return new Pool(
    token0,
    token1,
    fee,
    poolState.sqrtPriceX96.toString(),
    poolState.liquidity.toString(),
    poolState.tick
  )
}

/**
 * Check if a pool is ready for single-sided liquidity
 */
export function isPoolReadyForSingleSided(pool: Pool): boolean {
  return JSBI.greaterThan(pool.liquidity, JSBI.BigInt(0)) && pool.tickCurrent !== 0
}

/**
 * Get current pool price from pool address
 */
export async function getPoolPrice(
  poolAddress: Address,
  publicClient: PublicClient,
  token0: Token,
  token1: Token
): Promise<{ tokensPerEth: number; ethPerToken: number } | null> {
  try {
    const slot0 = await publicClient.readContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'slot0',
    });

    const sqrtPriceX96 = BigInt(slot0[0]);
    const tick = Number(slot0[1]);

    // Determine which token is the project token (assuming it's the one with higher address)
    const token0IsProject = token0.address.toLowerCase() < token1.address.toLowerCase();
    const projectToken = token0IsProject ? token0 : token1;
    const nativeToken = token0IsProject ? token1 : token0;
    
    // Calculate price from tick using Uniswap V3 formula (more accurate)
    const price = 1.0001 ** tick;
    
    // Adjust for token decimals
    const decimalAdjustment = 10 ** (projectToken.decimals - nativeToken.decimals);
    const adjustedPrice = price * decimalAdjustment;
    
    // Calculate both directions
    const tokensPerEth = token0IsProject ? adjustedPrice : 1 / adjustedPrice;
    const ethPerToken = 1 / tokensPerEth;
    
    console.log('📈 Pool Price Information:', {
      poolAddress,
      tickData: {
        currentTick: tick,
        sqrtPriceX96: sqrtPriceX96.toString(),
        priceFromTick: price,
        adjustedPrice,
      },
      priceRelation: {
        [`${projectToken.symbol} per 1 ${nativeToken.symbol}`]: tokensPerEth,
        [`${nativeToken.symbol} per 1 ${projectToken.symbol}`]: ethPerToken,
      },
      tokenOrder: {
        token0: token0.symbol,
        token1: token1.symbol,
        projectToken: projectToken.symbol,
        nativeToken: nativeToken.symbol,
      },
      decimals: {
        token0: token0.decimals,
        token1: token1.decimals,
        adjustment: decimalAdjustment,
      },
    });
    
    return { tokensPerEth, ethPerToken };
  } catch (error) {
    console.error('Error getting pool price:', error);
    return null;
  }
} 