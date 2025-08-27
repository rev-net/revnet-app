import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Address, formatEther } from "viem";
import { Token } from "@uniswap/sdk-core";
import { POSITION_MANAGER_ADDRESSES, UNISWAP_V3_FACTORY_ADDRESSES } from "@/constants";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PriceRangeChart } from "./PriceRangeChart";

// Uniswap V3 Nonfungible Position Manager ABI
const NONFUNGIBLE_POSITION_MANAGER_ABI = [
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "positions",
    outputs: [
      { name: "nonce", type: "uint96" },
      { name: "operator", type: "address" },
      { name: "token0", type: "address" },
      { name: "token1", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "tickLower", type: "int24" },
      { name: "tickUpper", type: "int24" },
      { name: "liquidity", type: "uint128" },
      { name: "feeGrowthInside0LastX128", type: "uint256" },
      { name: "feeGrowthInside1LastX128", type: "uint256" },
      { name: "tokensOwed0", type: "uint128" },
      { name: "tokensOwed1", type: "uint128" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" }
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "liquidity", type: "uint128" },
          { name: "amount0Min", type: "uint256" },
          { name: "amount1Min", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ],
        name: "params",
        type: "tuple"
      }
    ],
    name: "decreaseLiquidity",
    outputs: [
      { name: "amount0", type: "uint256" },
      { name: "amount1", type: "uint256" }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "recipient", type: "address" },
          { name: "amount0Max", type: "uint256" },
          { name: "amount1Max", type: "uint256" }
        ],
        name: "params",
        type: "tuple"
      }
    ],
    name: "collect",
    outputs: [
      { name: "amount0", type: "uint256" },
      { name: "amount1", type: "uint256" }
    ],
    stateMutability: "payable",
    type: "function"
  }
] as const;

