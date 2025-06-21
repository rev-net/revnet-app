import { Position, nearestUsableTick, NonfungiblePositionManager, MintOptions } from '@uniswap/v3-sdk'
import { Pool, FeeAmount } from '@uniswap/v3-sdk'
import { Token, Percent, BigintIsh } from '@uniswap/sdk-core'
import { Address, WalletClient } from 'viem'
import { computePoolAddressForTokens } from './pool'

export interface CreatePositionParams {
  pool: Pool
  amount0: BigintIsh
  amount1: BigintIsh
  tickLower?: number
  tickUpper?: number
  useFullPrecision?: boolean
}

export interface MintPositionParams {
  position: Position
  recipient: Address
  deadline: number
  slippageTolerance: Percent
  walletClient: WalletClient
  account: Address
  positionManagerAddress: Address
}

/**
 * Create a position from amounts with automatic tick range calculation
 */
export function createPositionFromAmounts({
  pool,
  amount0,
  amount1,
  tickLower,
  tickUpper,
  useFullPrecision = true
}: CreatePositionParams): Position {
  // If tick range is not provided, calculate it around the current price
  if (tickLower === undefined || tickUpper === undefined) {
    const currentTick = nearestUsableTick(pool.tickCurrent, pool.tickSpacing)
    const tickSpacing = pool.tickSpacing
    
    tickLower = currentTick - tickSpacing * 2
    tickUpper = currentTick + tickSpacing * 2
  }

  return Position.fromAmounts({
    pool,
    tickLower,
    tickUpper,
    amount0,
    amount1,
    useFullPrecision,
  })
}

/**
 * Create a position for the first liquidity in a pool (full range)
 */
export function createFullRangePosition({
  pool,
  amount0,
  amount1,
  useFullPrecision = true
}: Omit<CreatePositionParams, 'tickLower' | 'tickUpper'>): Position {
  // For first liquidity, use the full range
  const tickLower = nearestUsableTick(-887272, pool.tickSpacing) // MIN_TICK + 1
  const tickUpper = nearestUsableTick(887272, pool.tickSpacing)  // MAX_TICK - 1

  return Position.fromAmounts({
    pool,
    tickLower,
    tickUpper,
    amount0,
    amount1,
    useFullPrecision,
  })
}

/**
 * Create a position that avoids the current price (for single-sided liquidity)
 */
export function createSingleSidedPosition({
  pool,
  amount0,
  amount1,
  useFullPrecision = true
}: Omit<CreatePositionParams, 'tickLower' | 'tickUpper'>): Position {
  const currentTick = pool.tickCurrent
  const tickSpacing = pool.tickSpacing
  
  // Create a range that doesn't cross the current price
  // This ensures the position is single-sided
  const rangeWidth = tickSpacing * 100 // ~20% range
  
  let tickLower: number
  let tickUpper: number
  
  // Determine which side of the current price to place the range
  // For now, we'll place it above the current price
  tickLower = nearestUsableTick(currentTick + tickSpacing, tickSpacing)
  tickUpper = nearestUsableTick(currentTick + rangeWidth, tickSpacing)

  return Position.fromAmounts({
    pool,
    tickLower,
    tickUpper,
    amount0,
    amount1,
    useFullPrecision,
  })
}

/**
 * Get the call parameters for minting a position
 */
export function getMintCallParameters({
  position,
  recipient,
  deadline,
  slippageTolerance
}: Omit<MintPositionParams, 'walletClient' | 'account' | 'positionManagerAddress'>) {
  const mintOptions: MintOptions = {
    recipient,
    deadline,
    slippageTolerance,
  }

  return NonfungiblePositionManager.addCallParameters(position, mintOptions)
}

// Add the correct MINT_ABI
const MINT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        components: [
          { name: 'token0', type: 'address' },
          { name: 'token1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickLower', type: 'int24' },
          { name: 'tickUpper', type: 'int24' },
          { name: 'amount0Desired', type: 'uint256' },
          { name: 'amount1Desired', type: 'uint256' },
          { name: 'amount0Min', type: 'uint256' },
          { name: 'amount1Min', type: 'uint256' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' }
        ],
        name: 'params',
        type: 'tuple'
      }
    ],
    outputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' }
    ]
  }
] as const

