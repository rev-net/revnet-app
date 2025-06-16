import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { Pool, Position, TickMath } from '@uniswap/v3-sdk';
import { Token, CurrencyAmount, Percent } from '@uniswap/sdk-core';
import { getContract, type Address, type PublicClient, type WalletClient } from 'viem';
import JSBI from 'jsbi';

// Factory addresses for different networks
const UNISWAP_V3_FACTORY_ADDRESSES = {
  'base-sepolia': '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  'base': '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  'sepolia': '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
  'ethereum': '0x1F98431c8aD98523631AE4a59f267346ea31F984',
} as const;

// WETH addresses for different networks
const WETH_ADDRESSES = {
  'base-sepolia': '0x4200000000000000000000000000000000000006',
  'base': '0x4200000000000000000000000000000000000006',
  'sepolia': '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  'ethereum': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
} as const;

// ABI for Uniswap V3 Factory
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

// ABI for Uniswap V3 Pool
const UNISWAP_V3_POOL_ABI = [
  {
    inputs: [{ name: 'sqrtPriceX96', type: 'uint160' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
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
] as const;

type SupportedChainId = keyof typeof UNISWAP_V3_FACTORY_ADDRESSES;

type FactoryContract = {
  read: {
    getPool: (args: [Address, Address, number]) => Promise<Address>;
  };
  write: {
    createPool: (args: [Address, Address, number]) => Promise<`0x${string}`>;
  };
};

type PoolContract = {
  read: {
    slot0: () => Promise<[bigint, number, number, number, number, number, boolean]>;
  };
  write: {
    initialize: (args: [bigint]) => Promise<`0x${string}`>;
  };
};

export function useUniswapV3SDK() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poolAddress, setPoolAddress] = useState<string | null>(null);
  const [isPoolExists, setIsPoolExists] = useState(false);
  const [isPoolInitialized, setIsPoolInitialized] = useState(false);

  const checkPoolExists = useCallback(async (tokenAddress: string, chainId: number) => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    try {
      setIsLoading(true);
      setError(null);

      const chainIdKey = chainId.toString() as SupportedChainId;
      const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainIdKey];
      const wethAddress = WETH_ADDRESSES[chainIdKey];

      if (!factoryAddress || !wethAddress) {
        throw new Error('Unsupported network');
      }

      const factoryContract = getContract({
        address: factoryAddress as Address,
        abi: UNISWAP_V3_FACTORY_ABI,
        client: publicClient,
      }) as unknown as FactoryContract;

      // Check if pool exists
      const poolAddress = await factoryContract.read.getPool([
        tokenAddress as Address,
        wethAddress as Address,
        3000, // 0.3% fee tier
      ]);

      if (poolAddress === '0x0000000000000000000000000000000000000000') {
        setIsPoolExists(false);
        setPoolAddress(null);
        setIsPoolInitialized(false);
        return false;
      }

      setPoolAddress(poolAddress);
      setIsPoolExists(true);

      // Check if pool is initialized
      const poolContract = getContract({
        address: poolAddress as Address,
        abi: UNISWAP_V3_POOL_ABI,
        client: publicClient,
      }) as unknown as PoolContract;

      const slot0 = await poolContract.read.slot0();
      const isInitialized = slot0[0] !== 0n; // sqrtPriceX96 is 0 if not initialized
      setIsPoolInitialized(isInitialized);

      return true;
    } catch (err) {
      console.error('Error checking pool:', err);
      setError(err instanceof Error ? err.message : 'Failed to check pool');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  const initializePool = useCallback(async (tokenAddress: string, chainId: number, initialPrice: number) => {
    if (!walletClient || !publicClient) {
      throw new Error('Wallet or public client not available');
    }

    try {
      setIsLoading(true);
      setError(null);

      const chainIdKey = chainId.toString() as SupportedChainId;
      const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainIdKey];
      const wethAddress = WETH_ADDRESSES[chainIdKey];

      if (!factoryAddress || !wethAddress) {
        throw new Error('Unsupported network');
      }

      const factoryContract = getContract({
        address: factoryAddress as Address,
        abi: UNISWAP_V3_FACTORY_ABI,
        client: publicClient,
      }) as unknown as FactoryContract;

      // Check if pool exists
      const poolAddress = await factoryContract.read.getPool([
        tokenAddress as Address,
        wethAddress as Address,
        3000, // 0.3% fee tier
      ]);

      let poolContract: PoolContract;
      if (poolAddress === '0x0000000000000000000000000000000000000000') {
        // Create pool if it doesn't exist
        const tx = await factoryContract.write.createPool([
          tokenAddress as Address,
          wethAddress as Address,
          3000, // 0.3% fee tier
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });

        // Get the new pool address
        const newPoolAddress = await factoryContract.read.getPool([
          tokenAddress as Address,
          wethAddress as Address,
          3000,
        ]);
        poolContract = getContract({
          address: newPoolAddress as Address,
          abi: UNISWAP_V3_POOL_ABI,
          client: publicClient,
        }) as unknown as PoolContract;
        setPoolAddress(newPoolAddress);
        setIsPoolExists(true);
      } else {
        poolContract = getContract({
          address: poolAddress as Address,
          abi: UNISWAP_V3_POOL_ABI,
          client: publicClient,
        }) as unknown as PoolContract;
      }

      // Check if pool is already initialized
      const slot0 = await poolContract.read.slot0();
      if (slot0[0] !== 0n) {
        setIsPoolInitialized(true);
        return;
      }

      // Calculate sqrtPriceX96 from the initial price
      const tick = Math.log(initialPrice) / Math.log(1.0001);
      const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick);
      const sqrtPriceX96BigInt = BigInt(JSBI.toNumber(sqrtPriceX96));

      // Initialize the pool
      const tx = await poolContract.write.initialize([sqrtPriceX96BigInt]);
      await publicClient.waitForTransactionReceipt({ hash: tx });

      setIsPoolInitialized(true);
    } catch (err) {
      console.error('Error initializing pool:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize pool');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, walletClient]);

  return {
    isLoading,
    error,
    poolAddress,
    isPoolExists,
    isPoolInitialized,
    checkPoolExists,
    initializePool,
  };
} 