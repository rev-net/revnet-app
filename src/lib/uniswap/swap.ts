import { Token, Percent } from '@uniswap/sdk-core'
import { Pool, FeeAmount } from '@uniswap/v3-sdk'
import { Address, WalletClient, PublicClient } from 'viem'
import { POSITION_MANAGER_ADDRESSES, UNISWAP_V3_ROUTER_ADDRESSES, UNISWAP_V3_QUOTER_ADDRESSES } from '@/constants'
import { createPoolInstance, getPoolState, computePoolAddressForTokens } from './pool'
import { createAndInitializePool } from './factory'
import { calculateSqrtPriceX96 } from './utils'

// Import ABIs from Uniswap SDK
import QuoterV2Abi from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'
import QuoterAbi from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'

// Router ABI for swaps
const ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' }
        ],
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' }
        ],
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'exactInputSingleSupportingFeeOnTransferTokens',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function'
  }
] as const

// Quoter ABI for getting swap quotes - using SDK ABI
const QUOTER_ABI = QuoterV2Abi.abi

export interface SwapParams {
  tokenIn: Token
  tokenOut: Token
  amountIn: bigint
  recipient: Address
  walletClient: WalletClient
  publicClient: PublicClient
  account: Address
  slippageTolerance?: Percent
  deadline?: number
  fee?: FeeAmount
}

export interface SwapQuote {
  amountOut: bigint
  priceImpact: number
  fee: bigint
}

export interface SwapResult {
  hash: string
  amountOut: bigint
  priceImpact: number
}

/**
 * Get router address for a given chain
 */
function getRouterAddress(chainId: number): Address {
  const address = UNISWAP_V3_ROUTER_ADDRESSES[chainId]
  if (!address) {
    throw new Error(`Router not found for chain ${chainId}`)
  }
  return address
}

/**
 * Get quoter address for a given chain
 */
function getQuoterAddress(chainId: number): Address {
  const address = UNISWAP_V3_QUOTER_ADDRESSES[chainId]
  if (!address) {
    throw new Error(`Quoter not found for chain ${chainId}`)
  }
  return address
}

/**
 * Get a quote for swapping tokens
 */
export async function getSwapQuote(
  tokenIn: Token,
  tokenOut: Token,
  amountIn: bigint,
  publicClient: PublicClient,
  fee: FeeAmount = FeeAmount.HIGH
): Promise<SwapQuote | null> {
  const quoterAddress = getQuoterAddress(tokenIn.chainId)
  
  try {
    // First check if the pool exists and has liquidity
    const poolCheck = await checkPoolForSwap(tokenIn, tokenOut, publicClient, fee);
    if (!poolCheck.hasLiquidity) {
      console.log('❌ Pool check failed for swap quote:', {
        exists: poolCheck.exists,
        hasLiquidity: poolCheck.hasLiquidity,
        poolAddress: poolCheck.poolAddress
      });
      return null;
    }
    
    console.log('🔍 Getting swap quote:', {
      tokenIn: { symbol: tokenIn.symbol, address: tokenIn.address, amount: amountIn.toString() },
      tokenOut: { symbol: tokenOut.symbol, address: tokenOut.address },
      fee,
      quoterAddress,
      poolAddress: poolCheck.poolAddress,
      tokenOrder: {
        token0: tokenIn.address.toLowerCase() < tokenOut.address.toLowerCase() ? tokenIn.address : tokenOut.address,
        token1: tokenIn.address.toLowerCase() < tokenOut.address.toLowerCase() ? tokenOut.address : tokenIn.address,
      }
    });

    // Try the quote with the original token order (tokenIn, tokenOut)
    const quote = await publicClient.readContract({
      address: quoterAddress,
      abi: QUOTER_ABI,
      functionName: 'quoteExactInputSingle',
      args: [{
        tokenIn: tokenIn.address as Address,
        tokenOut: tokenOut.address as Address,
        fee,
        amountIn,
        sqrtPriceLimitX96: 0n // 0 means no limit
      }]
    })

    // QuoterV2 returns a tuple: [amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate]
    const amountOut = Array.isArray(quote) ? BigInt(quote[0] as string | number | bigint) : BigInt(quote as string | number | bigint)
    
    // Validate that we got a reasonable quote
    if (amountOut === 0n) {
      console.log('⚠️ Quoter returned 0 amount out - insufficient liquidity or invalid path');
      return null;
    }

    // Calculate price impact (simplified)
    const priceImpact = 0 // TODO: Calculate actual price impact
    
    // Calculate fee (simplified - assuming 0.3% for HIGH fee)
    const feeAmount = (amountIn * 3000n) / 1000000n

    console.log('💱 Swap quote successful:', {
      tokenIn: { symbol: tokenIn.symbol, amount: amountIn.toString() },
      tokenOut: { symbol: tokenOut.symbol, amount: amountOut.toString() },
      fee: feeAmount.toString(),
      priceImpact,
      poolAddress: poolCheck.poolAddress
    })

    return {
      amountOut,
      priceImpact,
      fee: feeAmount
    }
  } catch (error) {
    console.error('❌ Error getting swap quote:', error);
    
    // Check if it's a specific quoter error
    if (error instanceof Error) {
      if (error.message.includes('returned no data') || error.message.includes('0x')) {
        console.log('⚠️ Quoter returned no data - this usually means insufficient liquidity or invalid swap path');
        
        // Try to get more details about the pool state
        try {
          const poolCheck = await checkPoolForSwap(tokenIn, tokenOut, publicClient, fee);
          console.log('🔍 Pool state for failed quote:', {
            exists: poolCheck.exists,
            hasLiquidity: poolCheck.hasLiquidity,
            poolAddress: poolCheck.poolAddress
          });
          
          // Try to get pool state directly to see what's happening
          const poolState = await getPoolState(poolCheck.poolAddress!, publicClient, tokenIn, tokenOut);
          console.log('🔍 Detailed pool state:', {
            exists: poolState.exists,
            initialized: poolState.initialized,
            liquidity: poolState.liquidity.toString(),
            tick: poolState.tick,
            sqrtPriceX96: poolState.sqrtPriceX96.toString()
          });
        } catch (poolError) {
          console.error('Error checking pool state:', poolError);
        }
      }
    }
    
    return null;
  }
}