// Update mintPosition function
export async function mintPosition({
  position,
  recipient,
  deadline,
  slippageTolerance,
  walletClient,
  account,
  positionManagerAddress
}: MintPositionParams): Promise<string> {
  // Calculate amounts from position
  const amount0Desired = BigInt(position.amount0.quotient.toString())
  const amount1Desired = BigInt(position.amount1.quotient.toString())
  
  // Calculate minimum amounts based on slippage
  const amount0Min = amount0Desired - (amount0Desired * BigInt(slippageTolerance.numerator.toString()) / BigInt(slippageTolerance.denominator.toString()))
  const amount1Min = amount1Desired - (amount1Desired * BigInt(slippageTolerance.numerator.toString()) / BigInt(slippageTolerance.denominator.toString()))

  const hash = await walletClient.writeContract({
    address: positionManagerAddress,
    abi: MINT_ABI,
    functionName: 'mint',
    args: [{
      token0: position.pool.token0.address as `0x${string}`,
      token1: position.pool.token1.address as `0x${string}`,
      fee: position.pool.fee,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      amount0Desired,
      amount1Desired,
      amount0Min,
      amount1Min,
      recipient,
      deadline: BigInt(deadline)
    }],
    account,
    chain: undefined
  })

  return hash
}

/**
 * Calculate the optimal amounts for a given position
 */
export function calculateOptimalAmounts(
  pool: Pool,
  amount0Desired: BigintIsh,
  amount1Desired: BigintIsh,
  tickLower: number,
  tickUpper: number
): { amount0: bigint; amount1: bigint } {
  const position = Position.fromAmounts({
    pool,
    tickLower,
    tickUpper,
    amount0: amount0Desired,
    amount1: amount1Desired,
    useFullPrecision: true,
  })

  return {
    amount0: BigInt(position.amount0.quotient.toString()),
    amount1: BigInt(position.amount1.quotient.toString()),
  }
}

/**
 * Check if a position is in range
 */
export function isPositionInRange(position: Position): boolean {
  return position.pool.tickCurrent >= position.tickLower && 
         position.pool.tickCurrent <= position.tickUpper
}

/**
 * Get the liquidity value of a position
 */
export function getPositionLiquidity(position: Position): bigint {
  return BigInt(position.liquidity.toString())
}

// Position Manager ABI for fetching positions
const POSITION_MANAGER_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'positions',
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' }
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'params', type: 'tuple' }
    ],
    name: 'collect',
    outputs: [
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'params', type: 'tuple' }
    ],
    name: 'decreaseLiquidity',
    outputs: [
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' }
    ],
    stateMutability: 'payable',
    type: 'function'
  }
] as const

export interface UserPosition {
  tokenId: bigint
  token0: Address
  token1: Address
  fee: number
  tickLower: number
  tickUpper: number
  liquidity: bigint
  tokensOwed0: bigint
  tokensOwed1: bigint
  nonce: bigint
  operator: Address
  feeGrowthInside0LastX128: bigint
  feeGrowthInside1LastX128: bigint
}

export interface CollectFeesParams {
  tokenId: bigint
  recipient: Address
  amount0Max: bigint
  amount1Max: bigint
  walletClient: WalletClient
  account: Address
  positionManagerAddress: Address
}

export interface RemoveLiquidityParams {
  tokenId: bigint
  liquidity: bigint
  amount0Min: bigint
  amount1Min: bigint
  deadline: number
  recipient: Address
  walletClient: WalletClient
  account: Address
  positionManagerAddress: Address
}

/**
 * Get all positions for a user
 */
export async function getUserPositions({
  account,
  publicClient,
  chainId
}: {
  account: Address
  publicClient: any
  chainId: number
}): Promise<UserPosition[]> {
  const { POSITION_MANAGER_ADDRESSES } = await import('@/constants')
  const positionManagerAddress = POSITION_MANAGER_ADDRESSES[chainId]
  
  if (!positionManagerAddress) {
    throw new Error(`Position Manager not found for chain ${chainId}`)
  }

  console.log('🔍 Fetching user positions:', {
    account,
    chainId,
    positionManagerAddress
  })

  // Get total number of positions
  const balance = await publicClient.readContract({
    address: positionManagerAddress,
    abi: POSITION_MANAGER_ABI,
    functionName: 'balanceOf',
    args: [account]
  })

  console.log('📊 Found positions:', Number(balance))

  if (Number(balance) === 0) {
    return []
  }

  // Fetch each position
  const positionsPromises = Array.from({ length: Number(balance) }, async (_, index) => {
    const tokenId = await publicClient.readContract({
      address: positionManagerAddress,
      abi: POSITION_MANAGER_ABI,
      functionName: 'tokenOfOwnerByIndex',
      args: [account, BigInt(index)]
    })

    const position = await publicClient.readContract({
      address: positionManagerAddress,
      abi: POSITION_MANAGER_ABI,
      functionName: 'positions',
      args: [tokenId]
    })

    return {
      tokenId,
      nonce: position[0],
      operator: position[1],
      token0: position[2],
      token1: position[3],
      fee: Number(position[4]),
      tickLower: Number(position[5]),
      tickUpper: Number(position[6]),
      liquidity: position[7],
      feeGrowthInside0LastX128: position[8],
      feeGrowthInside1LastX128: position[9],
      tokensOwed0: position[10],
      tokensOwed1: position[11]
    }
  })

  const allPositions = await Promise.all(positionsPromises)
  console.log('✅ Fetched all positions:', allPositions.length)
  
  return allPositions
}

