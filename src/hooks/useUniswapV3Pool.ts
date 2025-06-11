import { useCallback, useState, useEffect } from "react";
import { Address, parseAbi, parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { mainnet, optimism, base, arbitrum, sepolia, optimismSepolia, baseSepolia, arbitrumSepolia } from "viem/chains";
import { getTokenCashOutQuoteEth } from "juice-sdk-core";
import { useJBContractContext, useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";

// Uniswap V3 Factory addresses for different networks
const UNISWAP_V3_FACTORY_ADDRESSES: Record<number, Address> = {
  [mainnet.id]: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  [optimism.id]: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  [base.id]: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
  [baseSepolia.id]: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
  [arbitrum.id]: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  [sepolia.id]: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
  [optimismSepolia.id]: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
  [arbitrumSepolia.id]: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
};

// WETH addresses for different networks
const WETH_ADDRESSES: Record<number, Address> = {
  [mainnet.id]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [optimism.id]: "0x4200000000000000000000000000000000000006",
  [base.id]: "0x4200000000000000000000000000000000000006",
  [baseSepolia.id]: "0x000000000000000000000000000000000000EEEe",
  [arbitrum.id]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  [sepolia.id]: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  [optimismSepolia.id]: "0x4200000000000000000000000000000000000006",
  [arbitrumSepolia.id]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
};

export function useUniswapV3Pool(tokenAddress: Address | undefined, chainId?: number) {
  const publicClient = usePublicClient();
  const { token } = useJBTokenContext();
  const [isPoolExists, setIsPoolExists] = useState<boolean | null>(null);
  const [poolAddress, setPoolAddress] = useState<Address | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { data: walletClient } = useWalletClient();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const checkPool = useCallback(async () => {
    if (!publicClient || !tokenAddress || !token?.data || !chainId) return false;

    try {
      console.log("Checking pool for chain ID:", chainId);
      
      const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainId];
      if (!factoryAddress) {
        console.log("No factory address found for chain:", chainId);
        return false;
      }

      // Verify the factory contract exists
      const code = await publicClient.getBytecode({ address: factoryAddress });
      if (!code || code === "0x") {
        console.log("Factory contract not deployed at", factoryAddress);
        return false;
      }

      console.log("Factory Address:", factoryAddress);
      console.log("Token Address:", tokenAddress);
      console.log("WETH Address:", WETH_ADDRESSES[chainId]);
      console.log("Chain ID:", chainId);
      console.log("Token Order:", tokenAddress < WETH_ADDRESSES[chainId] ? "Token-WETH" : "WETH-Token");

      try {
        const poolAddress = await publicClient.readContract({
          address: factoryAddress,
          abi: parseAbi([
            "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)",
          ]),
          functionName: "getPool",
          args: [
            tokenAddress < WETH_ADDRESSES[chainId] 
              ? tokenAddress 
              : WETH_ADDRESSES[chainId],
            tokenAddress < WETH_ADDRESSES[chainId] 
              ? WETH_ADDRESSES[chainId] 
              : tokenAddress,
            3000
          ],
        });

        console.log("Pool Address:", poolAddress);
        console.log("Is Zero Address:", poolAddress === "0x0000000000000000000000000000000000000000");

        setPoolAddress(poolAddress);
        const exists = poolAddress !== "0x0000000000000000000000000000000000000000";
        console.log("Setting pool exists to:", exists);
        setIsPoolExists(exists);

        // Check if pool is initialized (slot0 returns without error and sqrtPriceX96 > 0)
        if (exists) {
          try {
            const slot0 = await publicClient.readContract({
              address: poolAddress,
              abi: parseAbi([
                "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
              ]),
              functionName: "slot0",
              args: [],
            });
            setIsInitialized(slot0[0] > 0n);
          } catch (e) {
            setIsInitialized(false);
          }
        } else {
          setIsInitialized(false);
        }
        return exists;
      } catch (error) {
        // If the error is about no data returned, it means no pool exists
        if (error instanceof Error && error.message.includes("returned no data")) {
          console.log("No pool found for token pair");
          setIsPoolExists(false);
          setPoolAddress(null);
          setIsInitialized(false);
          return false;
        }
        // For other errors, log them
        console.error("Error checking pool:", error);
        console.error("Error details:", {
          factoryAddress,
          tokenAddress,
          wethAddress: WETH_ADDRESSES[chainId],
          chainId,
          error
        });
        setIsPoolExists(false);
        setPoolAddress(null);
        setIsInitialized(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking pool:", error);
      setIsPoolExists(false);
      setPoolAddress(null);
      setIsInitialized(false);
      return false;
    }
  }, [publicClient, tokenAddress, token?.data, chainId]);

  const initializePool = useCallback(async (initialPriceStr?: string) => {
    if (!publicClient || !tokenAddress || !token?.data || !chainId || !walletClient) {
      throw new Error("Missing required parameters for pool initialization");
    }

    try {
      setIsInitializing(true);
      const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainId];
      if (!factoryAddress) {
        throw new Error(`No factory address found for chain: ${chainId}`);
      }

      // Switch to the correct network if needed
      if (publicClient.chain.id !== chainId) {
        console.log("Switching to chain:", chainId);
        await walletClient.switchChain({ id: chainId });
        // Wait a moment for the network switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Verify the factory contract exists
      const code = await publicClient.getBytecode({ address: factoryAddress });
      if (!code || code === "0x") {
        console.log("Factory contract not deployed at", factoryAddress);
        throw new Error(`Factory contract not deployed at ${factoryAddress}`);
      }

      // Calculate initial price based on user input or default to 1:1
      let price = 1;
      if (initialPriceStr && !isNaN(Number(initialPriceStr)) && Number(initialPriceStr) > 0) {
        price = Number(initialPriceStr);
      }
      // price = ETH per token
      // sqrtPriceX96 = sqrt(price) * 2^96
      const sqrtPrice = Math.sqrt(price);
      const sqrtPriceX96 = BigInt(Math.floor(sqrtPrice * 2 ** 96));

      console.log("Creating pool with params:", {
        factoryAddress,
        tokenA: tokenAddress < WETH_ADDRESSES[chainId] ? tokenAddress : WETH_ADDRESSES[chainId],
        tokenB: tokenAddress < WETH_ADDRESSES[chainId] ? WETH_ADDRESSES[chainId] : tokenAddress,
        fee: 3000,
        sqrtPriceX96: chainId === baseSepolia.id ? sqrtPriceX96 : undefined
      });

      // Create the pool
      const { request } = await publicClient.simulateContract({
        address: factoryAddress,
        abi: parseAbi([
          // Try the newer version first (with sqrtPriceX96)
          "function createPool(address tokenA, address tokenB, uint24 fee, uint160 sqrtPriceX96) returns (address pool)",
          // Fallback to older version (without sqrtPriceX96)
          "function createPool(address tokenA, address tokenB, uint24 fee) returns (address pool)",
        ]),
        functionName: "createPool",
        args: chainId === baseSepolia.id 
          ? [
              tokenAddress < WETH_ADDRESSES[chainId] 
                ? tokenAddress 
                : WETH_ADDRESSES[chainId],
              tokenAddress < WETH_ADDRESSES[chainId] 
                ? WETH_ADDRESSES[chainId] 
                : tokenAddress,
              3000,
              sqrtPriceX96
            ]
          : [
              tokenAddress < WETH_ADDRESSES[chainId] 
                ? tokenAddress 
                : WETH_ADDRESSES[chainId],
              tokenAddress < WETH_ADDRESSES[chainId] 
                ? WETH_ADDRESSES[chainId] 
                : tokenAddress,
              3000
            ],
        account: walletClient?.account.address,
      });

      const hash = await walletClient?.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // For chains that don't support sqrtPriceX96 in createPool, we need to initialize the pool separately
      if (chainId !== baseSepolia.id) {
        const poolAddress = await publicClient.readContract({
          address: factoryAddress,
          abi: parseAbi([
            "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)",
          ]),
          functionName: "getPool",
          args: [
            tokenAddress < WETH_ADDRESSES[chainId] 
              ? tokenAddress 
              : WETH_ADDRESSES[chainId],
            tokenAddress < WETH_ADDRESSES[chainId] 
              ? WETH_ADDRESSES[chainId] 
              : tokenAddress,
            3000
          ],
        });

        if (poolAddress === "0x0000000000000000000000000000000000000000") {
          throw new Error("Pool creation failed");
        }

        // Initialize the pool with the price
        const { request: initRequest } = await publicClient.simulateContract({
          address: poolAddress,
          abi: parseAbi([
            "function initialize(uint160 sqrtPriceX96) external",
          ]),
          functionName: "initialize",
          args: [sqrtPriceX96],
          account: walletClient?.account.address,
        });

        const initHash = await walletClient?.writeContract(initRequest);
        await publicClient.waitForTransactionReceipt({ hash: initHash });
      }
      
      // Check if pool was created successfully
      const exists = await checkPool();
      if (!exists) {
        throw new Error("Pool creation failed");
      }
    } catch (error) {
      console.error("Error initializing pool:", error);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  }, [publicClient, tokenAddress, token?.data, chainId, walletClient, checkPool]);

  return {
    checkPool,
    initializePool,
    isInitializing,
    isPoolExists,
    poolAddress,
    isInitialized,
  };
} 