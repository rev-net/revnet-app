import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { Address, WalletClient, PublicClient } from 'viem'
import { UNISWAP_V3_FACTORY_ADDRESSES } from '@/constants'
// Factory ABI for creating pools
const FACTORY_ABI = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'fee', type: 'uint24' }
    ],
    name: 'createPool',
    outputs: [{ name: 'pool', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'fee', type: 'uint24' }
    ],
    name: 'getPool',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const
// Pool ABI for initializing pools
const POOL_ABI = [
  {
    inputs: [
      { name: 'sqrtPriceX96', type: 'uint160' }
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const
// Tick spacing mapping from Uniswap SDK
const TICK_SPACINGS: Record<FeeAmount, number> = {
  [FeeAmount.LOW]: 10,      // 500 bps -> 10 tick spacing
  [FeeAmount.MEDIUM]: 60,   // 3000 bps -> 60 tick spacing  
  [FeeAmount.HIGH]: 200,    // 10000 bps -> 200 tick spacing
} as Record<FeeAmount, number>
export interface CreatePoolParams {
  token0: Token
  token1: Token
  fee: FeeAmount
  initialPrice: bigint // sqrtPriceX96
  walletClient: WalletClient
  publicClient: PublicClient
  account: Address
}
/**
 * Get the factory address for a given chain
 */
export function getFactoryAddress(chainId: number): Address {
  const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainId]
  if (!factoryAddress) {
    throw new Error(`No factory address found for chain ${chainId}`)
  }
  return factoryAddress
}
/**
 * Check if a pool already exists
 */
export async function checkPoolExists(
  token0: Token,
  token1: Token,
  fee: FeeAmount,
  publicClient: PublicClient
): Promise<boolean> {
  const factoryAddress = getFactoryAddress(token0.chainId)
  // Sort tokens by address (tokenA < tokenB)
  const [tokenA, tokenB] = token0.address.toLowerCase() < token1.address.toLowerCase() 
    ? [token0, token1] 
    : [token1, token0]
  console.log('🔍 Checking pool existence with sorted tokens:', {
    factoryAddress,
    tokenA: { symbol: tokenA.symbol, address: tokenA.address },
    tokenB: { symbol: tokenB.symbol, address: tokenB.address },
    fee,
    chainId: token0.chainId
  });
  try {
    const poolAddress = await publicClient.readContract({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: 'getPool',
      args: [tokenA.address as Address, tokenB.address as Address, fee]
    })
    const exists = poolAddress !== '0x0000000000000000000000000000000000000000';
    console.log('📊 Pool address from factory:', poolAddress);
    console.log('📊 Pool exists:', exists);
    
    if (!exists) {
      // Compute expected pool address for reference
      const { computePoolAddress } = await import('@uniswap/v3-sdk')
      const expectedPoolAddress = computePoolAddress({
        factoryAddress,
        tokenA,
        tokenB,
        fee,
      }) as Address
      console.log('🔮 Expected pool address (when created):', expectedPoolAddress);
    }
    
    return exists;
  } catch (error) {
    console.log('❌ Error checking pool existence:', error);
    return false
  }
}
/**
 * Create a new pool via the factory
 */
export async function createPool({
  token0,
  token1,
  fee,
  walletClient,
  publicClient,
  account
}: Omit<CreatePoolParams, 'initialPrice'>): Promise<Address> {
  const factoryAddress = getFactoryAddress(token0.chainId)
  // Sort tokens by address (tokenA < tokenB)
  const [tokenA, tokenB] = token0.address.toLowerCase() < token1.address.toLowerCase() 
    ? [token0, token1] 
    : [token1, token0]
  
  console.log('🏗️ Creating pool with sorted tokens:', {
    tokenA: { symbol: tokenA.symbol, address: tokenA.address },
    tokenB: { symbol: tokenB.symbol, address: tokenB.address },
    fee
  })

  // Create the pool and get the transaction hash
  const hash = await walletClient.writeContract({
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: 'createPool',
    args: [
      tokenA.address as `0x${string}`,
      tokenB.address as `0x${string}`,
      fee
    ],
    account,
    chain: undefined
  })
  
  // Wait for transaction to be mined
  await publicClient.waitForTransactionReceipt({ hash })
  
  // Get the pool address after creation using the SDK
  const { computePoolAddress } = await import('@uniswap/v3-sdk')
  
  // Ensure we use the exact same token ordering as the factory contract
  // The factory contract sorts tokens by address (tokenA < tokenB)
  const poolAddress = computePoolAddress({
    factoryAddress,
    tokenA,
    tokenB,
    fee,
  }) as Address
  
  console.log('🏊 Pool address computed from SDK:', poolAddress)
  console.log('📊 Token ordering for SDK:', {
    tokenA: { symbol: tokenA.symbol, address: tokenA.address },
    tokenB: { symbol: tokenB.symbol, address: tokenB.address },
    tokenAAddress: tokenA.address,
    tokenBAddress: tokenB.address,
    tokenAIsLower: tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
  })
  
  return poolAddress
}
/**
 * Initialize a pool with an initial price
 */
export async function initializePool({
  poolAddress,
  initialPrice,
  walletClient,
  publicClient,
  account
}: {
  poolAddress: Address
  initialPrice: bigint
  walletClient: WalletClient
  publicClient: PublicClient
  account: Address
}): Promise<void> {

  
  const hash = await walletClient.writeContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'initialize',
    args: [initialPrice],
    account,
    chain: null
  })
  // Wait for transaction to be mined
  await publicClient.waitForTransactionReceipt({ hash })
  console.log('✅ Pool initialization completed')
}
/**
 * Create and initialize a pool in one transaction
 */
