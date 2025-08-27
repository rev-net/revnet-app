import { useState, useEffect, useCallback } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { Address } from "viem";
import { UNISWAP_ABIS, UNISWAP_CONSTANTS, PoolState, getFactoryAddress } from "@/lib/uniswap";
import { calculateSqrtPriceX96 } from "@/lib/uniswap";

interface UseUniswapPoolParams {
  tokenA: Address;
  tokenB: Address;
  fee: number;
  chainId: number;
}

interface UseUniswapPoolReturn {
  poolAddress: Address | null;
  poolState: PoolState;
  isLoading: boolean;
  error: string | null;
  createPool: () => Promise<void>;
  initializePool: (price: number) => Promise<void>;
  refetch: () => void;
}

export function useUniswapPool({
  tokenA,
  tokenB,
  fee,
  chainId
}: UseUniswapPoolParams): UseUniswapPoolReturn {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [poolAddress, setPoolAddress] = useState<Address | null>(null);
  const [poolState, setPoolState] = useState<PoolState>({
    exists: false,
    hasInitialPrice: false,
    hasLiquidity: false,
    address: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get factory address for the chain
  const factoryAddress = getFactoryAddress(chainId);

  // Check if pool exists and get its state
  const checkPoolState = useCallback(async () => {
    if (!publicClient || !factoryAddress) {
      setError("Public client or factory address not available");
      return;
    }

    try {
      setError(null);
      
      // Get pool address from factory
      const poolAddr = await publicClient.readContract({
        address: factoryAddress,
        abi: UNISWAP_ABIS.FACTORY,
        functionName: "getPool",
        args: [tokenA, tokenB, fee]
      }) as Address;

      if (!poolAddr || poolAddr === "0x0000000000000000000000000000000000000000") {
        setPoolState({
          exists: false,
          hasInitialPrice: false,
          hasLiquidity: false,
          address: null,
        });
        setPoolAddress(null);
        return;
      }

      setPoolAddress(poolAddr);

      // Check if pool is initialized
      let hasInitialPrice = false;
      let hasLiquidity = false;

      try {
        const slot0 = await publicClient.readContract({
          address: poolAddr,
          abi: UNISWAP_ABIS.POOL,
          functionName: "slot0"
        });

        // If slot0 returns without error, pool is initialized
        hasInitialPrice = true;

        // Check if there's liquidity
        const liquidity = await publicClient.readContract({
          address: poolAddr,
          abi: UNISWAP_ABIS.POOL,
          functionName: "liquidity"
        });

        hasLiquidity = Number(liquidity) > 0;
      } catch (slot0Error) {
        // Pool exists but is not initialized
        hasInitialPrice = false;
        hasLiquidity = false;
      }

      setPoolState({
        exists: true,
        hasInitialPrice,
        hasLiquidity,
        address: poolAddr,
      });

    } catch (err) {
      console.error("Error checking pool state:", err);
      setError(err instanceof Error ? err.message : "Failed to check pool state");
    }
  }, [publicClient, factoryAddress, tokenA, tokenB, fee]);

  // Create pool
  const createPool = useCallback(async () => {
    if (!publicClient || !walletClient || !factoryAddress) {
      setError("Public client, wallet client, or factory address not available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        address: factoryAddress,
        abi: UNISWAP_ABIS.FACTORY,
        functionName: "createPool",
        args: [tokenA, tokenB, fee],
        account: walletClient.account,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Pool created:", receipt);

      // Update pool state after creation
      await checkPoolState();
    } catch (err) {
      console.error("Error creating pool:", err);
      setError(err instanceof Error ? err.message : "Failed to create pool");
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, walletClient, factoryAddress, tokenA, tokenB, fee, checkPoolState]);

  // Initialize pool with price
  const initializePool = useCallback(async (price: number) => {
    if (!publicClient || !walletClient || !poolAddress) {
      setError("Public client, wallet client, or pool address not available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Calculate sqrtPriceX96 for Uniswap V3
      const tokensPerNative = 1 / price;
      const sqrtPriceX96 = calculateSqrtPriceX96(tokensPerNative);

      console.log("Pool Initialization:", {
        price,
        tokensPerNative,
        sqrtPriceX96: sqrtPriceX96.toString(),
      });

      const hash = await walletClient.writeContract({
        address: poolAddress,
        abi: UNISWAP_ABIS.POOL,
        functionName: "initialize",
        args: [sqrtPriceX96],
        account: walletClient.account,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Pool initialized:", receipt);

      // Update pool state after initialization
      await checkPoolState();
    } catch (err) {
      console.error("Error initializing pool:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize pool");
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, walletClient, poolAddress, checkPoolState]);

  // Refetch pool state
  const refetch = useCallback(() => {
    checkPoolState();
  }, [checkPoolState]);

  // Check pool state on mount and when dependencies change
  useEffect(() => {
    checkPoolState();
  }, [checkPoolState]);

  return {
    poolAddress,
    poolState,
    isLoading,
    error,
    createPool,
    initializePool,
    refetch,
  };
}