/**
 * Perform a token swap
 */
export async function performSwap({
  tokenIn,
  tokenOut,
  amountIn,
  recipient,
  walletClient,
  publicClient,
  account,
  slippageTolerance = new Percent(50, 10_000), // 0.5%
  deadline = Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
  fee = FeeAmount.HIGH
}: SwapParams): Promise<SwapResult> {
  
  // Get quote first
  const quote = await getSwapQuote(tokenIn, tokenOut, amountIn, publicClient, fee)
  if (!quote) {
    throw new Error('Failed to get swap quote')
  }

  // Calculate minimum amount out based on slippage tolerance
  const minimumAmountOut = quote.amountOut - (quote.amountOut * BigInt(slippageTolerance.numerator.toString()) / BigInt(slippageTolerance.denominator.toString()))

  const routerAddress = getRouterAddress(tokenIn.chainId)

  console.log('🔄 Executing swap:', {
    tokenIn: { symbol: tokenIn.symbol, amount: amountIn.toString() },
    tokenOut: { symbol: tokenOut.symbol, expectedAmount: quote.amountOut.toString() },
    minimumAmountOut: minimumAmountOut.toString(),
    slippageTolerance: slippageTolerance.toFixed(2) + '%',
    deadline
  })

  // Execute the swap
  const hash = await walletClient.writeContract({
    address: routerAddress,
    abi: ROUTER_ABI,
    functionName: 'exactInputSingle',
    args: [
      {
        tokenIn: tokenIn.address as Address,
        tokenOut: tokenOut.address as Address,
        fee,
        recipient,
        deadline: BigInt(deadline),
        amountIn,
        amountOutMinimum: minimumAmountOut,
        sqrtPriceLimitX96: 0n // No price limit
      }
    ],
    account,
    chain: null,
    value: tokenIn.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ? amountIn : 0n
  })

  // Wait for transaction
  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  console.log('✅ Swap completed:', {
    hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString()
  })

  return {
    hash,
    amountOut: quote.amountOut,
    priceImpact: quote.priceImpact
  }
}

/**
 * Check if a pool exists and has sufficient liquidity for swapping
 */
export async function checkPoolForSwap(
  tokenIn: Token,
  tokenOut: Token,
  publicClient: PublicClient,
  fee: FeeAmount = FeeAmount.HIGH
): Promise<{ exists: boolean; hasLiquidity: boolean; poolAddress: Address | null }> {
  try {
    const poolAddress = computePoolAddressForTokens(tokenIn, tokenOut, fee, tokenIn.chainId)
    const poolState = await getPoolState(poolAddress, publicClient, tokenIn, tokenOut)
    
    return {
      exists: poolState.exists,
      hasLiquidity: poolState.exists && poolState.initialized && poolState.liquidity > 0n,
      poolAddress: poolState.exists ? poolAddress : null
    }
  } catch (error) {
    console.error('Error checking pool for swap:', error)
    return {
      exists: false,
      hasLiquidity: false,
      poolAddress: null
    }
  }
} 