/**
 * Get positions for a specific pool
 */
export async function getPoolPositions({
  account,
  token0,
  token1,
  fee,
  publicClient
}: {
  account: Address
  token0: Token
  token1: Token
  fee: FeeAmount
  publicClient: any
}): Promise<UserPosition[]> {
  console.log('🏊 Fetching pool positions:', {
    token0: { symbol: token0.symbol, address: token0.address },
    token1: { symbol: token1.symbol, address: token1.address },
    fee
  })

  const allPositions = await getUserPositions({
    account,
    publicClient,
    chainId: token0.chainId
  })

  // Filter positions for this pool
  const poolPositions = allPositions.filter(pos => 
    (pos.token0.toLowerCase() === token0.address.toLowerCase() && 
     pos.token1.toLowerCase() === token1.address.toLowerCase() &&
     pos.fee === fee) ||
    (pos.token0.toLowerCase() === token1.address.toLowerCase() && 
     pos.token1.toLowerCase() === token0.address.toLowerCase() &&
     pos.fee === fee)
  )

  console.log('🎯 Pool positions found:', poolPositions.length)
  return poolPositions
}

/**
 * Collect fees from a position
 */
export async function collectFees({
  tokenId,
  recipient,
  amount0Max,
  amount1Max,
  walletClient,
  account,
  positionManagerAddress
}: CollectFeesParams): Promise<string> {
  console.log('💰 Collecting fees for position:', {
    tokenId: tokenId.toString(),
    recipient,
    amount0Max: amount0Max.toString(),
    amount1Max: amount1Max.toString()
  })

  const hash = await walletClient.writeContract({
    address: positionManagerAddress,
    abi: POSITION_MANAGER_ABI,
    functionName: 'collect',
    args: [{
      tokenId,
      recipient,
      amount0Max,
      amount1Max
    }],
    account,
    chain: null
  })

  console.log('✅ Fee collection transaction:', hash)
  return hash
}

/**
 * Remove liquidity from a position
 */
export async function removeLiquidity({
  tokenId,
  liquidity,
  amount0Min,
  amount1Min,
  deadline,
  recipient,
  walletClient,
  account,
  positionManagerAddress
}: RemoveLiquidityParams): Promise<string> {
  console.log('🔥 Removing liquidity from position:', {
    tokenId: tokenId.toString(),
    liquidity: liquidity.toString(),
    amount0Min: amount0Min.toString(),
    amount1Min: amount1Min.toString(),
    deadline
  })

  const hash = await walletClient.writeContract({
    address: positionManagerAddress,
    abi: POSITION_MANAGER_ABI,
    functionName: 'decreaseLiquidity',
    args: [{
      tokenId,
      liquidity,
      amount0Min,
      amount1Min,
      deadline
    }],
    account,
    chain: null
  })

  console.log('✅ Liquidity removal transaction:', hash)
  return hash
}

/**
 * Get position fees (unclaimed)
 */
export function getPositionFees(position: UserPosition): {
  amount0: bigint
  amount1: bigint
} {
  return {
    amount0: position.tokensOwed0,
    amount1: position.tokensOwed1
  }
}

/**
 * Check if position has unclaimed fees
 */
export function hasUnclaimedFees(position: UserPosition): boolean {
  return position.tokensOwed0 > 0n || position.tokensOwed1 > 0n
}

/**
 * Check if a pool has any positions (liquidity)
 */
export async function checkPoolHasPositions({
  token0,
  token1,
  fee,
  publicClient
}: {
  token0: Token
  token1: Token
  fee: FeeAmount
  publicClient: any
}): Promise<boolean> {
  try {
    const poolAddress = computePoolAddressForTokens(token0, token1, fee, token0.chainId)
    
    // Get pool liquidity
    const liquidity = await publicClient.readContract({
      address: poolAddress,
      abi: [
        {
          inputs: [],
          name: 'liquidity',
          outputs: [{ name: '', type: 'uint128' }],
          stateMutability: 'view',
          type: 'function'
        }
      ],
      functionName: 'liquidity',
    })

    const hasPositions = BigInt(liquidity) > 0n
    
    console.log('🔍 Pool liquidity check:', {
      poolAddress,
      liquidity: liquidity.toString(),
      hasPositions
    })
    
    return hasPositions
  } catch (error) {
    console.log('❌ Error checking pool positions:', error)
    return false
  }
} 