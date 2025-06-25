import { Token, Percent } from '@uniswap/sdk-core'
import { FeeAmount, encodeRouteToPath, Route, Pool } from '@uniswap/v3-sdk'
import { Address, WalletClient, PublicClient, bytesToHex, encodeAbiParameters } from 'viem'
import { UNISWAP_V3_ROUTER_ADDRESSES, UNISWAP_V3_QUOTER_ADDRESSES, WETH_ADDRESSES, PERMIT2_ADDRESSES, UNISWAP_FEE_TIER } from '@/constants'
import { getPoolState, computePoolAddressForTokens, createPoolInstance } from './pool'
import { ensureTokenApproval, ensurePermit2Approval } from './approvals'
import { CommandType } from '@uniswap/universal-router-sdk'

// Import ABIs from Uniswap SDK
import QuoterV2Abi from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'
// import QuoterAbi from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import UniversalRouterArtifact from '@uniswap/universal-router/artifacts/contracts/UniversalRouter.sol/UniversalRouter.json'

const UniversalRouterV2Abi = [
  {
    "inputs": [
      { "internalType": "bytes", "name": "commands", "type": "bytes" },
      { "internalType": "bytes[]", "name": "inputs", "type": "bytes[]" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "execute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

export interface SwapParams {
  tokenIn: Token
  tokenOut: Token
  amountIn: bigint
  recipient: Address
  walletClient: WalletClient
  publicClient: PublicClient
  account: Address
  slippageTolerance?: Percent
  deadline?: bigint
  fee?: FeeAmount
}

export interface SwapQuote {
  amountOut: bigint
  priceImpact: number
  fee: bigint
}

export interface SwapQuoteError {
  type: 'insufficient_liquidity' | 'pool_not_exists' | 'quoter_error' | 'unknown'
  message: string
  details?: {
    tokenInBalance?: bigint
    tokenOutBalance?: bigint
    requiredAmount?: bigint
    poolAddress?: Address | null
    error?: string
  }
}

export type SwapQuoteResult = SwapQuote | SwapQuoteError | null

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
  fee: FeeAmount = UNISWAP_FEE_TIER
): Promise<SwapQuoteResult> {
  const quoterAddress = getQuoterAddress(tokenIn.chainId)
  
  try {
    // Check if the pool has sufficient liquidity for this specific swap
    const liquidityCheck = await checkPoolLiquidityForSwap(tokenIn, tokenOut, amountIn, publicClient, fee);
    if (!liquidityCheck.hasSufficientLiquidity) {
      return {
        type: 'insufficient_liquidity',
        message: 'Insufficient liquidity for swap quote',
        details: {
          tokenInBalance: liquidityCheck.tokenInBalance,
          tokenOutBalance: liquidityCheck.tokenOutBalance,
          requiredAmount: amountIn,
          poolAddress: liquidityCheck.poolAddress
        }
      };
    }

    // Try the quote with the original token order (tokenIn, tokenOut)
    const quote = await publicClient.readContract({
      address: quoterAddress,
      abi: QuoterV2Abi.abi,
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
      return {
        type: 'insufficient_liquidity',
        message: 'Quoter returned 0 amount out - insufficient liquidity or invalid path',
        details: {
          tokenInBalance: liquidityCheck.tokenInBalance,
          tokenOutBalance: liquidityCheck.tokenOutBalance,
          requiredAmount: amountIn,
          poolAddress: liquidityCheck.poolAddress
        }
      };
    }

    // Calculate price impact (simplified)
    const priceImpact = 0 // TODO: Calculate actual price impact
    
    // Calculate fee (simplified - assuming 0.3% for HIGH fee)
    const feeAmount = (amountIn * 3000n) / 1000000n

    return {
      amountOut,
      priceImpact,
      fee: feeAmount
    }
  } catch (error) {
    // Check if it's a specific quoter error
    if (error instanceof Error) {
      if (error.message.includes('returned no data') || error.message.includes('0x')) {
        // Try to get more details about the pool state
        try {
          const poolCheck = await checkPoolForSwap(tokenIn, tokenOut, publicClient, fee);
          const poolState = await getPoolState(poolCheck.poolAddress!, publicClient, tokenIn, tokenOut);
        } catch (poolError) {
          // Ignore pool error
        }
      }
    }
    
    return {
      type: 'unknown',
      message: 'An unknown error occurred while getting swap quote',
      details: {
        error: error instanceof Error ? error.message : String(error)
      }
    };
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
  deadline = BigInt(Math.floor(Date.now() / 1e3) + 60 * 10), // 10 minutes
  fee = UNISWAP_FEE_TIER
}: SwapParams): Promise<SwapResult> {
  
  // Get quote first
  const quote = await getSwapQuote(tokenIn, tokenOut, amountIn, publicClient, fee)
  if (!quote) {
    throw new Error('Failed to get swap quote')
  }

  // Check if quote is an error
  if ('type' in quote) {
    throw new Error(`Swap quote failed: ${quote.message}`)
  }

  // Calculate minimum amount out based on slippage tolerance
  const minimumAmountOut = quote.amountOut - (quote.amountOut * BigInt(slippageTolerance.numerator.toString()) / BigInt(slippageTolerance.denominator.toString()))

  const routerAddress = getRouterAddress(tokenIn.chainId)

  // Check user's token balance first
  const tokenBalance = await publicClient.readContract({
    address: tokenIn.address as Address,
    abi: [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ],
    functionName: 'balanceOf',
    args: [account]
  })

  if (tokenBalance < amountIn) {
    throw new Error(`Insufficient ${tokenIn.symbol} balance. Required: ${amountIn.toString()}, Available: ${tokenBalance.toString()}`)
  }

  // For UniversalRouterV2 (Base Sepolia), we need Permit2 approval
  const isBaseSepoliaV2 = routerAddress.toLowerCase() === '0x95273d871c8156636e114b63797d78d7e1720d81';
  
  if (isBaseSepoliaV2 && tokenIn.address.toLowerCase() !== WETH_ADDRESSES[tokenIn.chainId].toLowerCase()) {
    const PERMIT2_ABI = [
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'spender', type: 'address' }
        ],
        outputs: [
          { name: 'amount', type: 'uint160' },
          { name: 'expiration', type: 'uint48' },
          { name: 'nonce', type: 'uint48' }
        ]
      },
      {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'token', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint160' },
          { name: 'expiration', type: 'uint48' }
        ],
        outputs: []
      }
    ];

    // First, check if the user has approved the token for Permit2
    const tokenAllowanceForPermit2 = await publicClient.readContract({
      address: tokenIn.address as Address,
      abi: [
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
      ],
      functionName: 'allowance',
      args: [account, PERMIT2_ADDRESSES[tokenIn.chainId]]
    })

    // If the user hasn't approved the token for Permit2, we need to do that first
    if (tokenAllowanceForPermit2 < amountIn) {
      const approveTokenHash = await walletClient.writeContract({
        address: tokenIn.address as Address,
        abi: [
          {
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            name: 'approve',
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function'
          }
        ],
        functionName: 'approve',
        args: [PERMIT2_ADDRESSES[tokenIn.chainId], amountIn],
        account,
        chain: null
      })

      await publicClient.waitForTransactionReceipt({ hash: approveTokenHash })
    }

    // Check current Permit2 allowance
    const allowanceResult = await publicClient.readContract({
      address: PERMIT2_ADDRESSES[tokenIn.chainId],
      abi: PERMIT2_ABI,
      functionName: 'allowance',
      args: [account, tokenIn.address as Address, routerAddress]
    }) as [string | number | bigint, string | number | bigint, string | number | bigint]

    const currentAmount = BigInt(allowanceResult[0])
    const expiration = BigInt(allowanceResult[1])
    const nonce = BigInt(allowanceResult[2])

    const currentTime = BigInt(Math.floor(Date.now() / 1000))
    const isExpired = expiration < currentTime

    if (currentAmount < amountIn || isExpired) {
      const newExpiration = currentTime + BigInt(60 * 60); // 1 hour from now
      
      const approveHash = await walletClient.writeContract({
        address: PERMIT2_ADDRESSES[tokenIn.chainId],
        abi: PERMIT2_ABI,
        functionName: 'approve',
        args: [
          tokenIn.address as Address,
          routerAddress as Address,
          amountIn as bigint,
          newExpiration
        ],
        account,
        chain: null
      })

      await publicClient.waitForTransactionReceipt({ hash: approveHash })
    }
  }

  // Prepare the one-byte "exact in" command using CommandType enum
  const commands = bytesToHex(new Uint8Array([CommandType.V3_SWAP_EXACT_IN]))

  // 1) fetch or build the Pool
  const pool = await createPoolInstance(tokenIn, tokenOut, fee, publicClient)
  if (!pool) throw new Error('Pool not found')

  // 2) build a Route from it
  const route = new Route([pool], tokenIn, tokenOut)

  // 3) encode that into the "abi.encodePacked" format
  //    (false = exactInput mode; true = exactOutput mode)
  const path = encodeRouteToPath(route, false)  // string
  
  // Convert string path to bytes for ABI encoding
  const pathBytes = path as `0x${string}`

  // 2) Encode the inputs tuple: (recipient, amountIn, amountOutMin, path, payerIsUser)
  const rawInputs = encodeAbiParameters(
    [
      { name: 'recipient', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'bytes' },
      { name: 'payerIsUser', type: 'bool' }
    ],
    [recipient as `0x${string}`, amountIn, minimumAmountOut, pathBytes, true] // payerIsUser = true
  )

  const inputs = [rawInputs]
  const valueToSend = 0n  // no ETH for ERC-20↔ERC-20

  // fetch on-chain time to be safe
  const block = await publicClient.getBlock({ blockTag: 'latest' })
  const nowOnChain = Number(block.timestamp)

  // 10 minutes in the future
  const outerDeadline = BigInt(nowOnChain + 60 * 10)

  // Fire the Universal Router
  try {
    const abi = isBaseSepoliaV2 ? UniversalRouterV2Abi : UniversalRouterArtifact.abi;
    const hash = await walletClient.writeContract({
      address:      routerAddress,
      abi:          abi,
      functionName: 'execute',
      args:         [ commands, inputs, outerDeadline ],
      account,
      chain:        null,
      value:        valueToSend
    })
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    return { hash, amountOut: quote.amountOut, priceImpact: quote.priceImpact }
  } catch (err) {
    throw err
  }
}