export async function createAndInitializePool(params: CreatePoolParams): Promise<Address> {
  const { token0, token1, fee, initialPrice, walletClient, publicClient, account } = params
  console.log('🔍 Checking if pool exists before creation...');
  // Check if pool already exists
  const exists = await checkPoolExists(token0, token1, fee, publicClient)
  console.log('📊 Pool existence check result:', exists);
  if (exists) {
    console.log('❌ Pool already exists - cannot create duplicate');
    throw new Error('Pool already exists')
  }
  console.log('✅ Pool does not exist, proceeding with creation...');
  // Create the pool
  const poolAddress = await createPool({
    token0,
    token1,
    fee,
    walletClient,
    publicClient,
    account
  })
  // Initialize the pool with initial price
  await initializePool({
    poolAddress,
    initialPrice,
    walletClient,
    publicClient,
    account
  })
  return poolAddress
}
/**
 * Debug function to help identify pool address computation issues
 */
export async function debugPoolAddressComputation(
  token0: Token,
  token1: Token,
  fee: FeeAmount,
  publicClient: PublicClient
): Promise<void> {
  const factoryAddress = getFactoryAddress(token0.chainId)
  
  // Sort tokens by address (tokenA < tokenB)
  const [tokenA, tokenB] = token0.address.toLowerCase() < token1.address.toLowerCase() 
    ? [token0, token1] 
    : [token1, token0]
  
  console.log('🔍 Debugging pool address computation:', {
    factoryAddress,
    originalTokens: {
      token0: { symbol: token0.symbol, address: token0.address },
      token1: { symbol: token1.symbol, address: token1.address }
    },
    sortedTokens: {
      tokenA: { symbol: tokenA.symbol, address: tokenA.address },
      tokenB: { symbol: tokenB.symbol, address: tokenB.address }
    },
    fee,
    chainId: token0.chainId
  })
  
  // Get pool address from factory
  try {
    const factoryPoolAddress = await publicClient.readContract({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: 'getPool',
      args: [tokenA.address as Address, tokenB.address as Address, fee]
    })
    console.log('📊 Factory pool address:', factoryPoolAddress)
  } catch (error) {
    console.log('❌ Error getting factory pool address:', error)
  }
  
  // Compute expected address using SDK
  const { computePoolAddress } = await import('@uniswap/v3-sdk')
  const sdkPoolAddress = computePoolAddress({
    factoryAddress,
    tokenA,
    tokenB,
    fee,
  }) as Address
  console.log('🔮 SDK computed pool address:', sdkPoolAddress)
  
  // Try reverse order
  const reverseSdkPoolAddress = computePoolAddress({
    factoryAddress,
    tokenA: tokenB,
    tokenB: tokenA,
    fee,
  }) as Address
  console.log('🔄 SDK computed pool address (reverse order):', reverseSdkPoolAddress)
} 