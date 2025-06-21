import { Token, Percent } from '@uniswap/sdk-core'
import { Pool, FeeAmount } from '@uniswap/v3-sdk'
import { Address, WalletClient, PublicClient } from 'viem'
import JSBI from 'jsbi'
import { POSITION_MANAGER_ADDRESSES } from '@/constants'
import { createPoolInstance, getPoolState, computePoolAddressForTokens } from './pool'
import { createAndInitializePool, checkPoolExists } from './factory'
import { createFullRangePosition, createSingleSidedPosition, mintPosition } from './position'

export interface CreatePoolAndPositionParams {
  token0: Token
  token1: Token
  fee: FeeAmount
  amount0: bigint
  amount1: bigint
  initialPrice?: bigint // sqrtPriceX96 - only needed for new pools
  recipient: Address
  walletClient: WalletClient
  publicClient: PublicClient
  account: Address
  slippageTolerance?: Percent
  deadline?: number
}

export interface PoolAndPositionResult {
  poolAddress: Address
  positionHash: string
  isNewPool: boolean
}

/**
 * High-level function to create a pool (if needed) and mint the first position
 */
export async function createPoolAndMintFirstPosition({
  token0,
  token1,
  fee,
  amount0,
  amount1,
  initialPrice,
  recipient,
  walletClient,
  publicClient,
  account,
  slippageTolerance = new Percent(50, 10_000), // 0.5%
  deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes
}: CreatePoolAndPositionParams): Promise<PoolAndPositionResult> {
  
  // Check if pool exists
  const poolExists = await checkPoolExists(token0, token1, fee, publicClient)
  
  let poolAddress: Address
  let pool: Pool | null = null
  
  if (!poolExists) {
    // Pool doesn't exist, create it
    if (!initialPrice) {
      throw new Error('Initial price is required when creating a new pool')
    }
    
    poolAddress = await createAndInitializePool({
      token0,
      token1,
      fee,
      initialPrice,
      walletClient,
      publicClient,
      account
    })
    
    // Create pool instance after initialization
    pool = await createPoolInstance(token0, token1, fee, publicClient)
    if (!pool) {
      throw new Error('Failed to create pool instance after initialization')
    }
  } else {
    // Pool exists, get its address and instance
    poolAddress = computePoolAddressForTokens(token0, token1, fee, token0.chainId)
    pool = await createPoolInstance(token0, token1, fee, publicClient)
    if (!pool) {
      throw new Error('Pool exists but is not initialized')
    }
  }
  
  // Create position - for first liquidity, use full range
  const position = createFullRangePosition({
    pool,
    amount0: amount0.toString(),
    amount1: amount1.toString()
  })
  
  // Mint the position
  const positionHash = await mintPosition({
    position,
    recipient,
    deadline,
    slippageTolerance,
    walletClient,
    account,
    positionManagerAddress: POSITION_MANAGER_ADDRESSES[token0.chainId]
  })
  
  return {
    poolAddress,
    positionHash,
    isNewPool: !poolExists
  }
}

/**
 * Add liquidity to an existing pool
 */
export async function addLiquidityToExistingPool({
  token0,
  token1,
  fee,
  amount0,
  amount1,
  recipient,
  walletClient,
  publicClient,
  account,
  slippageTolerance = new Percent(50, 10_000), // 0.5%
  deadline = Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
  useSingleSided = false
}: Omit<CreatePoolAndPositionParams, 'initialPrice'> & { useSingleSided?: boolean }): Promise<PoolAndPositionResult> {
  
  // Get pool instance
  const pool = await createPoolInstance(token0, token1, fee, publicClient)
  if (!pool) {
    throw new Error('Pool does not exist or is not initialized')
  }
  
  const poolAddress = computePoolAddressForTokens(token0, token1, fee, token0.chainId)
  
  // Create position based on whether we want single-sided or not
  const position = useSingleSided 
    ? createSingleSidedPosition({
        pool,
        amount0: amount0.toString(),
        amount1: amount1.toString()
      })
    : createFullRangePosition({
        pool,
        amount0: amount0.toString(),
        amount1: amount1.toString()
      })
  
  // Mint the position
  const positionHash = await mintPosition({
    position,
    recipient,
    deadline,
    slippageTolerance,
    walletClient,
    account,
    positionManagerAddress: POSITION_MANAGER_ADDRESSES[token0.chainId]
  })
  
  return {
    poolAddress,
    positionHash,
    isNewPool: false
  }
}

/**
 * Check if a pool is ready for single-sided liquidity
 */
export async function isPoolReadyForSingleSided(
  token0: Token,
  token1: Token,
  fee: FeeAmount,
  publicClient: PublicClient
): Promise<boolean> {
  const pool = await createPoolInstance(token0, token1, fee, publicClient)
  if (!pool) {
    return false
  }
  
  return JSBI.greaterThan(pool.liquidity, JSBI.BigInt(0)) && pool.tickCurrent !== 0
}

/**
 * Get pool information
 */
export async function getPoolInfo(
  token0: Token,
  token1: Token,
  fee: FeeAmount,
  publicClient: PublicClient
) {
  const poolAddress = computePoolAddressForTokens(token0, token1, fee, token0.chainId)
  const poolState = await getPoolState(poolAddress, publicClient)
  const pool = await createPoolInstance(token0, token1, fee, publicClient)
  
  return {
    poolAddress,
    poolState,
    pool,
    exists: poolState.exists,
    initialized: poolState.initialized,
    readyForSingleSided: pool ? (JSBI.greaterThan(pool.liquidity, JSBI.BigInt(0)) && pool.tickCurrent !== 0) : false
  }
} 