/**
 * Check if a pool exists and has sufficient liquidity for swapping
 */
export async function checkPoolForSwap(
  tokenIn: Token,
  tokenOut: Token,
  publicClient: PublicClient,
  fee: FeeAmount = UNISWAP_FEE_TIER
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
    return {
      exists: false,
      hasLiquidity: false,
      poolAddress: null
    }
  }
}

/**
 * Check if a pool has sufficient liquidity for a specific swap direction
 */
export async function checkPoolLiquidityForSwap(
  tokenIn: Token,
  tokenOut: Token,
  amountIn: bigint,
  publicClient: PublicClient,
  fee: FeeAmount = UNISWAP_FEE_TIER
): Promise<{ hasSufficientLiquidity: boolean; tokenInBalance: bigint; tokenOutBalance: bigint; poolAddress: Address | null }> {
  try {
    const poolAddress = computePoolAddressForTokens(tokenIn, tokenOut, fee, tokenIn.chainId)
    
    // Get pool state to check if it exists and is initialized
    const poolState = await getPoolState(poolAddress, publicClient, tokenIn, tokenOut)
    
    if (!poolState.exists || !poolState.initialized || poolState.liquidity === 0n) {
      return {
        hasSufficientLiquidity: false,
        tokenInBalance: 0n,
        tokenOutBalance: 0n,
        poolAddress: null
      }
    }

    // Get token balances in the pool
    const [tokenInBalance, tokenOutBalance] = await Promise.all([
      publicClient.readContract({
        address: tokenIn.address as Address,
        abi: [{ name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' }],
        functionName: 'balanceOf',
        args: [poolAddress]
      }),
      publicClient.readContract({
        address: tokenOut.address as Address,
        abi: [{ name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' }],
        functionName: 'balanceOf',
        args: [poolAddress]
      })
    ])

    const tokenInBalanceBigInt = BigInt(tokenInBalance)
    const tokenOutBalanceBigInt = BigInt(tokenOutBalance)

    // Check if there's enough tokenIn in the pool for the swap
    const hasSufficientTokenIn = tokenInBalanceBigInt >= amountIn
    
    // For a rough estimate, check if there's at least some tokenOut available
    // (exact amount would require price calculation, but this is a basic check)
    const hasSomeTokenOut = tokenOutBalanceBigInt > 0n

    const hasSufficientLiquidity = hasSufficientTokenIn && hasSomeTokenOut

    return {
      hasSufficientLiquidity,
      tokenInBalance: tokenInBalanceBigInt,
      tokenOutBalance: tokenOutBalanceBigInt,
      poolAddress
    }
  } catch (error) {
    return {
      hasSufficientLiquidity: false,
      tokenInBalance: 0n,
      tokenOutBalance: 0n,
      poolAddress: null
    }
  }
}