import { Token, Percent } from '@uniswap/sdk-core'
import { Pool, FeeAmount, Position, nearestUsableTick } from '@uniswap/v3-sdk'
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
  // JB token B price for pool initialization
  tokenBPrice?: bigint
}

export interface PoolAndPositionResult {
  poolAddress: Address
  positionHash: string
  isNewPool: boolean
}

/**
 * Helper function to calculate expected price from token amounts
 * This is useful for testing and validation
 */
export function calculateExpectedPriceFromAmounts(
  amount0: bigint,
  amount1: bigint,
  decimals0: number,
  decimals1: number
): number {
  const amount0Float = Number(amount0) / Math.pow(10, decimals0)
  const amount1Float = Number(amount1) / Math.pow(10, decimals1)
  
  // Price = amount1 / amount0
  return amount1Float / amount0Float
}

/**
 * Helper function to create pool parameters with JB token B price
 * This makes it easier to use the JB token B price for pool initialization
 * 
 * Example usage:
 * ```typescript
 * const tokenBPrice = useTokenBPrice()
 * const params = createPoolParamsWithTokenBPrice({
 *   token0, token1, fee, amount0, amount1, recipient, walletClient, publicClient, account
 * }, tokenBPrice)
 * await createPoolAndMintFirstPositionWithAmounts(params)
 * ```
 */
export function createPoolParamsWithTokenBPrice(
  baseParams: Omit<CreatePoolAndPositionParams, 'tokenBPrice'>,
  tokenBPrice: bigint
): CreatePoolAndPositionParams {
  return {
    ...baseParams,
    tokenBPrice
  }
}

/**
 * Create pool and mint first position using V3 SDK's built-in price calculation
 * The SDK calculates the initial price based on the provided token amounts
 */
export async function createPoolAndMintFirstPositionWithAmounts({
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
  tokenBPrice
}: Omit<CreatePoolAndPositionParams, 'initialPrice'>): Promise<PoolAndPositionResult> {
  
  console.log('🏗️ Creating pool with V3 SDK price calculation:', {
    token0: { symbol: token0.symbol, amount: amount0.toString() },
    token1: { symbol: token1.symbol, amount: amount1.toString() },
    fee
  })
  
  // Check if pool exists
  const poolExists = await checkPoolExists(token0, token1, fee, publicClient)
  
  if (poolExists) {
    throw new Error('Pool already exists. Use addLiquidityToExistingPool instead.')
  }
  
  // Get the price of token B in terms of token A
  console.log('🔍 Pool management tokenBPrice debug:', {
    tokenBPrice: tokenBPrice,
    tokenBPriceType: typeof tokenBPrice,
    tokenBPriceString: tokenBPrice?.toString(),
    isUndefined: tokenBPrice === undefined,
    isNull: tokenBPrice === null
  });

  const jbTokenBPrice = tokenBPrice || 1n
  
  console.log('📊 JB Token B Price Analysis:', {
    tokenBPrice: jbTokenBPrice.toString(),
    token0Symbol: token0.symbol,
    token1Symbol: token1.symbol,
    isUsingDefault: !tokenBPrice,
    originalTokenBPrice: tokenBPrice?.toString() || 'undefined'
  })
  
  // Calculate the tick from the JB token B price
  // price = 1.0001^tick
  // tick = log(price) / log(1.0001)
  const tick = Math.floor(Math.log(Number(jbTokenBPrice)) / Math.log(1.0001))
  
  console.log('🧮 Price calculation details:', {
    jbTokenBPrice: jbTokenBPrice.toString(),
    jbTokenBPriceNumber: Number(jbTokenBPrice),
    calculatedTick: tick,
    isValidTick: tick >= -887272 && tick <= 887272
  });

  // Calculate sqrtPriceX96 from tick
  // sqrtPriceX96 = sqrt(price) * 2^96
  const sqrtPrice = Math.sqrt(Number(jbTokenBPrice))
  let sqrtPriceX96 = BigInt(Math.floor(sqrtPrice * Math.pow(2, 96)))
  
  console.log('📐 SqrtPrice calculation:', {
    sqrtPrice,
    sqrtPriceX96: sqrtPriceX96.toString(),
    sqrtPriceX96Hex: '0x' + sqrtPriceX96.toString(16)
  });

  // Validate the calculated price is reasonable
  if (tick < -887272 || tick > 887272) {
    console.warn('⚠️ Calculated tick is out of bounds, using tick 0 as fallback')
    sqrtPriceX96 = BigInt('79228162514264337593543950336') // sqrt(1) * 2^96
    console.log('📊 Using fallback price:', {
      sqrtPriceX96: sqrtPriceX96.toString(),
      tick: 0
    })
  } else {
    console.log('📊 Calculated optimal price from JB token B price:', {
      sqrtPriceX96: sqrtPriceX96.toString(),
      tick,
      tokenBPrice: jbTokenBPrice.toString(),
      sqrtPrice
    })
  }
  
  // Create and initialize pool with the calculated price
  const poolAddress = await createAndInitializePool({
    token0,
    token1,
    fee,
    initialPrice: sqrtPriceX96,
    walletClient,
    publicClient,
    account
  })
  
  // Create pool instance after initialization
  const pool = await createPoolInstance(token0, token1, fee, publicClient)
  if (!pool) {
    throw new Error('Failed to create pool instance after initialization')
  }
  
  // Create the actual position with the real pool
  const position = Position.fromAmounts({
    pool,
    tickLower: nearestUsableTick(-887272, pool.tickSpacing), // MIN_TICK
    tickUpper: nearestUsableTick(887272, pool.tickSpacing),  // MAX_TICK
    amount0: amount0.toString(),
    amount1: amount1.toString(),
    useFullPrecision: true
  })
  
  console.log('🎯 Created position with calculated amounts:', {
    liquidity: position.liquidity.toString(),
    amount0: position.amount0.toSignificant(6),
    amount1: position.amount1.toSignificant(6),
    tickLower: position.tickLower,
    tickUpper: position.tickUpper
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
  
  console.log('✅ Pool created and first position minted:', {
    poolAddress,
    positionHash,
    isNewPool: true
  })
  
  return {
    poolAddress,
    positionHash,
    isNewPool: true
  }
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