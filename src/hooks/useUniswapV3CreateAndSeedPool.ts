import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { Pool, Position, TickMath, encodeSqrtRatioX96, NonfungiblePositionManager, TICK_SPACINGS } from '@uniswap/v3-sdk';
import { Token, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core';
import { getContract, type Address, getAddress } from 'viem';
import JSBI from 'jsbi';


// Factory addresses for different networks
const UNISWAP_V3_FACTORY_ADDRESSES = {
  '84532': '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24', // base-sepolia
  '8453': '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',  // base
  '11155111': '0x0227628f3F023bb0B980b67D528571c95c6DaC1c', // sepolia
  '1': '0x1F98431c8aD98523631AE4a59f267346ea31F984',     // ethereum
} as const;

// WETH addresses for different networks
const WETH_ADDRESSES = {
  '84532': '0x4200000000000000000000000000000000000006', // base-sepolia
  '8453': '0x4200000000000000000000000000000000000006',  // base
  '11155111': '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', // sepolia
  '1': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',     // ethereum
} as const;

// NonfungiblePositionManager addresses
const POSITION_MANAGER_ADDRESSES = {
  '84532': getAddress('0x03a520b7C8bF7E5bA7735De796b7D7d6B469f9Fc'), // base-sepolia
  '8453': getAddress('0x03a520b7C8bF7E5bA7735De796b7D7d6B469f9Fc'),  // base
  '11155111': getAddress('0x1238536071E1c677A632429e3655c799b22cDA52'), // sepolia
  '1': getAddress('0xC36442b4a4522E871399CD717aBDD847Ab11FE88'),     // ethereum
} as const;

// ABIs
const UNISWAP_V3_FACTORY_ABI = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'fee', type: 'uint24' },
    ],
    name: 'getPool',
    outputs: [{ name: 'pool', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'fee', type: 'uint24' },
    ],
    name: 'createPool',
    outputs: [{ name: 'pool', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const UNISWAP_V3_POOL_ABI = [
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
      { name: 'unlocked', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'sqrtPriceX96', type: 'uint160' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const POSITION_MANAGER_ABI = [
  {
    inputs: [
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
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

type SupportedChainId = keyof typeof UNISWAP_V3_FACTORY_ADDRESSES;

export function useUniswapV3AddLimitOrder() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poolAddress, setPoolAddress] = useState<string | null>(null);
  const [isPoolExists, setIsPoolExists] = useState(false);
  const [isPoolInitialized, setIsPoolInitialized] = useState(false);

  const addLimitOrder = useCallback(async ({
    tokenAddress,
    chainId,
    limitPrice,
    amountToken,
    amountETH,
    tickLower,
    tickUpper,
    liquidityType,
    cashoutQuote,
  }: {
    tokenAddress: Address;
    chainId: number;
    limitPrice: number;
    amountToken: bigint;
    amountETH: bigint;
    tickLower?: number;
    tickUpper?: number;
    liquidityType: 'spot' | 'limit';
    cashoutQuote: bigint;
  }) => {
    if (!walletClient || !publicClient || !address) {
      throw new Error('Wallet or public client not available');
    }

    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        console.log(`=== Starting Limit Order Addition (Attempt ${retryCount + 1}/${maxRetries}) ===`);
        
        const chainIdKey = chainId.toString() as SupportedChainId;
        const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainIdKey];
        const wethAddress = WETH_ADDRESSES[chainIdKey];
        const positionManagerAddress = POSITION_MANAGER_ADDRESSES[chainIdKey];

        if (!factoryAddress || !wethAddress || !positionManagerAddress) {
          throw new Error(`Unsupported network: ${chainId}`);
        }

        // Create token instances
        const token0 = tokenAddress.toLowerCase() < wethAddress.toLowerCase() ? tokenAddress : wethAddress;
        const token1 = tokenAddress.toLowerCase() < wethAddress.toLowerCase() ? wethAddress : tokenAddress;

        // Get token metadata and create SDK Token instances
        const [token0Decimals, token1Decimals] = await Promise.all([
          publicClient.readContract({
            address: token0,
            abi: [{ inputs: [], name: 'decimals', outputs: [{ type: 'uint8' }], stateMutability: 'view', type: 'function' }],
            functionName: 'decimals'
          }),
          publicClient.readContract({
            address: token1,
            abi: [{ inputs: [], name: 'decimals', outputs: [{ type: 'uint8' }], stateMutability: 'view', type: 'function' }],
            functionName: 'decimals'
          })
        ]);

        const token0Instance = new Token(chainId, token0, token0Decimals);
        const token1Instance = new Token(chainId, token1, token1Decimals);

        // Calculate amounts based on token order
        const isToken0Weth = wethAddress.toLowerCase() === token0.toLowerCase();
        const amount0 = isToken0Weth ? amountETH : amountToken;
        const amount1 = isToken0Weth ? amountToken : amountETH;

        // Calculate the expected amounts based on the limit price
        const price = isToken0Weth ? 1 / limitPrice : limitPrice;
        
        // Calculate the expected amount of token1 based on the limit price
        const expectedAmount1 = isToken0Weth 
          ? amount0 * BigInt(Math.floor(1 / price * 1e18)) / BigInt(1e18)
          : amount0 * BigInt(Math.floor(price * 1e18)) / BigInt(1e18);

        // Use the larger of the expected amount or cashout quote
        const finalAmount1 = expectedAmount1 > cashoutQuote ? expectedAmount1 : cashoutQuote;

        // Get or create pool
        const factoryContract = getContract({
          address: factoryAddress,
          abi: [
            {
              inputs: [
                { name: 'tokenA', type: 'address' },
                { name: 'tokenB', type: 'address' },
                { name: 'fee', type: 'uint24' },
              ],
              name: 'getPool',
              outputs: [{ name: 'pool', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
            },
            {
              inputs: [
                { name: 'tokenA', type: 'address' },
                { name: 'tokenB', type: 'address' },
                { name: 'fee', type: 'uint24' },
              ],
              name: 'createPool',
              outputs: [{ name: 'pool', type: 'address' }],
              stateMutability: 'nonpayable',
              type: 'function',
            },
          ],
          client: publicClient,
        });

        let poolAddress = await factoryContract.read.getPool([token0, token1, 3000]);
        let pool: Pool | null = null;

        if (poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000') {
          // Pool exists, get its state
          const poolContract = getContract({
            address: poolAddress,
            abi: [
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
                  { name: 'unlocked', type: 'bool' },
                ],
                stateMutability: 'view',
                type: 'function',
              },
              {
                inputs: [],
                name: 'liquidity',
                outputs: [{ name: '', type: 'uint128' }],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            client: publicClient,
          });

          const [slot0, liquidity] = await Promise.all([
            poolContract.read.slot0(),
            poolContract.read.liquidity()
          ]);

          if (slot0[0] > 0n) {
            pool = new Pool(
              token0Instance,
              token1Instance,
              3000,
              slot0[0].toString(),
              liquidity.toString(),
              slot0[1]
            );
          }
        }

        // Create pool if it doesn't exist or isn't initialized
        if (!pool) {
          const createPoolTx = await factoryContract.write.createPool(
            [token0, token1, 3000],
            { account: address }
          );

          const createPoolReceipt = await publicClient.waitForTransactionReceipt({
            hash: createPoolTx
          });

          const poolCreatedEvent = createPoolReceipt.logs.find(
            log => log.topics[0] === '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118'
          );
          
          if (!poolCreatedEvent || !poolCreatedEvent.topics[1]) {
            throw new Error("Pool created event not found or invalid");
          }

          poolAddress = getAddress('0x' + poolCreatedEvent.topics[1].slice(26), 1);
          
          // Initialize pool with price
          const poolContract = getContract({
            address: poolAddress,
            abi: [
              {
                inputs: [{ name: 'sqrtPriceX96', type: 'uint160' }],
                name: 'initialize',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
              },
            ],
            client: publicClient,
          });

          const sqrtPriceX96 = encodeSqrtRatioX96(
            JSBI.BigInt(Math.floor(Number(cashoutQuote) / Number(amountToken) * 1e6)),
            JSBI.BigInt(1e6)
          );

          const initializeTx = await poolContract.write.initialize(
            [BigInt(sqrtPriceX96.toString())],
            { account: address }
          );
          await publicClient.waitForTransactionReceipt({ hash: initializeTx });

          // Create pool instance after initialization
          pool = new Pool(
            token0Instance,
            token1Instance,
            3000,
            sqrtPriceX96.toString(),
            '0',
            0
          );
        }

        // Calculate valid tick range using SDK constants
        const tickSpacing = TICK_SPACINGS[3000]; // Get tick spacing for 0.3% fee tier
        
        let tickLower: number;
        let tickUpper: number;

        if (liquidityType === 'limit') {
          // For limit orders, use the user's specified limit price
          // Convert price to tick, considering token order
          const isToken0Weth = wethAddress.toLowerCase() === token0.toLowerCase();
          const price = isToken0Weth ? limitPrice : 1 / limitPrice;
          const tick = Math.floor(Math.log(price) / Math.log(1.0001));
          
          // For limit orders, we want a narrow range around the limit price
          // This ensures the order executes close to the desired price
          const tickRange = 100; // Smaller range for limit orders
          tickLower = Math.floor((tick - tickRange) / tickSpacing) * tickSpacing;
          tickUpper = Math.ceil((tick + tickRange) / tickSpacing) * tickSpacing;
        } else {
          // For spot orders, use the current price
          const amount0Currency = CurrencyAmount.fromRawAmount(token0Instance, amount0.toString());
          const amount1Currency = CurrencyAmount.fromRawAmount(token1Instance, amount1.toString());
          const price = new Price(token0Instance, token1Instance, amount0Currency.quotient, amount1Currency.quotient);
          const tickFromPrice = Math.log(Number(price.toSignificant(18))) / Math.log(1.0001);
          
          // Wider range for spot orders
          const tickRange = 1000;
          tickLower = Math.floor((tickFromPrice - tickRange) / tickSpacing) * tickSpacing;
          tickUpper = Math.ceil((tickFromPrice + tickRange) / tickSpacing) * tickSpacing;
        }

        // Ensure ticks are within valid range and properly ordered
        const validTickLower = Math.max(TickMath.MIN_TICK, tickLower);
        const validTickUpper = Math.min(TickMath.MAX_TICK, tickUpper);

        // Ensure tickLower is less than tickUpper
        if (validTickLower >= validTickUpper) {
          throw new Error('Invalid tick range: lower tick must be less than upper tick');
        }

        // Create position with the calculated amounts
        const position = Position.fromAmounts({
          pool,
          tickLower: validTickLower,
          tickUpper: validTickUpper,
          amount0: amount0.toString(),
          amount1: finalAmount1.toString(),
          useFullPrecision: true
        });

        // Get mint parameters using SDK
        const { calldata, value } = NonfungiblePositionManager.addCallParameters(position, {
          slippageTolerance: new Percent(50, 10_000), // 0.5%
          deadline: Math.floor(Date.now() / 1000) + 3600,
          recipient: address,
          createPool: !pool
        });

        // Create position manager contract
        const positionManagerContract = getContract({
          address: positionManagerAddress,
          abi: [
            {
              inputs: [
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
                { name: 'deadline', type: 'uint256' },
              ],
              name: 'mint',
              outputs: [
                { name: 'tokenId', type: 'uint256' },
                { name: 'liquidity', type: 'uint128' },
                { name: 'amount0', type: 'uint256' },
                { name: 'amount1', type: 'uint256' },
              ],
              stateMutability: 'payable',
              type: 'function',
            },
          ],
          client: walletClient,
        });

        // Mint position using SDK parameters
        const tx = await positionManagerContract.write.mint(
          [
            token0,
            token1,
            3000,
            validTickLower,
            validTickUpper,
            amountToken,  // Project token amount
            amountETH,    // ETH amount
            0n,
            0n,
            address,
            BigInt(Math.floor(Date.now() / 1000) + 3600)
          ],
          { account: address, value: BigInt(value) }
        );

        await publicClient.waitForTransactionReceipt({ hash: tx });

        setPoolAddress(poolAddress);
        setIsPoolExists(true);
        setIsPoolInitialized(true);

        return { poolAddress };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`Attempt ${retryCount + 1} failed:`, lastError);
        
        // Check for specific error types
        const isRateLimit = lastError.message.includes('429') || lastError.message.includes('Too Many Requests');
        const isRpcError = lastError.message.includes('400') || lastError.message.includes('Unsupported method');
        const isTransactionError = lastError.message.includes('eth_sendTransaction') || 
                                 lastError.message.includes('transaction') ||
                                 lastError.message.includes('gas');
        
        if (isRateLimit || isRpcError || isTransactionError) {
          retryCount++;
          if (retryCount < maxRetries) {
            // Exponential backoff with jitter
            const baseDelay = Math.pow(2, retryCount) * 1000;
            const jitter = Math.random() * 1000;
            const delay = baseDelay + jitter;
            console.log(`Retrying in ${Math.round(delay)}ms... (Error: ${lastError.message})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // If it's not a retryable error or we've exhausted retries, throw
        throw lastError;
      }
    }

    throw lastError || new Error('Failed to add limit order after all retries');
  }, [publicClient, walletClient, address]);

  return {
    isLoading,
    error,
    poolAddress,
    isPoolExists,
    isPoolInitialized,
    addLimitOrder,
  };
} 