// Uniswap V3 Pool ABI (for fee calculations)
const POOL_ABI = [
  {
    inputs: [],
    name: "slot0",
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "tick", type: "int24" }],
    name: "ticks",
    outputs: [
      { name: "liquidityGross", type: "uint128" },
      { name: "liquidityNet", type: "int128" },
      { name: "feeGrowthOutside0X128", type: "uint256" },
      { name: "feeGrowthOutside1X128", type: "uint256" },
      { name: "tickCumulativeOutside", type: "uint256" },
      { name: "secondsPerLiquidityOutsideX128", type: "uint256" },
      { name: "secondsOutside", type: "uint32" },
      { name: "initialized", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "feeGrowthGlobal0X128",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "feeGrowthGlobal1X128",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// Uniswap V3 Factory ABI (to get pool address)
const FACTORY_ABI = [
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" }
    ],
    name: "getPool",
    outputs: [{ name: "pool", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

interface Position {
  tokenId: bigint;
  token0: Address;
  token1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
  // Enhanced fields
  isLimitOrder?: boolean;
  limitPrice?: number;
  currentMarketTick?: number;
  status?: "active" | "executed" | "expired";
  token0Symbol?: string;
  token1Symbol?: string;
  feeGrowthInside0LastX128?: bigint;
  feeGrowthInside1LastX128?: bigint;
}

interface PositionsListProps {
  projectToken: Token;
  nativeToken: Token;
}

export function PositionsList({ projectToken, nativeToken }: PositionsListProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const { toast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPosition, setProcessingPosition] = useState<bigint | null>(null);
  const [hiddenPositions, setHiddenPositions] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [showActivePositions, setShowActivePositions] = useState(true);
  const [showClosedPositions, setShowClosedPositions] = useState(false);
  const [feeCheckResults, setFeeCheckResults] = useState<Map<string, { collectable: boolean; error?: string }>>(new Map());
  const [calculatedFees, setCalculatedFees] = useState<Map<string, { fee0: bigint; fee1: bigint }>>(new Map());
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [currentMarketPrices, setCurrentMarketPrices] = useState<Record<string, number>>({});
  const [liquidityPercentages, setLiquidityPercentages] = useState<Record<string, string>>({});

  // Function to fetch current market price from pool
  const fetchCurrentMarketPrice = async (position: Position): Promise<number> => {
    try {
      if (!publicClient) {
        console.warn("Public client not available");
        return 0.004141; // fallback
      }

      // Get pool address from factory
      const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[projectToken.chainId];
      if (!factoryAddress) {
        console.warn("No factory address for chain:", projectToken.chainId);
        return 0.004141; // fallback
      }

      const poolAddress = await publicClient.readContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "getPool",
        args: [position.token0, position.token1, position.fee]
      });

      if (!poolAddress || poolAddress === "0x0000000000000000000000000000000000000000") {
        console.warn("No pool found for position:", position.tokenId);
        return 0.004141; // fallback
      }

      // Get current tick from pool's slot0
      const slot0 = await publicClient.readContract({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: "slot0"
      });

      const currentTick = slot0[1]; // tick is the second element
      const rawMarketPrice = Math.pow(1.0001, Number(currentTick));

      // Determine if token0 is ETH/WETH
      const isToken0Eth = position.token0.toLowerCase() === nativeToken.address.toLowerCase();
      const marketPrice = isToken0Eth ? (1 / rawMarketPrice) : rawMarketPrice;

      console.log(`Position ${position.tokenId} market price from pool:`, {
        poolAddress,
        currentTick: Number(currentTick),
        rawMarketPrice,
        marketPrice,
        isToken0Eth
      });

      return marketPrice;
    } catch (error) {
      console.error("Error fetching market price for position", position.tokenId, ":", error);
      return 0.004141; // fallback
    }
  };

  // Fetch ETH price for USD conversions with browser caching
  useEffect(() => {
    const fetchEthPrice = async () => {
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
      const CACHE_KEY = "eth_price_cache";

      try {
        // Check localStorage for cached price
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { price, timestamp } = JSON.parse(cached);
          const now = Date.now();

          // Use cached price if it's still fresh
          if (price && (now - timestamp) < CACHE_DURATION) {
            console.log("Using cached ETH price:", price);
            setEthPrice(price);
            return;
          }
        }

        // Fetch new price from API
        console.log("Fetching fresh ETH price from Coingecko...");
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const newPrice = data.ethereum.usd;

        // Cache the new price
        const cacheData = {
          price: newPrice,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

        setEthPrice(newPrice);
        console.log("Updated ETH price cache:", newPrice);

      } catch (error) {
        console.error("Failed to fetch ETH price:", error);

        // Try to use cached price even if expired
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { price } = JSON.parse(cached);
          if (price) {
            console.log("Using expired cached ETH price as fallback:", price);
            setEthPrice(price);
            return;
          }
        }

        // No price available - don't set a fallback
        console.log("No ETH price available - will show ETH prices without USD conversion");
      }
    };

    fetchEthPrice();
  }, []); // Only run once on component mount

  // Fetch market prices for all positions
  useEffect(() => {
    const fetchMarketPrices = async () => {
      if (!positions.length || !publicClient) return;

      const newMarketPrices: Record<string, number> = {};

      for (const position of positions) {
        if (position.liquidity > 0n) { // Only fetch for active positions
          const marketPrice = await fetchCurrentMarketPrice(position);
          newMarketPrices[position.tokenId.toString()] = marketPrice;
        }
      }

      setCurrentMarketPrices(newMarketPrices);
    };

    fetchMarketPrices();
  }, [positions, publicClient]);

  // Calculate liquidity percentage based on position size
  const getLiquidityPercentage = (positionLiquidity: bigint) => {
    const positionLiquidityNum = Number(formatEther(positionLiquidity));

    // More realistic estimates based on position size
    if (positionLiquidityNum > 10) {
      return "~100%"; // Large position, likely the only one in pool
    } else if (positionLiquidityNum > 1) {
      return "~50%"; // Medium position
    } else if (positionLiquidityNum > 0.1) {
      return "~10%"; // Small position
    } else {
      return "~1%"; // Very small position
    }
  };

  // Convert price to USD
  const convertPriceToUSD = (priceInEth: number, ethPriceUsd: number | null) => {
    if (!ethPriceUsd) {
      // Show ETH price when USD price is not available
      return `${priceInEth.toFixed(8)} ETH`;
    }
    const priceInUsd = priceInEth * ethPriceUsd;
    return `$${priceInUsd.toFixed(6)}`;
  };

  useEffect(() => {
    const fetchPositions = async () => {
      if (!address || !publicClient) return;

      try {
        setIsLoading(true);
        setError(null);

        const positionManagerAddress = POSITION_MANAGER_ADDRESSES[projectToken.chainId];
        if (!positionManagerAddress) {
          throw new Error(`Position Manager not found for chain ID ${projectToken.chainId}`);
        }

        console.log("Chain ID:", projectToken.chainId);
        console.log("Using Position Manager:", positionManagerAddress);

        // Verify the contract exists and has the balanceOf function
        try {
          const code = await publicClient.getBytecode({ address: positionManagerAddress });
          if (!code || code === "0x") {
            throw new Error(`No contract found at address ${positionManagerAddress}`);
          }
        } catch (error) {
          console.error("Error verifying contract:", error);
          throw new Error(`Invalid contract at address ${positionManagerAddress}`);
        }

        // Get total number of positions
        const balance = await publicClient.readContract({
          address: positionManagerAddress,
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: "balanceOf",
          args: [address]
        });

        console.log("Found positions:", Number(balance));

        // Fetch each position
        const positionsPromises = Array.from({ length: Number(balance) }, async (_, index) => {
          const tokenId = await publicClient.readContract({
            address: positionManagerAddress,
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "tokenOfOwnerByIndex",
            args: [address, BigInt(index)]
          });

          const position = await publicClient.readContract({
            address: positionManagerAddress,
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "positions",
            args: [tokenId]
          });

          // Debug: Log the raw position data
          console.log(`Position ${tokenId}:`, {
            nonce: position[0].toString(),
            operator: position[1],
            token0: position[2],
            token1: position[3],
            fee: Number(position[4]),
            tickLower: Number(position[5]),
            tickUpper: Number(position[6]),
            liquidity: position[7].toString(),
            feeGrowthInside0LastX128: position[8].toString(),
            feeGrowthInside1LastX128: position[9].toString(),
            tokensOwed0: position[10].toString(),
            tokensOwed1: position[11].toString(),
            owner: address, // Show who we're checking for
            positionOwner: position[1] // Show who actually owns the position
          });

          return {
            tokenId,
            token0: position[2],
            token1: position[3],
            fee: Number(position[4]),
            tickLower: Number(position[5]),
            tickUpper: Number(position[6]),
            liquidity: position[7],
            tokensOwed0: position[10],
            tokensOwed1: position[11],
            feeGrowthInside0LastX128: position[8],
            feeGrowthInside1LastX128: position[9]
          };
        });

        const allPositions = await Promise.all(positionsPromises);

        // Filter positions for this pool
        const poolPositions = allPositions.filter(pos =>
          (pos.token0.toLowerCase() === projectToken.address.toLowerCase() &&
           pos.token1.toLowerCase() === nativeToken.address.toLowerCase()) ||
          (pos.token0.toLowerCase() === nativeToken.address.toLowerCase() &&
           pos.token1.toLowerCase() === projectToken.address.toLowerCase())
        );

        // Filter out executed positions with no fees (NFT still exists but position is worthless)
        const activePositions = poolPositions.filter(pos => {
          const hasLiquidity = pos.liquidity > 0n;
          const hasFees = pos.tokensOwed0 > 0n || pos.tokensOwed1 > 0n;
          const shouldKeep = hasLiquidity || hasFees;

          if (!shouldKeep) {
            console.log(`🗑️ Filtering out position ${pos.tokenId}: no liquidity (${pos.liquidity}) and no fees (${pos.tokensOwed0}/${pos.tokensOwed1})`);
          }

          return shouldKeep; // Keep if has liquidity OR has fees
        });

        // Enhance positions with additional information
        const enhancedPositions = activePositions.map(pos => {
          // Determine token order and symbols
          const isProjectToken0 = pos.token0.toLowerCase() === projectToken.address.toLowerCase();
          const token0Symbol = isProjectToken0 ? projectToken.symbol : nativeToken.symbol;
          const token1Symbol = isProjectToken0 ? nativeToken.symbol : projectToken.symbol;

          // Calculate prices from ticks
          const priceFromTickLower = Math.pow(1.0001, pos.tickLower);
          const priceFromTickUpper = Math.pow(1.0001, pos.tickUpper);

          // Detect if this is a limit order (one-sided liquidity in a tight range)
          const tickRange = pos.tickUpper - pos.tickLower;
          const isLimitOrder = tickRange <= 20; // 20 ticks or less is likely a limit order

          // Calculate limit price (middle of the range)
          const limitTick = Math.floor((pos.tickLower + pos.tickUpper) / 2);
          const limitPrice = Math.pow(1.0001, limitTick);

          // Determine status based on liquidity and owed tokens
          let status: "active" | "executed" | "expired" = "active";
          if (pos.liquidity === 0n) {
            status = "executed";
          }

          return {
            ...pos,
            token0Symbol,
            token1Symbol,
            isLimitOrder,
            limitPrice,
            status
          };
        });

        console.log("Enhanced pool positions:", enhancedPositions);

        // Debug: Log each position's fee information
        enhancedPositions.forEach(pos => {
          console.log(`Position ${pos.tokenId}:`, {
            liquidity: pos.liquidity.toString(),
            tokensOwed0: pos.tokensOwed0.toString(),
            tokensOwed1: pos.tokensOwed1.toString(),
            hasFees: pos.tokensOwed0 > 0n || pos.tokensOwed1 > 0n,
            status: pos.status
          });
        });

        setPositions(enhancedPositions);

        // Calculate accumulated fees for active positions
        const feeCalculations = new Map<string, { fee0: bigint; fee1: bigint }>();
        for (const position of enhancedPositions) {
          if (position.liquidity > 0n) {
            const calculatedFees = await calculateAccumulatedFees(position);
            if (calculatedFees) {
              feeCalculations.set(position.tokenId.toString(), calculatedFees);
            }
          }
        }
        setCalculatedFees(feeCalculations);

      } catch (error) {
        console.error("Error fetching positions:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch positions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, [address, publicClient, projectToken, nativeToken]);

  // Function to check if fees are actually collectable
  const checkFeesCollectable = async (position: Position): Promise<{ collectable: boolean; error?: string }> => {
    if (!publicClient || !address) return { collectable: false, error: "No client or address" };

    const positionManagerAddress = POSITION_MANAGER_ADDRESSES[projectToken.chainId];
    if (!positionManagerAddress) {
      return { collectable: false, error: "Position Manager not found" };
    }

    try {
      // First, check if the position belongs to the current user
      const positionOwner = await publicClient.readContract({
        address: positionManagerAddress as Address,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "ownerOf",
        args: [position.tokenId]
      }) as Address;

      if (positionOwner.toLowerCase() !== address.toLowerCase()) {
        return { collectable: false, error: "Position does not belong to current user" };
      }

      // Check if there's an operator set that might affect collection
      const positionData = await publicClient.readContract({
        address: positionManagerAddress as Address,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "positions",
        args: [position.tokenId]
      });

      const operator = positionData[1] as Address;
      console.log(`Position ${position.tokenId} operator:`, operator);
      console.log("Current user:", address);

      // Check if position has liquidity (might affect collection)
      const liquidity = positionData[7] as bigint;
      console.log(`Position ${position.tokenId} liquidity:`, liquidity.toString());

      // Try to simulate the collect transaction
      await publicClient.simulateContract({
        address: positionManagerAddress as Address,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "collect",
        args: [{
          tokenId: position.tokenId,
          recipient: address,
          amount0Max: position.tokensOwed0,
          amount1Max: position.tokensOwed1
        }],
        account: address
      });
      return { collectable: true };
    } catch (error) {
      console.log(`Fee check failed for position ${position.tokenId}:`, error);
      return {
        collectable: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  };

  // Function to get current fee amounts for active positions
  const getCurrentFees = async (position: Position): Promise<{ fee0: bigint; fee1: bigint } | null> => {
    if (!publicClient || position.liquidity === 0n) return null;

    try {
      // Get the pool address from the position manager
      const positionManagerAddress = POSITION_MANAGER_ADDRESSES[projectToken.chainId];
      if (!positionManagerAddress) return null;

      // For active positions, we need to calculate fees from the pool
      // This is more complex and requires reading pool state
      // For now, let's just return null and rely on tokensOwed
      return null;
    } catch (error) {
      console.error("Error getting current fees:", error);
      return null;
    }
  };

  // Function to calculate accumulated fees from pool data
  const calculateAccumulatedFees = async (position: Position): Promise<{ fee0: bigint; fee1: bigint } | null> => {
    if (!publicClient || position.liquidity === 0n) return null;

    try {
      // Get the factory address
      const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[projectToken.chainId];
      if (!factoryAddress) {
        console.error("Factory address not found for chain ID:", projectToken.chainId);
        return null;
      }

      // Get the pool address
      const poolAddress = await publicClient.readContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "getPool",
        args: [position.token0, position.token1, position.fee]
      }) as Address;

      if (!poolAddress || poolAddress === "0x0000000000000000000000000000000000000000") {
        console.log(`Pool not found for ${position.token0}/${position.token1} with fee ${position.fee}`);
        return null;
      }

      console.log(`Pool address for position ${position.tokenId}:`, poolAddress);

      // Read the pool's current fee growth
      const [feeGrowthGlobal0X128, feeGrowthGlobal1X128] = await Promise.all([
        publicClient.readContract({
          address: poolAddress,
          abi: POOL_ABI,
          functionName: "feeGrowthGlobal0X128"
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: POOL_ABI,
          functionName: "feeGrowthGlobal1X128"
        })
      ]);

      // Read the current tick
      const slot0 = await publicClient.readContract({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: "slot0"
      });
      const currentTick = slot0[1] as number;

      // Read tick data for lower and upper ticks
      const [lowerTickData, upperTickData] = await Promise.all([
        publicClient.readContract({
          address: poolAddress,
          abi: POOL_ABI,
          functionName: "ticks",
          args: [position.tickLower]
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: POOL_ABI,
          functionName: "ticks",
          args: [position.tickUpper]
        })
      ]);

      // Calculate fee growth inside the position's range
      const feeGrowthOutsideLower0X128 = lowerTickData[2] as bigint;
      const feeGrowthOutsideLower1X128 = lowerTickData[3] as bigint;
      const feeGrowthOutsideUpper0X128 = upperTickData[2] as bigint;
      const feeGrowthOutsideUpper1X128 = upperTickData[3] as bigint;

      // Calculate fee growth inside the range
      let feeGrowthInside0X128: bigint;
      let feeGrowthInside1X128: bigint;

      if (currentTick < position.tickLower) {
        // Current tick is below the range
        feeGrowthInside0X128 = feeGrowthOutsideLower0X128 - feeGrowthOutsideUpper0X128;
        feeGrowthInside1X128 = feeGrowthOutsideLower1X128 - feeGrowthOutsideUpper1X128;
      } else if (currentTick >= position.tickUpper) {
        // Current tick is above the range
        feeGrowthInside0X128 = feeGrowthOutsideUpper0X128 - feeGrowthOutsideLower0X128;
        feeGrowthInside1X128 = feeGrowthOutsideUpper1X128 - feeGrowthOutsideLower1X128;
      } else {
        // Current tick is inside the range
        feeGrowthInside0X128 = feeGrowthGlobal0X128 - feeGrowthOutsideLower0X128 - feeGrowthOutsideUpper0X128;
        feeGrowthInside1X128 = feeGrowthGlobal1X128 - feeGrowthOutsideLower1X128 - feeGrowthOutsideUpper1X128;
      }

      // Calculate accumulated fees
      const feeGrowthInside0DeltaX128 = feeGrowthInside0X128 - (position.feeGrowthInside0LastX128 || 0n);
      const feeGrowthInside1DeltaX128 = feeGrowthInside1X128 - (position.feeGrowthInside1LastX128 || 0n);

      const fee0 = (feeGrowthInside0DeltaX128 * position.liquidity) / (2n ** 128n);
      const fee1 = (feeGrowthInside1DeltaX128 * position.liquidity) / (2n ** 128n);

      console.log(`Calculated fees for position ${position.tokenId}:`, {
        fee0: fee0.toString(),
        fee1: fee1.toString(),
        feeGrowthInside0DeltaX128: feeGrowthInside0DeltaX128.toString(),
        feeGrowthInside1DeltaX128: feeGrowthInside1DeltaX128.toString(),
        liquidity: position.liquidity.toString()
      });

      return { fee0, fee1 };
    } catch (error) {
      console.error("Error calculating accumulated fees:", error);
      return null;
    }
  };

  // Check fees when positions are loaded
  useEffect(() => {
    const checkAllFees = async () => {
      if (positions.length === 0) return;

      const results = new Map<string, { collectable: boolean; error?: string }>();

      for (const position of positions) {
        // Only check positions that show fees
        if (position.tokensOwed0 > 0n || position.tokensOwed1 > 0n) {
          const result = await checkFeesCollectable(position);
          results.set(position.tokenId.toString(), result);
        }
      }

      setFeeCheckResults(results);
    };

    checkAllFees();
  }, [positions, publicClient, address, projectToken.chainId]);

  const handleClosePosition = async (position: Position) => {
    if (!address || !walletClient?.data || !publicClient) return;

    try {
      setProcessingPosition(position.tokenId);

      const positionManagerAddress = POSITION_MANAGER_ADDRESSES[projectToken.chainId];
      if (!positionManagerAddress) {
        throw new Error("Position Manager not found for this chain");
      }

      // Step 1: Decrease liquidity to 0 (close the position)
      const decreaseParams = {
        tokenId: position.tokenId,
        liquidity: position.liquidity, // Remove all liquidity
        amount0Min: 0n, // Accept any amount of token0
        amount1Min: 0n, // Accept any amount of token1
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20 minutes
      };

      console.log("🔄 Closing position:", decreaseParams);

      const decreaseHash = await walletClient.data.writeContract({
        address: positionManagerAddress as Address,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "decreaseLiquidity",
        args: [decreaseParams],
        account: address
      });

      await publicClient.waitForTransactionReceipt({ hash: decreaseHash });
      console.log("✅ Position liquidity decreased");

      // Step 2: Check if there are any tokens to collect after decreasing liquidity
      try {
        // Read the updated position data to see what's available to collect
        const updatedPosition = await publicClient.readContract({
          address: positionManagerAddress as Address,
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: "positions",
          args: [position.tokenId]
        });

        const tokensOwed0 = updatedPosition[10]; // tokensOwed0
        const tokensOwed1 = updatedPosition[11]; // tokensOwed1

        console.log("📊 Tokens available after decrease:", {
          tokensOwed0: tokensOwed0.toString(),
          tokensOwed1: tokensOwed1.toString()
        });

        // Only collect if there are tokens to collect
        if (tokensOwed0 > 0n || tokensOwed1 > 0n) {
          const collectParams = {
            tokenId: position.tokenId,
            recipient: address,
            amount0Max: tokensOwed0,
            amount1Max: tokensOwed1
          };

          console.log("🔄 Collecting tokens:", collectParams);

          // Simulate the collect transaction first
          try {
            await publicClient.simulateContract({
              address: positionManagerAddress as Address,
              abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
              functionName: "collect",
              args: [collectParams],
              account: address
            });
          } catch (simulationError) {
            console.error("Collect simulation failed:", simulationError);
            throw new Error("Cannot collect tokens from this position. It may have already been collected.");
          }

          const collectHash = await walletClient.data.writeContract({
            address: positionManagerAddress as Address,
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "collect",
            args: [collectParams],
            account: address
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash: collectHash });
          console.log("✅ Position closed and tokens collected:", receipt);

          toast({
            title: "Position Closed",
            description: "Position has been closed and all tokens collected successfully.",
            variant: "default"
          });
        } else {
          console.log("✅ Position closed (no tokens to collect)");
          toast({
            title: "Position Closed",
            description: "Position has been closed successfully. No tokens were available to collect.",
            variant: "default"
          });
        }
      } catch (collectError) {
        console.error("Error during collect step:", collectError);
        // Position was successfully decreased, but collect failed
        toast({
          title: "Position Partially Closed",
          description: "Position liquidity was removed, but token collection failed. You may need to claim fees separately.",
          variant: "default"
        });
      }

      // Refresh positions by triggering useEffect
      setIsLoading(true);
    } catch (error) {
      console.error("Error closing position:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to close position",
        variant: "destructive"
      });
    } finally {
      setProcessingPosition(null);
    }
  };

  const handleClaimFees = async (position: Position) => {
    if (!address || !walletClient?.data || !publicClient) return;

    try {
      setProcessingPosition(position.tokenId);

      const positionManagerAddress = POSITION_MANAGER_ADDRESSES[projectToken.chainId];
      if (!positionManagerAddress) {
        throw new Error("Position Manager not found for this chain");
      }

      // Check if there are any fees to collect
      if (position.tokensOwed0 === 0n && position.tokensOwed1 === 0n) {
        toast({
          title: "No Fees to Collect",
          description: "This position has no accumulated fees to claim.",
          variant: "default"
        });
        return;
      }

            // Read the current position state to get the most up-to-date fees
      let currentTokensOwed0: bigint;
      let currentTokensOwed1: bigint;

      try {
        const currentPosition = await publicClient.readContract({
          address: positionManagerAddress as Address,
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: "positions",
          args: [position.tokenId]
        });

        currentTokensOwed0 = currentPosition[10];
        currentTokensOwed1 = currentPosition[11];

        console.log("📊 Current position state:", {
          tokenId: position.tokenId.toString(),
          originalTokensOwed0: position.tokensOwed0.toString(),
          originalTokensOwed1: position.tokensOwed1.toString(),
          currentTokensOwed0: currentTokensOwed0.toString(),
          currentTokensOwed1: currentTokensOwed1.toString(),
          liquidity: currentPosition[7].toString()
        });

        // Use the current values instead of cached ones
        if (currentTokensOwed0 === 0n && currentTokensOwed1 === 0n) {
          toast({
            title: "No Fees to Collect",
            description: "This position has no accumulated fees to claim.",
            variant: "default"
          });
          return;
        }
      } catch (readError) {
        console.error("Error reading position state:", readError);
        throw new Error("Cannot read position state. The position may not exist or be accessible.");
      }

      // Collect only the fees (tokensOwed)
      const collectParams = {
        tokenId: position.tokenId,
        recipient: address,
        amount0Max: currentTokensOwed0,
        amount1Max: currentTokensOwed1
      };

      console.log("🔄 Claiming fees:", collectParams);

      // First, try to simulate the transaction to check if it will succeed
      try {
        await publicClient.simulateContract({
          address: positionManagerAddress as Address,
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: "collect",
          args: [collectParams],
          account: address
        });
      } catch (simulationError) {
        console.error("Simulation failed:", simulationError);

        // Try to get more specific error information
        if (simulationError instanceof Error) {
          const errorMessage = simulationError.message;
          if (errorMessage.includes("insufficient")) {
            throw new Error("Insufficient tokens to collect. Fees may have already been claimed.");
          } else if (errorMessage.includes("invalid")) {
            throw new Error("Invalid position state. This position may not be collectable.");
          } else {
            throw new Error(`Collection failed: ${errorMessage}`);
          }
        } else {
          throw new Error("Transaction simulation failed. This position may not have collectable fees.");
        }
      }

      const collectHash = await walletClient.data.writeContract({
        address: positionManagerAddress as Address,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "collect",
        args: [collectParams],
        account: address
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: collectHash });
      console.log("✅ Fees claimed:", receipt);

      toast({
        title: "Fees Claimed",
        description: "Position fees have been claimed successfully.",
        variant: "default"
      });

      // Refresh positions by triggering useEffect
      setIsLoading(true);
    } catch (error) {
      console.error("Error claiming fees:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to claim fees",
        variant: "destructive"
      });
    } finally {
      setProcessingPosition(null);
    }
  };

  const togglePositionVisibility = (tokenId: bigint) => {
    const tokenIdStr = tokenId.toString();
    setHiddenPositions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tokenIdStr)) {
        newSet.delete(tokenIdStr);
      } else {
        newSet.add(tokenIdStr);
      }
      return newSet;
    });
  };

  const toggleShowHidden = () => {
    setShowHidden(prev => !prev);
  };

  // Helper function to determine position state
  const getPositionState = (position: Position) => {
    const hasLiquidity = position.liquidity > 0n;
    const hasFees = position.tokensOwed0 > 0n || position.tokensOwed1 > 0n;
    const feeCheck = feeCheckResults.get(position.tokenId.toString());
    const feesCollectable = feeCheck?.collectable ?? false;

    if (hasLiquidity && position.isLimitOrder) {
      // Limit order with liquidity - likely executed and has ETH to withdraw
      return {
        status: "executed" as const,
        description: "Limit order executed, ETH available to withdraw",
        color: "yellow"
      };
    } else if (hasLiquidity) {
      return {
        status: "active" as const,
        description: "Position is active with liquidity",
        color: "gray"
      };
    } else if (hasFees && feesCollectable) {
      return {
        status: "executed" as const,
        description: "Position closed, fees available to claim",
        color: "yellow"
      };
    } else if (hasFees && !feesCollectable) {
      return {
        status: "closed" as const,
        description: "Position closed, fees may have been claimed",
        color: "gray"
      };
    } else {
      return {
        status: "closed" as const,
        description: "Position closed, no fees to collect",
        color: "gray"
      };
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading positions...</div>;
  }

  if (error) {
    return <div className="p-4 text-gray-500">Error: {error}</div>;
  }

  if (positions.length === 0) {
    return <div className="p-4 text-gray-500">No positions found in this pool.</div>;
  }

  // Separate active and closed positions
  const activePositions = positions.filter(position => {
    const hasLiquidity = position.liquidity > 0n;
    const hasFees = position.tokensOwed0 > 0n || position.tokensOwed1 > 0n;
    return hasLiquidity || (hasFees && feeCheckResults.get(position.tokenId.toString())?.collectable);
  });

  const closedPositions = positions.filter(position => {
    const hasLiquidity = position.liquidity > 0n;
    const hasFees = position.tokensOwed0 > 0n || position.tokensOwed1 > 0n;
    return !hasLiquidity && (!hasFees || !feeCheckResults.get(position.tokenId.toString())?.collectable);
  });

  // Filter positions based on visibility settings
  const visibleActivePositions = activePositions.filter(position => {
    const isHidden = hiddenPositions.has(position.tokenId.toString());
    return showHidden || !isHidden;
  });

  const visibleClosedPositions = closedPositions.filter(position => {
    const isHidden = hiddenPositions.has(position.tokenId.toString());
    return showHidden || !isHidden;
  });

  const hiddenActiveCount = activePositions.filter(pos => hiddenPositions.has(pos.tokenId.toString())).length;
  const hiddenClosedCount = closedPositions.filter(pos => hiddenPositions.has(pos.tokenId.toString())).length;

  // Position rendering component to avoid code duplication
  const renderPosition = (position: Position) => {
    // Format token amounts with proper decimals
    const formatTokenAmount = (amount: bigint, decimals: number) => {
      if (amount === 0n) return "0";

      const amountFloat = parseFloat(amount.toString()) / Math.pow(10, decimals);

      // For very small amounts, show more precision
      if (amountFloat < 0.000001) {
        return amountFloat.toExponential(6);
      } else if (amountFloat < 0.001) {
        return amountFloat.toFixed(8);
      } else if (amountFloat < 1) {
        return amountFloat.toFixed(6);
      } else {
        return amountFloat.toFixed(4);
      }
    };

    const projectTokenAmount = formatTokenAmount(position.tokensOwed0, projectToken.decimals);
    const nativeTokenAmount = formatTokenAmount(position.tokensOwed1, nativeToken.decimals);

    // Format limit price
    const limitPriceFormatted = position.limitPrice
      ? position.limitPrice.toFixed(8)
      : "N/A";

    const isHidden = hiddenPositions.has(position.tokenId.toString());
    const positionState = getPositionState(position);
    const feeCheck = feeCheckResults.get(position.tokenId.toString());
    const calculatedFee = calculatedFees.get(position.tokenId.toString());

    return (
      <div key={position.tokenId.toString()} className={`p-3 border rounded-lg ${isHidden ? "bg-gray-100 opacity-75" : "bg-zinc-50"}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Position #{position.tokenId.toString()}</p>
            {position.isLimitOrder && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                Limit Order
              </span>
            )}
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
              {positionState.status}
            </span>
            {isHidden && (
              <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                Hidden
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => togglePositionVisibility(position.tokenId)}
          >
            {isHidden ? "Show" : "Hide"}
          </Button>
        </div>

        {/* Position Value & Fees Combined */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white rounded-lg p-2 border">
            <h4 className="text-xs font-medium text-gray-700 mb-1">Position</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>{position.token0Symbol}</span>
                <span className="font-medium">{projectTokenAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>{position.token1Symbol}</span>
                <span className="font-medium">{nativeTokenAmount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-2 border">
            <h4 className="text-xs font-medium text-gray-700 mb-1">Fees earned</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>{position.token0Symbol}</span>
                <span className="font-medium">
                  {calculatedFee && calculatedFee.fee0 > 0n
                    ? formatTokenAmount(calculatedFee.fee0, projectToken.decimals)
                    : "0"
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>{position.token1Symbol}</span>
                <span className="font-medium">
                  {calculatedFee && calculatedFee.fee1 > 0n
                    ? formatTokenAmount(calculatedFee.fee1, nativeToken.decimals)
                    : "0"
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Range Section - Only show for active positions */}
        {position.liquidity > 0n && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-1">Price Range</h4>
            {(() => {
              // Calculate price using correct Uniswap V3 formula
              const rawPriceLower = Math.pow(1.0001, position.tickLower);
              const rawPriceUpper = Math.pow(1.0001, position.tickUpper);

              // For WETH/$SCORES pair, we want price per SCORES
              const isToken0Eth = position.token0.toLowerCase() === nativeToken.address.toLowerCase();

              // Calculate both prices
              const priceLower = isToken0Eth ? (1 / rawPriceLower) : rawPriceLower;
              const priceUpper = isToken0Eth ? (1 / rawPriceUpper) : rawPriceUpper;

              // Use the lower of the two for min price, higher for max price
              const minPrice = Math.min(priceLower, priceUpper);
              const maxPrice = Math.max(priceLower, priceUpper);

              // Get real market price from pool or use cached value
              const positionKey = position.tokenId.toString();
              let marketPrice = currentMarketPrices[positionKey];

              if (marketPrice === undefined) {
                // Use fallback for now, will be updated by useEffect
                marketPrice = 0.004141;
              }

              // Convert to USD if ETH price is available
              const minPriceUSD = isToken0Eth && ethPrice ? minPrice * ethPrice : minPrice;
              const maxPriceUSD = isToken0Eth && ethPrice ? maxPrice * ethPrice : maxPrice;
              const marketPriceFinal = isToken0Eth && ethPrice ? marketPrice * ethPrice : marketPrice;

              // Debug logging
              console.log(`Position ${position.tokenId} chart prices:`, {
                minPriceUSD,
                maxPriceUSD,
                marketPriceFinal,
                isToken0Eth,
                ethPrice
              });

              return (
                <PriceRangeChart
                  minPrice={minPriceUSD}
                  maxPrice={maxPriceUSD}
                  marketPrice={marketPriceFinal}
                  tokenSymbol={position.token1Symbol || "Token"}
                />
              );
            })()}
          </div>
        )}

        {/* Compact Metadata */}
        <div className="mb-3 text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Liquidity:</span>
            <span>{formatEther(position.liquidity)} ({getLiquidityPercentage(position.liquidity)})</span>
          </div>
          <div className="flex justify-between">
            <span>Fee tier:</span>
            <span>{position.fee / 10000}%</span>
          </div>
          {positionState.description && (
            <div className="text-xs text-gray-600 mt-1">
              {positionState.description}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {position.liquidity > 0n && (
            <Button
              size="sm"
              variant="outline"
              disabled={processingPosition === position.tokenId}
              onClick={() => handleClosePosition(position)}
            >
              {processingPosition === position.tokenId ? "Closing..." :
               position.isLimitOrder ? "Withdraw ETH" : "Close Position"}
            </Button>
          )}

          {/* Improved fee claiming logic */}
          {(position.tokensOwed0 > 0n || position.tokensOwed1 > 0n) && feeCheck?.collectable ? (
            <Button
              size="sm"
              variant="outline"
              disabled={processingPosition === position.tokenId}
              onClick={() => handleClaimFees(position)}
            >
              {processingPosition === position.tokenId ? "Claiming..." : "Claim Fees"}
            </Button>
          ) : (position.tokensOwed0 > 0n || position.tokensOwed1 > 0n) && !feeCheck?.collectable ? (
            <span className="text-xs text-gray-500 px-2 py-1 border border-gray-200 rounded">
              Fees not collectable
            </span>
          ) : (
            <span className="text-xs text-gray-500 px-2 py-1">
              No fees to collect
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Positions</h3>
        {(hiddenActiveCount > 0 || hiddenClosedCount > 0) && (
          <Button
            size="sm"
            variant="outline"
            onClick={toggleShowHidden}
          >
            {showHidden ? "Hide" : "Show"} Hidden ({hiddenActiveCount + hiddenClosedCount})
          </Button>
        )}
      </div>

      {/* Active Positions Section */}
      {activePositions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowActivePositions(!showActivePositions)}
                className="p-0 h-auto"
              >
                <span className="text-base">{showActivePositions ? "▼" : "▶"}</span>
              </Button>
              <h4 className="text-md font-medium">Active Positions ({activePositions.length})</h4>
            </div>
            {hiddenActiveCount > 0 && (
              <span className="text-xs text-gray-500">
                {hiddenActiveCount} hidden
              </span>
            )}
          </div>

          {showActivePositions && (
            <div className="space-y-2">
              {visibleActivePositions.map(renderPosition)}
            </div>
          )}
        </div>
      )}

      {/* Closed Positions Section */}
      {closedPositions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowClosedPositions(!showClosedPositions)}
                className="p-0 h-auto"
              >
                <span className="text-base">{showClosedPositions ? "▼" : "▶"}</span>
              </Button>
              <h4 className="text-md font-medium">Closed Positions ({closedPositions.length})</h4>
            </div>
            {hiddenClosedCount > 0 && (
              <span className="text-xs text-gray-500">
                {hiddenClosedCount} hidden
              </span>
            )}
          </div>

          {showClosedPositions && (
            <div className="space-y-2">
              {visibleClosedPositions.map(renderPosition)}
            </div>
          )}
        </div>
      )}

      {/* No positions message */}
      {activePositions.length === 0 && closedPositions.length === 0 && (
        <div className="p-4 text-gray-500 text-center">
          No positions found in this pool.
        </div>
      )}
        </div>
  );
}