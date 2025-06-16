import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { Pool, Position, TickMath } from '@uniswap/v3-sdk';
import { Token, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core';
import { getContract, type Address, getAddress } from 'viem';
import JSBI from 'jsbi';

const { MIN_TICK, MAX_TICK } = TickMath;

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
  }: {
    tokenAddress: Address;
    chainId: number;
    limitPrice: number;
    amountToken: bigint;
    amountETH: bigint;
    tickLower?: number;
    tickUpper?: number;
    liquidityType: 'spot' | 'limit';
  }) => {
    if (!walletClient || !publicClient || !address) {
      throw new Error('Wallet or public client not available');
    }

    try {
      console.log("=== Starting Limit Order Addition ===");
      console.log("Input parameters:", {
        tokenAddress,
        chainId,
        limitPrice,
        amountToken: amountToken.toString(),
        amountETH: amountETH.toString(),
      });

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
      
      console.log("Token addresses:", { token0, token1, wethAddress });

      // Verify both tokens are valid ERC-20s
      const erc20Abi = [
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
          inputs: [],
          name: 'decimals',
          outputs: [{ name: '', type: 'uint8' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'symbol',
          outputs: [{ name: '', type: 'string' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'name',
          outputs: [{ name: '', type: 'string' }],
          stateMutability: 'view',
          type: 'function'
        }
      ] as const;

      let token0Decimals: number;
      let token1Decimals: number;
      let token0Instance: Token;
      let token1Instance: Token;

      try {
        console.log("Creating token contracts...");
        
        // First verify the contract exists
        const token0Code = await publicClient.getBytecode({ address: token0 });
        const token1Code = await publicClient.getBytecode({ address: token1 });
        
        console.log("Contract bytecode lengths:", {
          token0: token0Code?.length || 0,
          token1: token1Code?.length || 0
        });

        if (!token0Code || token0Code.length === 0) {
          throw new Error(`Token0 contract does not exist at ${token0}`);
        }
        if (!token1Code || token1Code.length === 0) {
          throw new Error(`Token1 contract does not exist at ${token1}`);
        }

        console.log("Verifying token metadata...");
        
        // Verify token0 metadata
        try {
          console.log("Checking token0:", token0);
          const token0Decimals = await publicClient.readContract({
            address: token0,
            abi: erc20Abi,
            functionName: 'decimals'
          }) as number;
          console.log("Token0 decimals:", token0Decimals);
          
          const token0Symbol = await publicClient.readContract({
            address: token0,
            abi: erc20Abi,
            functionName: 'symbol'
          });
          console.log("Token0 symbol:", token0Symbol);
          
          const token0Name = await publicClient.readContract({
            address: token0,
            abi: erc20Abi,
            functionName: 'name'
          });
          console.log("Token0 name:", token0Name);

          // Create token0 instance after getting decimals
          token0Instance = new Token(chainId, token0, token0Decimals);
        } catch (error) {
          console.error("Error verifying token0:", error);
          throw new Error(`Failed to verify token0 (${token0}): ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Verify token1 metadata
        try {
          console.log("Checking token1:", token1);
          const token1Decimals = await publicClient.readContract({
            address: token1,
            abi: erc20Abi,
            functionName: 'decimals'
          }) as number;
          console.log("Token1 decimals:", token1Decimals);
          
          const token1Symbol = await publicClient.readContract({
            address: token1,
            abi: erc20Abi,
            functionName: 'symbol'
          });
          console.log("Token1 symbol:", token1Symbol);
          
          const token1Name = await publicClient.readContract({
            address: token1,
            abi: erc20Abi,
            functionName: 'name'
          });
          console.log("Token1 name:", token1Name);

          // Create token1 instance after getting decimals
          token1Instance = new Token(chainId, token1, token1Decimals);
        } catch (error) {
          console.error("Error verifying token1:", error);
          throw new Error(`Failed to verify token1 (${token1}): ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

      } catch (error) {
        console.error("Error verifying token metadata:", error);
        throw new Error(`Failed to verify token metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Get pool
      const factoryContract = getContract({
        address: factoryAddress,
        abi: UNISWAP_V3_FACTORY_ABI,
        client: publicClient,
      });

      const poolAddress = await factoryContract.read.getPool([token0, token1, 3000]);
      console.log("Pool address:", poolAddress);

      if (poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000') {
        try {
          // Get pool contract to check its token addresses
          const poolContract = getContract({
            address: poolAddress,
            abi: UNISWAP_V3_POOL_ABI,
            client: publicClient,
          });

          const [poolToken0, poolToken1] = await Promise.all([
            poolContract.read.token0(),
            poolContract.read.token1()
          ]);

          console.log("Pool token addresses:", {
            poolToken0,
            poolToken1,
            expectedToken0: token0,
            expectedToken1: token1
          });

          if (poolToken0.toLowerCase() !== token0.toLowerCase() || 
              poolToken1.toLowerCase() !== token1.toLowerCase()) {
            throw new Error(`Pool exists but with different tokens. Expected: ${token0}/${token1}, Found: ${poolToken0}/${poolToken1}`);
          }

        const slot0 = await poolContract.read.slot0();

          const sqrtPriceX96 = JSBI.BigInt(slot0[0].toString());
          const currentTick = Number(slot0[1]);

          // Create pool instance
          const pool = new Pool(
            token0Instance,
            token1Instance,
            3000,
            sqrtPriceX96,
            JSBI.BigInt(slot0[2].toString()),
            currentTick
          );

          // Calculate tick range
          const TICK_SPACING = 60; // 0.3% fee tier
          const isLimitOrder = liquidityType === 'limit';
          
        let finalTickLower: number;
        let finalTickUpper: number;

          if (!isLimitOrder) {
          // For spot liquidity, use a narrow range around the desired price
            const spotTick = Math.floor(Math.log(limitPrice) / Math.log(1.0001));
          const minTick = Math.ceil((currentTick + 1) / TICK_SPACING) * TICK_SPACING;
            finalTickLower = Math.max(minTick, Math.floor(spotTick / TICK_SPACING) * TICK_SPACING);
          finalTickUpper = finalTickLower + TICK_SPACING * 2;
        } else {
          // For limit orders:
            const limitTickRaw = Math.floor(Math.log(limitPrice) / Math.log(1.0001));
            const limitTick = Math.floor(limitTickRaw / TICK_SPACING) * TICK_SPACING;
            
            // For selling token1 (WETH), we want the price to be higher than current
            // For selling token0 (token), we want the price to be lower than current
            const isSellingToken1 = token1.toLowerCase() === wethAddress.toLowerCase();
            
            if (isSellingToken1) {
              // Selling WETH - price should be higher than current
              finalTickLower = Math.max(currentTick, limitTick);
              finalTickUpper = finalTickLower + TICK_SPACING;
            } else {
              // Selling token - price should be lower than current
              finalTickUpper = Math.min(currentTick, limitTick);
              finalTickLower = finalTickUpper - TICK_SPACING;
            }
          }

          // Ensure tick range is valid
          finalTickLower = Math.max(MIN_TICK, Math.min(MAX_TICK, finalTickLower));
          finalTickUpper = Math.max(MIN_TICK, Math.min(MAX_TICK, finalTickUpper));
        finalTickLower = Math.floor(finalTickLower / TICK_SPACING) * TICK_SPACING;
        finalTickUpper = Math.floor(finalTickUpper / TICK_SPACING) * TICK_SPACING;

          // Create position
          const isAddingToken1 = amountToken > 0n;
          
          // Create position using SDK
          const position = Position.fromAmounts({
              pool,
              tickLower: finalTickLower,
              tickUpper: finalTickUpper,
            amount0: isAddingToken1 ? '0' : amountToken.toString(),
            amount1: isAddingToken1 ? amountToken.toString() : '0',
              useFullPrecision: true
          });

          // Get the actual amounts needed for the position
          const { amount0, amount1 } = position.mintAmounts;
          console.log("Position amounts:", { amount0: amount0.toString(), amount1: amount1.toString() });

          // Ensure we have valid amounts
          if (JSBI.EQ(amount0, JSBI.BigInt(0)) && JSBI.EQ(amount1, JSBI.BigInt(0))) {
            // If amounts are zero, try calculating with the raw input amounts
            const rawPosition = Position.fromAmounts({
              pool,
              tickLower: finalTickLower,
              tickUpper: finalTickUpper,
              amount0: amountToken.toString(),
              amount1: amountETH.toString(),
              useFullPrecision: true
            });

            const { amount0: rawAmount0, amount1: rawAmount1 } = rawPosition.mintAmounts;
            console.log("Raw position amounts:", { 
              rawAmount0: rawAmount0.toString(), 
              rawAmount1: rawAmount1.toString(),
              inputAmountToken: amountToken.toString(),
              inputAmountETH: amountETH.toString()
            });

            if (JSBI.EQ(rawAmount0, JSBI.BigInt(0)) && JSBI.EQ(rawAmount1, JSBI.BigInt(0))) {
          throw new Error('Position amounts cannot be zero. Please check your input amounts and price range.');
            }
          }

          // Approve both tokens
          if (amountToken > 0n) {
            const { request: approveRequest } = await publicClient.simulateContract({
              address: tokenAddress,
              abi: ERC20_ABI,
              functionName: 'approve',
              args: [positionManagerAddress, amountToken],
              account: address,
              chain: publicClient.chain,
            });

            const approveHash = await walletClient.writeContract(approveRequest);
            await publicClient.waitForTransactionReceipt({ hash: approveHash });
          }

          // Also approve WETH if needed
          if (amountETH > 0n) {
            const { request: approveWethRequest } = await publicClient.simulateContract({
              address: wethAddress,
              abi: ERC20_ABI,
              functionName: 'approve',
              args: [positionManagerAddress, amountETH],
              account: address,
              chain: publicClient.chain,
            });

            const approveWethHash = await walletClient.writeContract(approveWethRequest);
            await publicClient.waitForTransactionReceipt({ hash: approveWethHash });
          }

          // Verify position manager contract exists
          console.log("Verifying position manager contract...");
          const positionManagerCode = await publicClient.getBytecode({ address: positionManagerAddress });
          console.log("Position manager bytecode length:", positionManagerCode?.length || 0);
          
          if (!positionManagerCode || positionManagerCode.length === 0) {
            throw new Error(`Position manager contract does not exist at ${positionManagerAddress}`);
          }

          // Verify position manager ABI
          const positionManagerAbi = [
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

          // Before mint
          console.log("Mint parameters:", {
            token0,
            token1,
            fee: 3000,
            tickLower: finalTickLower,
            tickUpper: finalTickUpper,
            amount0: amountToken.toString(),
            amount1: amountETH.toString(),
            positionManagerAddress,
            isAddingToken1,
            inputAmountToken: amountToken.toString(),
            inputAmountETH: amountETH.toString()
          });

          // Mint position
          const { request: mintRequest } = await publicClient.simulateContract({
            address: positionManagerAddress,
            abi: positionManagerAbi,
            functionName: 'mint',
            args: [
              token0,
              token1,
              3000,
              finalTickLower,
              finalTickUpper,
              amountToken,
              amountETH,
              0n, // amount0Min
              0n, // amount1Min
              address,
              BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour
            ],
            value: amountETH,
            account: address,
            chain: publicClient.chain,
          });

          const mintHash = await walletClient.writeContract(mintRequest);
          await publicClient.waitForTransactionReceipt({ hash: mintHash });

          setPoolAddress(poolAddress);
          setIsPoolExists(true);
          setIsPoolInitialized(true);

          return {
              poolAddress,
          };
        } catch (err) {
          console.error('Error adding limit order:', err);
          setError(err instanceof Error ? err.message : 'Failed to add limit order');
          throw err;
        }
      }
    } catch (err) {
      console.error('Error adding limit order:', err);
      setError(err instanceof Error ? err.message : 'Failed to add limit order');
      throw err;
    } finally {
      setIsLoading(false);
    }
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