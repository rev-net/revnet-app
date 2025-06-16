import { useCallback, useState, useEffect } from "react";
import { Address, parseAbi, parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { mainnet, optimism, base, arbitrum, sepolia, optimismSepolia, baseSepolia, arbitrumSepolia } from "viem/chains";
import { getTokenCashOutQuoteEth } from "juice-sdk-core";
import { useJBContractContext, useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";

// Uniswap V3 Factory addresses for different networks
const UNISWAP_V3_FACTORY_ADDRESSES: Record<number, Address> = {
  [baseSepolia.id]: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
  [base.id]: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
  [sepolia.id]: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
  [mainnet.id]: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  [optimism.id]: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  [optimismSepolia.id]: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
  [arbitrum.id]: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  [arbitrumSepolia.id]: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
};

// WETH addresses for different networks
const WETH_ADDRESSES: Record<number, Address> = {
  [mainnet.id]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [optimism.id]: "0x4200000000000000000000000000000000000006",
  [base.id]: "0x4200000000000000000000000000000000000006",
  [baseSepolia.id]: "0x4200000000000000000000000000000000000006",
  [arbitrum.id]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  [sepolia.id]: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  [optimismSepolia.id]: "0x4200000000000000000000000000000000000006",
  [arbitrumSepolia.id]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
};

const TICK_SPACING = 60; // 0.3% fee tier

export function useUniswapV3Pool(tokenAddress: Address | undefined, chainId?: number) {
  const publicClient = usePublicClient();
  const { token } = useJBTokenContext();
  const [isPoolExists, setIsPoolExists] = useState<boolean | null>(null);
  const [poolAddress, setPoolAddress] = useState<Address | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { data: walletClient } = useWalletClient();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const checkPool = useCallback(async () => {
    if (!publicClient || !tokenAddress || !token?.data || !chainId) {
      console.log("Missing required parameters:", {
        hasPublicClient: !!publicClient,
        hasTokenAddress: !!tokenAddress,
        hasTokenData: !!token?.data,
        chainId
      });
      setIsPoolExists(false);
      setPoolAddress(null);
      setIsInitialized(false);
      return false;
    }

    try {
      console.log("Checking pool for chain ID:", chainId);
      console.log("Token Address:", tokenAddress);
      console.log("Token Symbol:", token.data.symbol);
      console.log("Current Chain ID:", publicClient.chain.id);
      
      const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainId];
      if (!factoryAddress) {
        console.log("No factory address found for chain:", chainId);
        setIsPoolExists(false);
        setPoolAddress(null);
        setIsInitialized(false);
        return false;
      }

      // Verify the factory contract exists
      try {
        const code = await publicClient.getBytecode({ address: factoryAddress });
        console.log("Factory contract bytecode length:", code ? code.length : 0);
        if (!code || code === "0x") {
          console.log("Factory contract not deployed at", factoryAddress);
          setIsPoolExists(false);
          setPoolAddress(null);
          setIsInitialized(false);
          return false;
        }
      } catch (error) {
        console.error("Error getting factory bytecode:", error);
        setIsPoolExists(false);
        setPoolAddress(null);
        setIsInitialized(false);
        return false;
      }

      console.log("Factory Address:", factoryAddress);
      console.log("WETH Address:", WETH_ADDRESSES[chainId]);
      console.log("Token Order:", tokenAddress < WETH_ADDRESSES[chainId] ? "Token-WETH" : "WETH-Token");

      try {
        // Try both token orderings to be thorough
        const token0 = tokenAddress < WETH_ADDRESSES[chainId] ? tokenAddress : WETH_ADDRESSES[chainId];
        const token1 = tokenAddress < WETH_ADDRESSES[chainId] ? WETH_ADDRESSES[chainId] : tokenAddress;

        console.log("Checking pool with token0:", token0);
        console.log("Checking pool with token1:", token1);

        // Check all fee tiers
        const feeTiers = [500, 3000, 10000];
        for (const fee of feeTiers) {
          console.log(`Checking ${fee/10000}% fee tier...`);
          const poolAddress = await publicClient.readContract({
            address: factoryAddress,
            abi: parseAbi([
              "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)",
            ]),
            functionName: "getPool",
            args: [token0, token1, fee],
          });
          console.log(`Pool Address (${fee/10000}% fee):`, poolAddress);
          
          if (poolAddress !== "0x0000000000000000000000000000000000000000") {
            console.log("Found pool at address:", poolAddress);
            setPoolAddress(poolAddress);
            setIsPoolExists(true);
            
            // Check if pool is initialized
            try {
              console.log("Checking pool initialization...");
              const slot0 = await publicClient.readContract({
                address: poolAddress,
                abi: parseAbi([
                  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
                ]),
                functionName: "slot0",
                args: [],
              });
              console.log("Pool slot0:", slot0);
              const isInitialized = slot0[0] > 0n;
              console.log("Pool is initialized:", isInitialized);
              setIsInitialized(isInitialized);
            } catch (e) {
              console.error("Error checking pool initialization:", e);
              setIsInitialized(false);
            }
            
            return true;
          }
        }

        // No pool found in any fee tier
        console.log("No pool found in any fee tier");
        setIsPoolExists(false);
        setPoolAddress(null);
        setIsInitialized(false);
        return false;
      } catch (error) {
        console.error("Error checking pool:", error);
        setIsPoolExists(false);
        setPoolAddress(null);
        setIsInitialized(false);
        return false;
      }
    } catch (error) {
      console.error("Error in checkPool:", error);
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

      // Calculate ticks based on price
      const tick = Math.floor(Math.log(price) / Math.log(1.0001));
      let finalTickLower = Math.floor(tick / TICK_SPACING) * TICK_SPACING;
      let finalTickUpper = finalTickLower + TICK_SPACING;

      // Ensure ticks are aligned with tick spacing
      finalTickLower = Math.floor(finalTickLower / TICK_SPACING) * TICK_SPACING;
      finalTickUpper = Math.floor(finalTickUpper / TICK_SPACING) * TICK_SPACING;
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