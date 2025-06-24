import { Token, Percent } from '@uniswap/sdk-core'
import { Pool, FeeAmount } from '@uniswap/v3-sdk'
import { Address, WalletClient, PublicClient } from 'viem'
import { WETH_ADDRESSES, POSITION_MANAGER_ADDRESSES } from '@/constants'
import { createPoolInstance, computePoolAddressForTokens } from './pool'
import { createFullRangePosition, createSingleSidedPosition, mintPosition } from './position'

// ERC20 ABI for approvals
const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

// WETH ABI for wrapping/unwrapping
const WETH_ABI = [
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
] as const

// Permit2 ABI for approvals
const PERMIT2_ABI = [
  {
    inputs: [
      { name: 'owner',   type: 'address' },
      { name: 'token',   type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [
      { name: 'amount',     type: 'uint160' },
      { name: 'expiration', type: 'uint48' },
      { name: 'nonce',      type: 'uint48' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'token',      type: 'address' },
      { name: 'spender',    type: 'address' },
      { name: 'amount',     type: 'uint160' },
      { name: 'expiration', type: 'uint48' }
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

export interface TokenApprovalParams {
  token: Token
  spender: Address
  amount: bigint
  walletClient: WalletClient
  publicClient: PublicClient
  account: Address
}

export interface WrapEthParams {
  amount: bigint
  walletClient: WalletClient
  publicClient: PublicClient
  account: Address
  chainId: number
}

export interface CompleteLiquidityParams {
  token0: Token
  token1: Token
  fee: FeeAmount
  amount0: bigint
  amount1: bigint
  recipient: Address
  walletClient: WalletClient
  publicClient: PublicClient
  account: Address
  slippageTolerance?: Percent
  deadline?: number
  useSingleSided?: boolean
  initialPrice?: bigint
}

export interface CompleteLiquidityResult {
  poolAddress: Address
  positionHash: string
  isNewPool: boolean
  wrappedEthAmount?: bigint
}

export interface Permit2ApprovalParams {
  token: Token
  spender: Address
  amount: bigint
  permit2Address: Address
  walletClient: WalletClient
  publicClient: PublicClient
  account: Address
}

/**
 * Check if a token needs approval and approve if necessary
 */
export async function ensureTokenApproval({
  token,
  spender,
  amount,
  walletClient,
  publicClient,
  account
}: TokenApprovalParams): Promise<void> {
  const currentAllowance = await publicClient.readContract({
    address: token.address as Address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [account, spender]
  })

  if (currentAllowance >= amount) {
    console.log(`✅ Token ${token.symbol} already has sufficient allowance`)
    return
  }

  console.log(`🔐 Approving ${token.symbol} for ${spender}...`)
  
  const approveHash = await walletClient.writeContract({
    address: token.address as Address,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [spender, amount],
    account,
    chain: null
  })

  await publicClient.waitForTransactionReceipt({ hash: approveHash })
  console.log(`✅ ${token.symbol} approval completed`)
}

/**
 * Wrap ETH to WETH if needed
 */
export async function wrapEthIfNeeded({
  amount,
  walletClient,
  publicClient,
  account,
  chainId
}: WrapEthParams): Promise<bigint> {
  const wethAddress = WETH_ADDRESSES[chainId]
  if (!wethAddress || wethAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error(`WETH address not available for chain ${chainId}`)
  }

  console.log(`🔄 Wrapping ${amount} wei to WETH...`)
  
  const wrapHash = await walletClient.writeContract({
    address: wethAddress,
    abi: WETH_ABI,
    functionName: 'deposit',
    value: amount,
    account,
    chain: null
  })

  await publicClient.waitForTransactionReceipt({ hash: wrapHash })
  console.log(`✅ Wrapped ${amount} wei to WETH`)
  
  return amount
}

/**
 * Complete liquidity provision with all necessary approvals and ETH wrapping
 */
export async function completeLiquidityProvision({
  token0,
  token1,
  fee,
  amount0,
  amount1,
  recipient,
  walletClient,
  publicClient,
  account,
  slippageTolerance = new Percent(50, 10_000),
  deadline = Math.floor(Date.now() / 1000) + 60 * 20,
  useSingleSided = false,
  initialPrice
}: CompleteLiquidityParams): Promise<CompleteLiquidityResult> {
  
  const positionManagerAddress = POSITION_MANAGER_ADDRESSES[token0.chainId]
  if (!positionManagerAddress) {
    throw new Error(`Position Manager not found for chain ${token0.chainId}`)
  }

  let wrappedEthAmount: bigint | undefined

  // Check if we need to wrap ETH for either token
  const wethAddress = WETH_ADDRESSES[token0.chainId]
  const isToken0Weth = token0.address.toLowerCase() === wethAddress.toLowerCase()
  const isToken1Weth = token1.address.toLowerCase() === wethAddress.toLowerCase()

  if (isToken0Weth && amount0 > 0n) {
    wrappedEthAmount = await wrapEthIfNeeded({
      amount: amount0,
      walletClient,
      publicClient,
      account,
      chainId: token0.chainId
    })
  } else if (isToken1Weth && amount1 > 0n) {
    wrappedEthAmount = await wrapEthIfNeeded({
      amount: amount1,
      walletClient,
      publicClient,
      account,
      chainId: token1.chainId
    })
  }

  // Approve tokens for the Position Manager
  await ensureTokenApproval({
    token: token0,
    spender: positionManagerAddress,
    amount: amount0,
    walletClient,
    publicClient,
    account
  })

  await ensureTokenApproval({
    token: token1,
    spender: positionManagerAddress,
    amount: amount1,
    walletClient,
    publicClient,
    account
  })

  // Get or create pool
  let pool: Pool
  let isNewPool = false
  let poolAddress: Address

  // Early check for pool existence with token logging
  poolAddress = computePoolAddressForTokens(token0, token1, fee, token0.chainId)
  console.log('🔍 Checking pool existence:', {
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
    fee: fee,
    chainId: token0.chainId
  })

  try {
    const existingPool = await createPoolInstance(token0, token1, fee, publicClient)
    if (!existingPool) {
      throw new Error('Pool does not exist')
    }
    pool = existingPool
    
    console.log('🏊 Pool found:', {
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
      fee: fee,
      chainId: token0.chainId
    })
  } catch (error) {
    if (!initialPrice) {
      throw new Error('Initial price is required when creating a new pool')
    }
    
    const { createAndInitializePool } = await import('./factory')
    poolAddress = await createAndInitializePool({
      token0,
      token1,
      fee,
      initialPrice,
      walletClient,
      publicClient,
      account
    })
    
    const newPool = await createPoolInstance(token0, token1, fee, publicClient)
    if (!newPool) {
      throw new Error('Failed to create pool instance after initialization')
    }
    pool = newPool
    isNewPool = true
    
    console.log('🏗️ New pool created:', {
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
      fee: fee,
      chainId: token0.chainId,
      initialPrice: initialPrice.toString()
    })
  }

  // Create position
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
    positionManagerAddress
  })

  return {
    poolAddress,
    positionHash,
    isNewPool,
    wrappedEthAmount
  }
}

/**
 * Check if a token is WETH on the current chain
 */
export function isWethToken(token: Token): boolean {
  const wethAddress = WETH_ADDRESSES[token.chainId]
  return token.address.toLowerCase() === wethAddress.toLowerCase()
}

/**
 * Get the WETH address for a given chain
 */
export function getWethAddress(chainId: number): Address | null {
  const address = WETH_ADDRESSES[chainId]
  return address && address !== '0x0000000000000000000000000000000000000000' ? address : null
}

/**
 * Check if a token needs Permit2 approval and approve if necessary
 */
export async function ensurePermit2Approval({
  token,
  spender,
  amount,
  permit2Address,
  walletClient,
  publicClient,
  account
}: Permit2ApprovalParams): Promise<void> {
  const [currentAmount, _expiration, _nonce] = await publicClient.readContract({
    address: permit2Address,
    abi: PERMIT2_ABI,
    functionName: 'allowance',
    args: [account, token.address as Address, spender]
  })

  if (currentAmount >= amount) {
    console.log(`✅ Token ${token.symbol} already has sufficient Permit2 allowance`)
    return
  }

  console.log(`🔐 Approving ${token.symbol} for Permit2 spender ${spender}...`)
  
  // Set expiration to 1 hour from now
  const expiration = BigInt(Math.floor(Date.now() / 1000) + 60 * 60)
  
  const approveHash = await walletClient.writeContract({
    address: permit2Address,
    abi: PERMIT2_ABI,
    functionName: 'approve',
    args: [token.address as Address, spender, amount as bigint, expiration as bigint],
    account,
    chain: null
  })

  await publicClient.waitForTransactionReceipt({ hash: approveHash })
  console.log(`✅ ${token.symbol} Permit2 approval completed`)
} 