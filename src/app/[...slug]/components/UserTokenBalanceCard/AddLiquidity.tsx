import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import { Token, Price } from "@uniswap/sdk-core";
import { Address, parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { POSITION_MANAGER_ADDRESSES, UNISWAP_V3_ROUTER_ADDRESSES, UNISWAP_V3_FACTORY_ADDRESSES } from "@/constants";
import { PositionsList } from "./PositionsList";
import { useJBRulesetContext, useJBContractContext, useJBChainId } from "juice-sdk-react";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { getTokenBtoAQuote } from "juice-sdk-core";
import { FixedInt } from "fpnum";
import { TickMath, FeeAmount } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { ExternalLink } from "@/components/ExternalLink";

// Minimal ABI for Uniswap V3 Position Manager
const POSITION_MANAGER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "token0", type: "address" },
          { name: "token1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickLower", type: "int24" },
          { name: "tickUpper", type: "int24" },
          { name: "amount0Desired", type: "uint256" },
          { name: "amount1Desired", type: "uint256" },
          { name: "amount0Min", type: "uint256" },
          { name: "amount1Min", type: "uint256" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" }
        ],
        name: "params",
        type: "tuple"
      }
    ],
    name: "mint",
    outputs: [
      { name: "tokenId", type: "uint256" },
      { name: "liquidity", type: "uint128" },
      { name: "amount0", type: "uint256" },
      { name: "amount1", type: "uint256" }
    ],
    stateMutability: "payable",
    type: "function"
  }
] as const;

// Uniswap Universal Router ABI for execute
const UNIVERSAL_ROUTER_ABI = [
  {
    inputs: [
      { name: "commands", type: "bytes" },
      { name: "inputs", type: "bytes[]" },
      { name: "deadline", type: "uint256" }
    ],
    name: "execute",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  }
] as const;

// ERC20 ABI for approvals and balance checks
const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "account", type: "address" }
    ],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// Add Pool ABI for getting current price
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
    inputs: [],
    name: "liquidity",
    outputs: [{ name: "", type: "uint128" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "fee",
    outputs: [{ name: "", type: "uint24" }],
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

interface PriceInfo {
  issuancePrice: number | null;  // Price from Juicebox (tokens per ETH)
  poolPrice: number | null;      // Current pool price (tokens per ETH)
}

interface AddLiquidityProps {
  poolAddress: Address;
  projectToken: Token;
  nativeToken: Token;
  disabled?: boolean;
}

export function AddLiquidity({
  poolAddress,
  projectToken,
  nativeToken,
  disabled,
}: AddLiquidityProps) {
  // Helper function to encode V3 swap exact in for Universal Router
  const encodeV3SwapExactIn = (params: {
    tokenIn: Address;
    tokenOut: Address;
    fee: number;
    recipient: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    sqrtPriceLimitX96: bigint;
  }): `0x${string}` => {
    // Encode the parameters in the format expected by Universal Router
    const tokenInBytes = params.tokenIn.slice(2).padStart(64, "0");
    const tokenOutBytes = params.tokenOut.slice(2).padStart(64, "0");
    const feeBytes = params.fee.toString(16).padStart(6, "0");
    const recipientBytes = params.recipient.slice(2).padStart(64, "0");
    const amountInBytes = params.amountIn.toString(16).padStart(64, "0");
    const amountOutMinimumBytes = params.amountOutMinimum.toString(16).padStart(64, "0");
    const sqrtPriceLimitX96Bytes = params.sqrtPriceLimitX96.toString(16).padStart(64, "0");

    return `0x${tokenInBytes}${tokenOutBytes}${feeBytes}${recipientBytes}${amountInBytes}${amountOutMinimumBytes}${sqrtPriceLimitX96Bytes}`;
  };

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [nativeAmount, setNativeAmount] = useState<string>("");
  const [projectAmount, setProjectAmount] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"market" | "limit" | "lp">("market");
  const [isSingleSided, setIsSingleSided] = useState(true);
  const [balanceError, setBalanceError] = useState<string>("");

  // Update isSingleSided based on active tab
  useEffect(() => {
    if (activeTab === "lp") {
      setIsSingleSided(false); // LP tab is always two-sided
    } else if (activeTab === "limit") {
      setIsSingleSided(true); // Limit orders are single-sided
    } else {
      setIsSingleSided(false); // Market tab could be either, default to two-sided
    }
  }, [activeTab]);
  const [priceInfo, setPriceInfo] = useState<PriceInfo>({
    issuancePrice: null,
    poolPrice: null
  });

    const [nativeBalance, setNativeBalance] = useState<bigint>(0n);
  const [wethBalance, setWethBalance] = useState<bigint>(0n);
  const [projectTokenBalance, setProjectTokenBalance] = useState<bigint>(0n);

  // Validate wallet balances when amounts change
  useEffect(() => {
    if (activeTab === "lp") {
      const nativeFloat = parseFloat(nativeAmount) || 0;
      const projectFloat = parseFloat(projectAmount) || 0;

      const nativeBalanceFloat = Number(nativeBalance) / 10 ** nativeToken.decimals;
      const projectBalanceFloat = Number(projectTokenBalance) / 10 ** projectToken.decimals;

      let error = "";

      if (nativeFloat > nativeBalanceFloat) {
        error = `Insufficient ${nativeToken.symbol} balance. You have ${nativeBalanceFloat.toFixed(6)} ${nativeToken.symbol}`;
      } else if (projectFloat > projectBalanceFloat) {
        error = `Insufficient ${projectToken.symbol} balance. You have ${projectBalanceFloat.toFixed(6)} ${projectToken.symbol}`;
      }

      setBalanceError(error);
    } else {
      setBalanceError("");
    }
  }, [nativeAmount, projectAmount, activeTab, nativeBalance, projectTokenBalance, nativeToken, projectToken]);
  const { toast } = useToast();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();

    // Function to get Uniswap URL for a pool
  const getUniswapPoolUrl = (chainId: number, poolAddress: string): string | null => {
    const chain = JB_CHAINS[chainId as JBChainId];
    if (!chain) return null;

    // Uniswap V3 is only supported on certain chains
    const supportedChains = ["mainnet", "base", "optimism", "arbitrum", "polygon"];
    const chainName = chain.name.toLowerCase();

    if (!supportedChains.includes(chainName)) {
      return null; // Uniswap V3 not supported on this chain
    }

    return `https://app.uniswap.org/explore/pools/${chainName}/${poolAddress.toLowerCase()}`;
  };

  // Function to check if there's enough liquidity for the sell amount
  const checkLiquidityForSell = async (sellAmount: string) => {
    if (!sellAmount || !priceInfo.poolPrice || !publicClient) {
      setLiquidityError("");
      return;
    }

    try {
      const sellAmountFloat = parseFloat(sellAmount);
      if (isNaN(sellAmountFloat) || sellAmountFloat <= 0) {
        setLiquidityError("");
        return;
      }

      // Get pool address from factory
      if (!chainId) {
        setLiquidityError("Unable to check liquidity - chain ID not available");
        return;
      }
      const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainId];
      if (!factoryAddress) {
        setLiquidityError("Unable to check liquidity - factory not found");
        return;
      }

      const poolAddress = await publicClient.readContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "getPool",
        args: [projectToken.address as Address, nativeToken.address as Address, 500] // Assuming 0.05% fee tier
      });

      if (!poolAddress || poolAddress === "0x0000000000000000000000000000000000000000") {
        setLiquidityError("Pool not found");
        return;
      }

      // Get pool liquidity from slot0
      const slot0 = await publicClient.readContract({
        address: poolAddress as Address,
        abi: POOL_ABI,
        functionName: "slot0"
      });

      // For now, we'll do a simple check based on the sell amount vs a reasonable threshold
      // In a real implementation, you'd calculate the actual liquidity available
      const estimatedLiquidityNeeded = sellAmountFloat * priceInfo.poolPrice * 1.1; // 10% buffer

      // This is a simplified check - in reality you'd need to calculate actual liquidity
      if (estimatedLiquidityNeeded > 1000) { // Arbitrary threshold for demo
        setLiquidityError("Insufficient liquidity for this trade size");
      } else {
        setLiquidityError("");
      }
    } catch (error) {
      console.error("Error checking liquidity:", error);
      setLiquidityError("Unable to check liquidity");
    }
  };
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [priceRange, setPriceRange] = useState<{ lower: number; upper: number } | null>(null);
  const [marketSellAmount, setMarketSellAmount] = useState<string>("");
  const [liquidityError, setLiquidityError] = useState<string>("");

  // Calculate Juicebox issuance price
  useEffect(() => {
    if (!ruleset?.data || !rulesetMetadata?.data) return;

    try {
      const oneEth = new FixedInt(parseEther("1"), nativeToken.decimals);
      const amountAQuote = getTokenBtoAQuote(
        oneEth,
        projectToken.decimals,
        {
          weight: ruleset.data.weight,
          reservedPercent: rulesetMetadata.data.reservedPercent,
        }
      );

      // The quote gives us tokens per ETH (how many project tokens for 1 ETH)
      const tokensPerEth = Number(amountAQuote.format()); // e.g., 0.0002 tokens per ETH
      const ethPerToken = 1 / tokensPerEth; // e.g., 5000 ETH per token

      // If tokensPerEth is very small, it might be the wrong direction
      // Let's check if we need to invert this
      const correctedTokensPerEth = tokensPerEth < 1 ? 1 / tokensPerEth : tokensPerEth;
      const correctedEthPerToken = 1 / correctedTokensPerEth;

      console.log("📊 Juicebox Issuance Price Calculation:", {
        oneEth: oneEth.format(),
        amountAQuote: amountAQuote.format(),
        originalTokensPerEth: tokensPerEth,
        correctedTokensPerEth,
        ethPerToken,
        correctedEthPerToken,
        note: `1 ETH = ${correctedTokensPerEth} ${projectToken.symbol}, or 1 ${projectToken.symbol} = ${correctedEthPerToken} ETH`
      });

      console.log("🔍 Setting issuance price in state:", correctedTokensPerEth);
      setPriceInfo(prev => ({ ...prev, issuancePrice: correctedTokensPerEth }));
    } catch (error) {
      console.error("Error calculating issuance price:", error);
    }
  }, [ruleset?.data, rulesetMetadata?.data, projectToken.decimals, nativeToken.decimals, projectToken.symbol]);

  // Get current pool price
  useEffect(() => {
    const getPoolPrice = async () => {
      if (!publicClient || !poolAddress) return;

      try {
        const slot0 = await publicClient.readContract({
          address: poolAddress,
          abi: POOL_ABI,
          functionName: "slot0",
        });

        const sqrtPriceX96 = BigInt(slot0[0]);
        const tick = Number(slot0[1]);

        const token0IsProject = projectToken.address.toLowerCase() < nativeToken.address.toLowerCase();

        // Calculate tokens per ETH directly from sqrtPriceX96
        const sqrt = Number(sqrtPriceX96) / 2 ** 96;
        const tokensPerEth = sqrt ** 2; // This is already tokens per ETH
        const ethPerToken = 1 / tokensPerEth;

        console.log("📈 Pool Price Information:", {
          tickData: {
            currentTick: tick,
            sqrt: sqrt,
            sqrtPriceX96: sqrtPriceX96.toString(),
            tokensPerEth: tokensPerEth,
          },
          priceRelation: {
            [`${projectToken.symbol} per 1 ${nativeToken.symbol}`]: tokensPerEth,
            [`${nativeToken.symbol} per 1 ${projectToken.symbol}`]: ethPerToken,
          },
          tokenOrder: {
            token0: token0IsProject ? projectToken.symbol : nativeToken.symbol,
            token1: token0IsProject ? nativeToken.symbol : projectToken.symbol,
          },
          note: `tokensPerEth = ${projectToken.symbol} per 1 ${nativeToken.symbol} (directly from sqrtPriceX96)`,
        });

        console.log("🔍 Setting pool price in state:", tokensPerEth);
        setPriceInfo(prev => ({ ...prev, poolPrice: tokensPerEth }));
      } catch (error) {
        console.error("Error getting pool price:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
        }
      }
    };

    getPoolPrice();
  }, [publicClient, poolAddress, projectToken, nativeToken]);

  // Fetch native token and WETH balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!address || !publicClient) return;

      try {
        // Get native token balance (ETH)
        const nativeBalanceResult = await publicClient.getBalance({ address });
        setNativeBalance(nativeBalanceResult);

        // Get WETH balance
        const wethBalanceResult = await publicClient.readContract({
          address: nativeToken.address as Address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address]
        });
        setWethBalance(wethBalanceResult as bigint);

        // Get project token balance
        const projectTokenBalanceResult = await publicClient.readContract({
          address: projectToken.address as Address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address]
        });
        setProjectTokenBalance(projectTokenBalanceResult as bigint);

        console.log("💰 Wallet balances:", {
          native: nativeBalanceResult.toString(),
          weth: wethBalanceResult.toString(),
          projectToken: projectTokenBalanceResult.toString(),
          nativeFormatted: (Number(nativeBalanceResult) / 10 ** 18).toFixed(6),
          wethFormatted: (Number(wethBalanceResult) / 10 ** 18).toFixed(6),
          projectTokenFormatted: (Number(projectTokenBalanceResult) / 10 ** projectToken.decimals).toFixed(6),
          totalNative: ((Number(nativeBalanceResult) + Number(wethBalanceResult)) / 10 ** 18).toFixed(6)
        });
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
  }, [address, publicClient, nativeToken.address]);

  const priceToTick = (price: number, projectTokenDecimals: number, nativeTokenDecimals: number) => {
    // Uniswap V3 tick formula: tick = log_1.0001(price)
    // Adjust for token decimals
    const decimalAdj = nativeTokenDecimals - projectTokenDecimals;
    const adjustedPrice = price * 10 ** decimalAdj;
    return Math.floor(Math.log(adjustedPrice) / Math.log(1.0001));
  };

  const tickToPrice = (tick: number, projectTokenDecimals: number, nativeTokenDecimals: number) => {
    const decimalAdj = nativeTokenDecimals - projectTokenDecimals;
    const price = Math.pow(1.0001, tick) / 10 ** decimalAdj;
    return price;
  };

  // Calculate price range when target price changes
  useEffect(() => {
    if (!targetPrice) return;
    const targetPriceNum = parseFloat(targetPrice);
    if (isNaN(targetPriceNum) || targetPriceNum <= 0) return;

    // Use current pool price if available, otherwise use issuance price
    const referencePrice = priceInfo.poolPrice || priceInfo.issuancePrice;
    if (!referencePrice) {
      console.warn("No reference price available (neither pool price nor issuance price)");
      return;
    }

    // For a limit sell order, we want to sell only at or above the target price
    // So set the lower tick to the tick for the target price, and the upper tick to a bit higher
    try {
      // Convert WETH per $SCORES to $SCORES per WETH for tick calculation
      const priceForTickCalculation = 1 / targetPriceNum;
      const targetTick = priceToTick(priceForTickCalculation, projectToken.decimals, nativeToken.decimals);
      // Set a narrow range above the target price
      const tickLower = targetTick;
      const tickUpper = targetTick + 1000; // ~10% above target price

      setPriceRange({ lower: tickLower, upper: tickUpper });

      console.log("Limit order tick range:", {
        targetPrice: targetPriceNum,
        priceForTickCalculation,
        tickLower,
        tickUpper,
        priceFromTickLower: tickToPrice(tickLower, projectToken.decimals, nativeToken.decimals),
        priceFromTickUpper: tickToPrice(tickUpper, projectToken.decimals, nativeToken.decimals)
      });
    } catch (error) {
      console.error("Error calculating limit order tick range:", error);
    }
  }, [targetPrice, projectToken, nativeToken, priceInfo.poolPrice, priceInfo.issuancePrice]);



  const addLiquidity = async () => {
    if (!address || !walletClient || !publicClient) return;

    // For LP tab, we always do two-sided liquidity
    const isLPTab = activeTab === "lp";

    if (isLPTab) {
      // LP tab validation - requires both tokens
      if (!nativeAmount || !projectAmount) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide both token amounts for liquidity provision"
        });
        return;
      }
    } else {
      // Other tabs validation (limit orders, etc.)
      if (isSingleSided && !projectAmount) return;
      if (!isSingleSided && (!nativeAmount || !projectAmount)) return;
      if (isSingleSided && (!targetPrice || !priceRange)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please set a target price for single-sided liquidity"
        });
        return;
      }
    }

      // No minimum amount validation - let users provide any amount they want

        // Validate amounts for LP tab
    if (isLPTab) {
      const projectAmountFloat = parseFloat(projectAmount);
      const nativeAmountFloat = parseFloat(nativeAmount);

      // Check if user has enough ETH/WETH
      const requiredNativeWei = BigInt(Math.floor(nativeAmountFloat * 10 ** nativeToken.decimals));
      const totalAvailableNative = nativeBalance + wethBalance;

      if (totalAvailableNative < requiredNativeWei) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Insufficient ${nativeToken.symbol}. You have ${(Number(totalAvailableNative) / 10 ** 18).toFixed(6)} ${nativeToken.symbol} (ETH + WETH), need ${nativeAmountFloat}`
        });
        return;
      }

      // Check if user has enough project tokens
      const requiredProjectWei = BigInt(Math.floor(projectAmountFloat * 10 ** projectToken.decimals));
      if (projectTokenBalance < requiredProjectWei) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Insufficient ${projectToken.symbol}. You have ${(Number(projectTokenBalance) / 10 ** projectToken.decimals).toFixed(6)} ${projectToken.symbol}, need ${projectAmountFloat}`
        });
        return;
      }

      // Check if the amounts are reasonably balanced for the current price
      const currentPrice = priceInfo.poolPrice || priceInfo.issuancePrice;
      if (currentPrice) {
        const userRatio = projectAmountFloat / nativeAmountFloat;
        const priceRatio = currentPrice;
        const ratioDifference = Math.abs(userRatio - priceRatio) / priceRatio;

        console.log("🔍 Price Balance Check:", {
          currentPrice,
          userRatio,
          priceRatio,
          ratioDifference,
          isBalanced: ratioDifference < 0.5, // Within 50% of current price
          strategy: ratioDifference > 0.5 ? "Strategic positioning" : "Balanced"
        });

        if (ratioDifference > 0.5) {
          console.log("📈 Strategic position detected:", {
            userRatio,
            currentPrice,
            difference: `${(ratioDifference * 100).toFixed(1)}%`,
            note: "Positioning for expected price movement"
          });

          // Warn user about Uniswap V3's automatic amount adjustment
          toast({
            title: "Imbalanced Position",
            description: `Your position is ${(ratioDifference * 100).toFixed(1)}% from market price. Uniswap V3 will automatically adjust amounts to fit the price range.`,
            variant: "default"
          });
        }
      }

      console.log("🔍 LP Tab Amount Validation:", {
        projectAmount: projectAmountFloat,
        nativeAmount: nativeAmountFloat,
        projectAmountWei: requiredProjectWei.toString(),
        nativeAmountWei: requiredNativeWei.toString(),
        availableNative: totalAvailableNative.toString(),
        availableProject: projectTokenBalance.toString(),
        hasEnoughNative: totalAvailableNative >= requiredNativeWei,
        hasEnoughProject: projectTokenBalance >= requiredProjectWei
      });
    }

    try {
      setIsLoading(true);

      // Convert amounts to wei
      let projectAmountWei;
      let nativeAmountWei = 0n;

      // Use consistent conversion method - same as validation
      projectAmountWei = BigInt(Math.floor(parseFloat(projectAmount) * 10 ** projectToken.decimals));

      console.log("🔍 Project amount conversion:", {
        input: projectAmount,
        parsed: parseFloat(projectAmount),
        decimals: projectToken.decimals,
        multiplier: 10 ** projectToken.decimals,
        result: projectAmountWei.toString(),
        resultFormatted: (Number(projectAmountWei) / 10 ** projectToken.decimals).toFixed(6)
      });

      // Convert native amount for two-sided liquidity (LP tab or non-single-sided)
      if ((isLPTab || !isSingleSided) && nativeAmount) {
        // Use consistent conversion method - same as validation
        nativeAmountWei = BigInt(Math.floor(parseFloat(nativeAmount) * 10 ** nativeToken.decimals));

        console.log("🔍 Native amount conversion:", {
          input: nativeAmount,
          parsed: parseFloat(nativeAmount),
          decimals: nativeToken.decimals,
          multiplier: 10 ** nativeToken.decimals,
          result: nativeAmountWei.toString(),
          resultFormatted: (Number(nativeAmountWei) / 10 ** nativeToken.decimals).toFixed(6)
        });
      }

      console.log("🔍 Amount conversion debug:", {
        projectAmount,
        projectAmountWei: projectAmountWei.toString(),
        projectTokenDecimals: projectToken.decimals,
        nativeAmount,
        nativeAmountWei: nativeAmountWei.toString(),
        nativeTokenDecimals: nativeToken.decimals
      });

      // Get position manager address for the current chain
      const positionManagerAddress = POSITION_MANAGER_ADDRESSES[projectToken.chainId];
      if (!positionManagerAddress) {
        throw new Error("Uniswap V3 Position Manager not found for this chain");
      }

      // Determine token order based on addresses
      const token0Address = projectToken.address.toLowerCase();
      const token1Address = nativeToken.address.toLowerCase();
      const isToken0First = token0Address < token1Address;

      const [token0, token1] = isToken0First
        ? [projectToken.address, nativeToken.address]
        : [nativeToken.address, projectToken.address];

      // Calculate amounts and tick range based on liquidity type
      let amount0Desired: bigint;
      let amount1Desired: bigint;
      let tickLower: number;
      let tickUpper: number;

      if (isLPTab) {
        // LP tab: always two-sided liquidity for initial seeding
        // Check if pool has existing liquidity by reading the liquidity value
        let hasExistingLiquidity = false;
        let poolLiquidity = 0n;
        let currentTick = 0;
        try {
          poolLiquidity = await publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: "liquidity",
          });
          hasExistingLiquidity = poolLiquidity > 0n;

          // Get current tick for debugging
          const slot0 = await publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: "slot0",
          });
          currentTick = Number(slot0[1]);
        } catch (error) {
          console.warn("Could not read pool liquidity, assuming no existing liquidity:", error);
          hasExistingLiquidity = false;
        }

        // Debug pool state
        console.log("🔍 LP Tab Pool State Debug:", {
          poolAddress,
          hasExistingLiquidity,
          poolLiquidity: poolLiquidity.toString(),
          currentTick
        });

                if (hasExistingLiquidity || currentTick !== 0) {
          // Pool has liquidity or is initialized: use a simple, reasonable range
          const referencePrice = priceInfo.poolPrice || priceInfo.issuancePrice;
          if (!referencePrice) {
            throw new Error("No reference price available for LP liquidity");
          }

          // Use a wider ±20% range for LP positions to ensure sufficient liquidity
          const priceRange = 0.2; // 20% range
          const lowerPrice = referencePrice * (1 - priceRange);
          const upperPrice = referencePrice * (1 + priceRange);

          // Convert prices to ticks
          const lowerTick = Math.floor(Math.log(lowerPrice) / Math.log(1.0001));
          const upperTick = Math.ceil(Math.log(upperPrice) / Math.log(1.0001));

          // Snap to tick spacing (assuming 1% fee tier)
          const tickSpacing = 200;
          tickLower = Math.floor(lowerTick / tickSpacing) * tickSpacing;
          tickUpper = Math.ceil(upperTick / tickSpacing) * tickSpacing;

          // Ensure minimum tick range (at least 100 ticks)
          const minTickRange = 100;
          if (tickUpper - tickLower < minTickRange) {
            const centerTick = Math.floor((tickLower + tickUpper) / 2);
            tickLower = centerTick - Math.floor(minTickRange / 2);
            tickUpper = centerTick + Math.ceil(minTickRange / 2);
            // Snap to tick spacing
            tickLower = Math.floor(tickLower / tickSpacing) * tickSpacing;
            tickUpper = Math.ceil(tickUpper / tickSpacing) * tickSpacing;
          }

          console.log("🔍 LP Tab Simple Range Calculation:", {
            referencePrice,
            projectAmount: parseFloat(projectAmount),
            nativeAmount: parseFloat(nativeAmount),
            priceRange,
            lowerPrice,
            upperPrice,
            tickLower,
            tickUpper,
            tickRange: tickUpper - tickLower
          });
        } else {
          // No existing liquidity: use a wide range around issuance price
          const issuancePrice = priceInfo.issuancePrice;
          if (!issuancePrice) {
            throw new Error("No issuance price available for initial liquidity");
          }

          // For initial liquidity, use a wide range to accommodate any amount ratio
          const priceRange = 0.5; // 50% range for initial liquidity
          const lowerPrice = issuancePrice * (1 - priceRange);
          const upperPrice = issuancePrice * (1 + priceRange);

          const lowerTick = Math.floor(Math.log(lowerPrice) / Math.log(1.0001));
          const upperTick = Math.ceil(Math.log(upperPrice) / Math.log(1.0001));

          const tickSpacing = 200;
          tickLower = Math.floor(lowerTick / tickSpacing) * tickSpacing;
          tickUpper = Math.ceil(upperTick / tickSpacing) * tickSpacing;

          console.log("🔍 LP Tab Initial Liquidity Tick Calculation:", {
            issuancePrice,
            lowerPrice,
            upperPrice,
            tickLower,
            tickUpper,
            tickRange: tickUpper - tickLower
          });
        }

              // Set amounts for two-sided liquidity
      // Note: Uniswap V3 will automatically adjust these amounts to fit within the price range
      if (isToken0First) {
        amount0Desired = projectAmountWei;
        amount1Desired = nativeAmountWei;
      } else {
        amount0Desired = nativeAmountWei;
        amount1Desired = projectAmountWei;
      }

      console.log("🔍 Amounts for Position Manager:", {
        amount0Desired: amount0Desired.toString(),
        amount1Desired: amount1Desired.toString(),
        note: "Uniswap V3 will adjust these amounts to fit the price range"
      });
      } else if (isSingleSided) {
        // Single-sided liquidity: use user's specified price range
        const { lower, upper } = priceRange || { lower: -100, upper: 100 };
        tickLower = lower;
        tickUpper = upper;

        // Check if pool has existing liquidity by reading the liquidity value
        let hasExistingLiquidity = false;
        let poolLiquidity = 0n;
        let currentTick = 0;
        try {
          poolLiquidity = await publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: "liquidity",
          });
          hasExistingLiquidity = poolLiquidity > 0n;

          // Get current tick for debugging
          const slot0 = await publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: "slot0",
          });
          currentTick = Number(slot0[1]);
        } catch (error) {
          console.warn("Could not read pool liquidity, assuming no existing liquidity:", error);
          hasExistingLiquidity = false;
        }

        // Debug pool state
        console.log("🔍 Pool State Debug:", {
          poolAddress,
          hasExistingLiquidity,
          poolLiquidity: poolLiquidity.toString(),
          currentTick,
          targetRange: { lower: tickLower, upper: tickUpper }
        });

        if (isToken0First) {
          // projectToken is token0
          amount0Desired = projectAmountWei;
          // Provide minimal WETH even with existing liquidity (some positions need it)
          amount1Desired = hasExistingLiquidity ? 1000n : 25000000000000000n;
        } else {
          // projectToken is token1
          // Provide minimal WETH even with existing liquidity (some positions need it)
          amount0Desired = hasExistingLiquidity ? 1000n : 25000000000000000n;
          amount1Desired = projectAmountWei;
        }
      } else {
        // Two-sided liquidity: check if pool has existing liquidity
        let hasExistingLiquidity = false;
        let currentTick = 0;
        try {
          const poolLiquidity = await publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: "liquidity",
          });
          hasExistingLiquidity = poolLiquidity > 0n;

          // Get current tick to determine if pool is initialized
          const slot0 = await publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: "slot0",
          });
          currentTick = Number(slot0[1]);
        } catch (error) {
          console.warn("Could not read pool liquidity, assuming no existing liquidity:", error);
          hasExistingLiquidity = false;
        }

        if (hasExistingLiquidity || currentTick !== 0) {
          // Pool has liquidity or is initialized: calculate range around current price
          const referencePrice = priceInfo.poolPrice || priceInfo.issuancePrice;
          if (!referencePrice) {
            throw new Error("No reference price available for two-sided liquidity");
          }

          // Calculate tick range around the reference price
          const referenceTick = priceToTick(referencePrice, projectToken.decimals, nativeToken.decimals);
          const rangeWidth = 2000; // ~20% range

          // Ensure the range doesn't cross the current tick
          // For two-sided liquidity, we want the range to be either entirely below or entirely above the current tick
          if (referenceTick > currentTick) {
            // Current price is below our target, so place range above current tick
            tickLower = currentTick + 10; // Just above current tick
            tickUpper = referenceTick + rangeWidth;
          } else {
            // Current price is above our target, so place range below current tick
            tickLower = referenceTick - rangeWidth;
            tickUpper = currentTick - 10; // Just below current tick
          }

          console.log("🔍 Using range that avoids current tick:", {
            currentTick,
            referenceTick,
            tickLower,
            tickUpper,
            rangeWidth,
            note: "Range positioned to avoid crossing current price"
          });
        } else {
          // No existing liquidity and pool not initialized: use min/max ticks for initial seeding
          tickLower = TickMath.MIN_TICK + 1; // -887272 + 1
          tickUpper = TickMath.MAX_TICK - 1; // 887272 - 1

          console.log("🔍 Using min/max ticks for initial liquidity seeding:", {
            tickLower,
            tickUpper,
            note: "Full range coverage for initial pool seeding"
          });
        }

        // Use provided amounts
        if (isToken0First) {
          amount0Desired = projectAmountWei;
          amount1Desired = nativeAmountWei;
        } else {
          amount0Desired = nativeAmountWei;
          amount1Desired = projectAmountWei;
        }
      }

      console.log("🔍 Liquidity calculation:", {
        activeTab,
        isLPTab,
        isSingleSided,
        projectAmount: projectAmount,
        nativeAmount: nativeAmount,
        token0: token0,
        token1: token1,
        amount0Desired: amount0Desired.toString(),
        amount1Desired: amount1Desired.toString(),
        tickRange: { lower: tickLower, upper: tickUpper, range: tickUpper - tickLower },
        note: isLPTab ? "LP tab two-sided liquidity" : (isSingleSided ? "Single-sided liquidity" : "Two-sided liquidity for initial seeding")
      });

      // Ensure amounts are bigint
      const amount0DesiredBigInt = BigInt(amount0Desired);
      const amount1DesiredBigInt = BigInt(amount1Desired);

      console.log("🔍 BigInt conversion check:", {
        amount0Desired: amount0DesiredBigInt.toString(),
        amount1Desired: amount1DesiredBigInt.toString(),
        amount0Type: typeof amount0DesiredBigInt,
        amount1Type: typeof amount1DesiredBigInt
      });

      console.log("Transaction Parameters:", {
        tokenOrder: {
          token0: {
            address: token0,
            symbol: isToken0First ? projectToken.symbol : nativeToken.symbol,
            amount: amount0Desired.toString()
          },
          token1: {
            address: token1,
            symbol: isToken0First ? nativeToken.symbol : projectToken.symbol,
            amount: amount1Desired.toString()
          }
        },
        projectTokenInfo: {
          address: projectToken.address,
          symbol: projectToken.symbol,
          isToken0: isToken0First,
          amount: projectAmountWei.toString()
        },
        priceRange: {
          target: isSingleSided ? parseFloat(targetPrice) : null,
          ticks: {
            lower: tickLower,
            upper: tickUpper,
            range: tickUpper - tickLower
          }
        }
      });

      // Handle ETH wrapping and approvals
      console.log("🔐 Handling ETH wrapping and token approvals...");

      // Determine which amounts need WETH approval
      const wethAmount0 = (nativeToken.address === token0) ? amount0DesiredBigInt : 0n;
      const wethAmount1 = (nativeToken.address === token1) ? amount1DesiredBigInt : 0n;
      const totalWethNeeded = wethAmount0 + wethAmount1;

      console.log("🔍 WETH Requirements:", {
        isToken0First,
        token0: token0,
        token1: token1,
        nativeTokenAddress: nativeToken.address,
        amount0Desired: amount0DesiredBigInt.toString(),
        amount1Desired: amount1DesiredBigInt.toString(),
        wethAmount0: wethAmount0.toString(),
        wethAmount1: wethAmount1.toString(),
        totalWethNeeded: totalWethNeeded.toString()
      });

      // Wrap ETH to WETH if needed
      if (totalWethNeeded > 0n) {
        console.log("🔄 Wrapping ETH to WETH:", totalWethNeeded.toString());

        // Wrap ETH to WETH
        await walletClient.writeContract({
          address: nativeToken.address as Address, // WETH contract
          abi: [
            {
              inputs: [],
              name: "deposit",
              outputs: [],
              stateMutability: "payable",
              type: "function"
            }
          ],
          functionName: "deposit",
          value: totalWethNeeded,
          account: address
        });

        console.log("✅ ETH wrapped to WETH");
      }

      // Approve project tokens
      await walletClient.writeContract({
        address: projectToken.address as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [positionManagerAddress, projectAmountWei],
        account: address
      });

      // Approve WETH for the total amount needed
      if (totalWethNeeded > 0n) {
        await walletClient.writeContract({
          address: nativeToken.address as Address, // WETH contract
          abi: ERC20_ABI,
          functionName: "approve",
          args: [positionManagerAddress, totalWethNeeded],
          account: address
        });
        console.log("✅ WETH approved for Position Manager:", totalWethNeeded.toString());
      }

      console.log("✅ Token approvals completed");

      // Check if pool is initialized before minting
      try {
        const slot0 = await publicClient.readContract({
          address: poolAddress,
          abi: POOL_ABI,
          functionName: "slot0",
        });

        const sqrtPriceX96 = BigInt(slot0[0]);
        const currentTick = Number(slot0[1]);
        console.log("🔍 Pool State Check:", {
          sqrtPriceX96: sqrtPriceX96.toString(),
          currentTick,
          isInitialized: sqrtPriceX96 > 0n,
          tickRange: { lower: tickLower, upper: tickUpper },
          currentTickInRange: currentTick >= tickLower && currentTick <= tickUpper
        });

        // Check if pool is initialized (sqrtPriceX96 should be > 0)
        if (sqrtPriceX96 === 0n) {
          throw new Error("Pool is not initialized. Please seed initial liquidity first.");
        }

        // Check if current tick is within our range
        if (currentTick < tickLower || currentTick > tickUpper) {
          console.warn("⚠️ Current tick is outside the specified range:", {
            currentTick,
            tickLower,
            tickUpper
          });
        }

        console.log("✅ Pool is initialized, proceeding with mint");
      } catch (error) {
        if (error instanceof Error && error.message.includes("Pool is not initialized")) {
          throw error;
        }
        console.warn("Could not verify pool initialization, proceeding anyway:", error);
      }

      // Get the actual pool fee from the pool contract
      let poolFee = FeeAmount.HIGH; // default to 1%
      try {
        const poolFeeResult = await publicClient.readContract({
          address: poolAddress,
          abi: POOL_ABI,
          functionName: "fee",
        });
        poolFee = Number(poolFeeResult);
        console.log("🔍 Pool fee:", poolFee);
      } catch (error) {
        console.warn("Could not read pool fee, using default:", error);
      }

      // Calculate minimum amounts based on current price and liquidity requirements
      const currentPrice = priceInfo.poolPrice || priceInfo.issuancePrice;
      if (!currentPrice) {
        throw new Error("No current price available for liquidity calculation");
      }

      // For Uniswap V3, we need to ensure the amounts are sufficient for the position
      // Calculate the minimum liquidity required (this is a rough estimate)
      const minLiquidity = 1000000n; // Minimum liquidity in Uniswap V3

      // Calculate amounts that would provide sufficient liquidity
      const sqrtPriceX96 = BigInt(Math.floor(Math.sqrt(currentPrice) * 2 ** 96));
      const liquidity = minLiquidity;

      // Calculate minimum amounts based on current price and liquidity
      const amount0Min = liquidity * (BigInt(2 ** 96) - sqrtPriceX96) / BigInt(2 ** 96);
      const amount1Min = liquidity * sqrtPriceX96 / BigInt(2 ** 96);

      console.log("🔍 Liquidity Requirements:", {
        currentPrice,
        sqrtPriceX96: sqrtPriceX96.toString(),
        minLiquidity: minLiquidity.toString(),
        calculatedAmount0Min: amount0Min.toString(),
        calculatedAmount1Min: amount1Min.toString(),
        providedAmount0: amount0Desired.toString(),
        providedAmount1: amount1Desired.toString()
      });

      // Add liquidity through the position manager
      const mintHash = await walletClient.writeContract({
        address: positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: "mint",
        args: [{
          token0: token0 as Address,
          token1: token1 as Address,
          fee: poolFee,
          tickLower,
          tickUpper,
          amount0Desired,
          amount1Desired,
          amount0Min: 0n, // Set to 0 for now to see if that's the issue
          amount1Min: 0n, // Set to 0 for now to see if that's the issue
          recipient: address,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20)
        }] as const,
        account: address
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: mintHash });
      console.log("Liquidity added:", receipt);

      toast({
        title: "Success",
        description: isSingleSided ? "Limit order created successfully" : "Initial liquidity seeded successfully"
      });

      // Reset form
      setProjectAmount("");
      setNativeAmount("");
      setTargetPrice("");
    } catch (error) {
      console.error("Error adding liquidity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add liquidity"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const marketSell = async () => {
    if (!address || !walletClient || !publicClient || !marketSellAmount) {
      toast({
        title: "Error",
        description: "Please enter an amount to sell",
        variant: "destructive"
      });
      return;
    }

    // Check if user has enough tokens
    try {
      const balance = await publicClient.readContract({
        address: projectToken.address as Address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address]
      });

      const projectAmountWei = BigInt(parseFloat(marketSellAmount) * Math.pow(10, projectToken.decimals));
      if (balance < projectAmountWei) {
        toast({
          title: "Error",
          description: `Insufficient balance. You have ${(Number(balance) / Math.pow(10, projectToken.decimals)).toFixed(6)} ${projectToken.symbol}`,
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error("Error checking balance:", error);
    }

    try {
      setIsLoading(true);

            // Get Uniswap Universal Router address for current chain
      if (!chainId) {
        toast({
          title: "Error",
          description: "Chain ID not available",
          variant: "destructive"
        });
        return;
      }

      // Use Universal Router instead of SwapRouter
      const universalRouterAddress = "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B" as Address; // Universal Router on Base
      if (!universalRouterAddress) {
        toast({
          title: "Error",
          description: "Uniswap Universal Router not available on this chain",
          variant: "destructive"
        });
        return;
      }

      // Convert amount to project token units using correct decimals
      const projectAmountWei = BigInt(parseFloat(marketSellAmount) * Math.pow(10, projectToken.decimals));

      console.log("Market Sell via Uniswap Universal Router:", {
        projectAmount: marketSellAmount,
        projectAmountWei: projectAmountWei.toString(),
        universalRouterAddress,
        poolAddress,
        projectTokenAddress: projectToken.address,
        nativeTokenAddress: nativeToken.address,
        chainId
      });

      // First, approve Universal Router to spend project tokens
      console.log("🔐 Approving Universal Router to spend project tokens...");
      const approveHash = await walletClient.writeContract({
        address: projectToken.address as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [universalRouterAddress, projectAmountWei],
        account: address
      });

      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      console.log("✅ Project token approved for Uniswap Router");

      // Calculate minimum amount out (with 1% slippage tolerance)
      // For now, set to 0 to allow any amount out (no slippage protection)
      const minAmountOut = 0n; // Allow any amount out for testing

      // Verify pool exists and get its fee
      let poolFee = 10000; // Default to HIGH fee (1%)
      let verifiedPoolAddress = poolAddress;

      try {
        if (poolAddress) {
          const poolFeeResult = await publicClient.readContract({
            address: poolAddress as Address,
            abi: [
              {
                inputs: [],
                name: "fee",
                outputs: [{ name: "", type: "uint24" }],
                stateMutability: "view",
                type: "function"
              }
            ],
            functionName: "fee"
          });
          poolFee = Number(poolFeeResult);
          console.log("🔍 Pool fee detected:", poolFee);
        }
      } catch (error) {
        console.log("Could not read pool fee, using default:", poolFee);
      }

      // Verify pool exists for this token pair and fee
      try {
        const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainId];
        if (factoryAddress) {
          const actualPoolAddress = await publicClient.readContract({
            address: factoryAddress as Address,
            abi: [
              {
                inputs: [
                  { name: "tokenA", type: "address" },
                  { name: "tokenB", type: "address" },
                  { name: "fee", type: "uint24" }
                ],
                name: "getPool",
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
                type: "function"
              }
            ],
            functionName: "getPool",
            args: [
              projectToken.address as Address,
              nativeToken.address as Address,
              poolFee as number
            ]
          });

          console.log("🔍 Pool verification:", {
            factoryAddress,
            expectedPool: poolAddress,
            actualPool: actualPoolAddress,
            fee: poolFee,
            poolExists: actualPoolAddress !== "0x0000000000000000000000000000000000000000"
          });

          if (actualPoolAddress === "0x0000000000000000000000000000000000000000") {
            toast({
              title: "Pool Not Found",
              description: `No pool exists for ${projectToken.symbol}/${nativeToken.symbol} with ${poolFee} fee. Try a different fee tier.`,
              variant: "destructive"
            });
            return;
          }

          verifiedPoolAddress = actualPoolAddress as Address;
        }
      } catch (error) {
        console.log("Could not verify pool:", error);
      }

      // Check pool liquidity before attempting swap
      if (poolAddress) {
        try {
          const poolLiquidity = await publicClient.readContract({
            address: poolAddress as Address,
            abi: [
              {
                inputs: [],
                name: "liquidity",
                outputs: [{ name: "", type: "uint128" }],
                stateMutability: "view",
                type: "function"
              }
            ],
            functionName: "liquidity"
          });

          console.log("🔍 Pool liquidity check:", {
            poolAddress,
            liquidity: poolLiquidity.toString(),
            hasLiquidity: poolLiquidity > 0n
          });

          if (poolLiquidity === 0n) {
            toast({
              title: "No Liquidity",
              description: "The pool has no liquidity. Add liquidity first or try a smaller amount.",
              variant: "destructive"
            });
            return;
          }
        } catch (error) {
          console.log("Could not check pool liquidity:", error);
        }
      }

      // Prepare swap parameters
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 minutes from now

      // Ensure correct token ordering (token0 < token1)
      const token0 = projectToken.address.toLowerCase() < nativeToken.address.toLowerCase()
        ? projectToken.address as Address
        : nativeToken.address as Address;
      const token1 = projectToken.address.toLowerCase() < nativeToken.address.toLowerCase()
        ? nativeToken.address as Address
        : projectToken.address as Address;

      console.log("🔍 Token ordering for swap:", {
        token0,
        token1,
        projectToken: projectToken.address,
        nativeToken: nativeToken.address,
        isProjectToken0: token0 === projectToken.address
      });

      // Encode Universal Router commands and inputs
      // Command 0x0c = V3_SWAP_EXACT_IN
      const commands = "0x0c" as `0x${string}`;

      // Encode the swap input
      const swapInput = encodeV3SwapExactIn({
        tokenIn: projectToken.address as Address,
        tokenOut: nativeToken.address as Address,
        fee: poolFee as number,
        recipient: address,
        amountIn: projectAmountWei,
        amountOutMinimum: minAmountOut,
        sqrtPriceLimitX96: 0n
      });

      const inputs = [swapInput];

      console.log("🔄 Executing Universal Router swap:", {
        commands,
        inputs: inputs.map(input => input.slice(0, 66) + "..."), // Show first part of each input
        deadline: deadline.toString()
      });

      // Execute the swap using Universal Router
      const swapHash = await walletClient.writeContract({
        address: universalRouterAddress,
        abi: UNIVERSAL_ROUTER_ABI,
        functionName: "execute",
        args: [commands, inputs, deadline],
        account: address
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: swapHash });
      console.log("✅ Swap completed:", receipt);

      toast({
        title: "Success",
        description: `Successfully sold ${marketSellAmount} ${projectToken.symbol} for ${nativeToken.symbol} via Uniswap V3`,
      });

      setMarketSellAmount("");

    } catch (error) {
      console.error("Error in market sell:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute market sell",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

      // Helper function to set percentage of available native token balance
  const setPercentageAmount = (percentage: number) => {
    const totalBalance = nativeBalance + wethBalance;
    if (totalBalance === 0n) return;

    const percentageAmount = (totalBalance * BigInt(percentage)) / 100n;
    const amountInEth = Number(percentageAmount) / 10 ** 18;
    setNativeAmount(amountInEth.toFixed(6));

    // For LP tab, also calculate balanced project token amount
    if (activeTab === "lp" && priceInfo.poolPrice) {
      const balancedProjectAmount = amountInEth * priceInfo.poolPrice;
      setProjectAmount(balancedProjectAmount.toFixed(6));
    }
  };

  // Helper function to set percentage of available project token balance
  const setProjectTokenPercentageAmount = (percentage: number) => {
    if (projectTokenBalance === 0n) return;

    const percentageAmount = (projectTokenBalance * BigInt(percentage)) / 100n;
    const amountInTokens = Number(percentageAmount) / 10 ** projectToken.decimals;
    setProjectAmount(amountInTokens.toFixed(6));

    // For LP tab, also calculate balanced native token amount
    if (activeTab === "lp" && priceInfo.poolPrice) {
      const balancedNativeAmount = amountInTokens / priceInfo.poolPrice;
      setNativeAmount(balancedNativeAmount.toFixed(6));
    }
  };



  const createLimitOrder = async () => {
    if (!address || !walletClient || !publicClient || !projectAmount || !targetPrice) {
      toast({
        title: "Error",
        description: "Please enter amount and target price",
        variant: "destructive"
      });
      return;
    }

    // Check if user has enough tokens
    try {
      const balance = await publicClient.readContract({
        address: projectToken.address as Address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address]
      });

      const projectAmountWei = BigInt(parseFloat(projectAmount) * Math.pow(10, projectToken.decimals));
      if (balance < projectAmountWei) {
        toast({
          title: "Error",
          description: `Insufficient balance. You have ${(Number(balance) / Math.pow(10, projectToken.decimals)).toFixed(6)} ${projectToken.symbol}`,
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error("Error checking balance:", error);
    }

    try {
      setIsLoading(true);

      // Convert amount to project token units using correct decimals
      const projectAmountWei = BigInt(parseFloat(projectAmount) * Math.pow(10, projectToken.decimals));

      console.log("Creating Limit Order (Liquidity Position):", {
        projectAmount,
        projectAmountWei: projectAmountWei.toString(),
        targetPrice,
        projectTokenAddress: projectToken.address,
        nativeTokenAddress: nativeToken.address,
        chainId
      });

      // Get position manager address for the current chain
      const positionManagerAddress = POSITION_MANAGER_ADDRESSES[projectToken.chainId];
      if (!positionManagerAddress) {
        throw new Error("Uniswap V3 Position Manager not found for this chain");
      }

            // Force use of fee 500 (0.05%) since that's what we've been using for swaps
      const poolFee = 10000; // Force to 10000 (1%) - the fee tier we want
      let poolLiquidity = 0n;
      let currentTick = 0;
      let currentPrice = 0;

      console.log("🔧 Using forced fee tier:", poolFee, "(1%)");

      // Calculate tick range for the limit order
      // For a sell order (SCORES → WETH), we need to invert the price
      const targetPriceFloat = parseFloat(targetPrice);

      // The target price is WETH per SCORES, but we need SCORES per WETH for tick calculation
      const scoresPerWeth = 1 / targetPriceFloat;
      const tick = Math.log(scoresPerWeth) / Math.log(1.0001);

      // Helper function to snap ticks to valid spacing for fee 10000 (spacing = 200)
      const snapToTickSpacing = (tick: number): number => {
        const tickSpacing = 200; // For fee 10000 (1%)
        return Math.round(tick / tickSpacing) * tickSpacing;
      };

      // Use a tight tick range for limit orders (200 ticks wide)
      const tickRange = 100; // 100 ticks on each side = 200 tick range
      const tickLower = snapToTickSpacing(Math.floor(tick - tickRange));
      const tickUpper = snapToTickSpacing(Math.floor(tick + tickRange));

      // Calculate prices from ticks for verification
      const priceFromTickLower = Math.pow(1.0001, tickLower);
      const priceFromTickUpper = Math.pow(1.0001, tickUpper);

      console.log("🔍 Tick calculation:", {
        targetPrice: targetPriceFloat,
        priceForTickCalculation: scoresPerWeth,
        tick: tick,
        tickLower: tickLower,
        tickUpper: tickUpper,
        tickSpacing: 10,
        range: tickUpper - tickLower,
        priceFromTickLower: priceFromTickLower,
        priceFromTickUpper: priceFromTickUpper
      });

      // Validate tick range
      if (tickLower >= tickUpper) {
        toast({
          title: "Invalid Price",
          description: "Target price results in invalid tick range. Try a different price.",
          variant: "destructive"
        });
        return;
      }

      // Get current market tick from pool if available
      let currentMarketTick = 0;
      if (poolAddress) {
        try {
          const slot0 = await publicClient.readContract({
            address: poolAddress as Address,
            abi: POOL_ABI,
            functionName: "slot0"
          });
          currentMarketTick = Number(slot0[1]);
        } catch (error) {
          console.log("Could not get current market tick:", error);
        }
      }

      // Check if this will execute immediately (limit price is at or below market price)
      if (currentMarketTick > 0) {
        // Determine token order to calculate prices correctly
        const isProjectToken0 = projectToken.address.toLowerCase() < nativeToken.address.toLowerCase();

        // Calculate current market price based on token order
        const currentMarketPrice = isProjectToken0
          ? Math.pow(1.0001, currentMarketTick)
          : 1 / Math.pow(1.0001, currentMarketTick);

        // For a limit sell order, we want to sell when price goes up
        // So we check if our limit price is at or below current market price
        const willExecuteImmediately = isProjectToken0
          ? tickUpper <= currentMarketTick  // If project token is token0, lower tick = lower price
          : tickLower >= currentMarketTick; // If project token is token1, higher tick = lower price

        if (willExecuteImmediately) {
          const currentMarketPriceFormatted = currentMarketPrice.toFixed(8);
          const targetPriceFormatted = targetPriceFloat.toFixed(8);

          toast({
            title: "⚠️ Will Execute Immediately",
            description: `Your limit price (${targetPriceFormatted} ${nativeToken.symbol}/${projectToken.symbol}) is at or below the current market price (${currentMarketPriceFormatted} ${nativeToken.symbol}/${projectToken.symbol}). This will execute immediately as a market sell.`,
            variant: "destructive"
          });

          // Ask user if they want to proceed
          if (!confirm("This limit order will execute immediately. Do you want to proceed?")) {
            return;
          }
        }
      }

      if (poolAddress) {
        try {
          const [poolLiquidityResult, slot0] = await Promise.all([
            publicClient.readContract({
              address: poolAddress as Address,
              abi: [
                {
                  inputs: [],
                  name: "liquidity",
                  outputs: [{ name: "", type: "uint128" }],
                  stateMutability: "view",
                  type: "function"
                }
              ],
              functionName: "liquidity"
            }),
            publicClient.readContract({
              address: poolAddress as Address,
              abi: [
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
                }
              ],
              functionName: "slot0"
            })
          ]);

          poolLiquidity = poolLiquidityResult;
          currentTick = Number(slot0[1]);
          currentPrice = Math.pow(1.0001, currentTick);

          // Log the actual pool fee for debugging (but we're forcing fee 10000)
          const rawPoolFee = Number(slot0[3]);
          console.log("🔍 Raw pool fee from slot0[3]:", rawPoolFee, "(using forced fee 10000 - 1%)");

          console.log("🔍 Pool state check:", {
            poolAddress,
            liquidity: poolLiquidity.toString(),
            hasLiquidity: poolLiquidity > 0n,
            poolFee: poolFee,
            currentTick: currentTick,
            currentPrice: currentPrice,
            targetTick: tick,
            tickLower: tickLower,
            tickUpper: tickUpper,
            tickDistance: Math.abs(currentTick - tick)
          });

          if (poolLiquidity === 0n) {
            toast({
              title: "No Liquidity",
              description: "The pool has no liquidity. Add liquidity first or try a market sell instead.",
              variant: "destructive"
            });
            return;
          }

          // Check if target tick is too far from current tick
          const tickDistance = Math.abs(currentTick - tick);
          if (tickDistance > 1000) {
            const currentMarketPrice = priceInfo.poolPrice ? (1 / priceInfo.poolPrice).toFixed(8) : "unknown";
            toast({
              title: "Price Too Far",
              description: `Target price is too far from current market price. Try a price closer to ${currentMarketPrice} ${nativeToken.symbol} per ${projectToken.symbol}`,
              variant: "destructive"
            });
            return;
          }
        } catch (error) {
          console.log("Could not check pool state:", error);
        }
      }

      // Determine token order based on addresses
      const token0Address = projectToken.address.toLowerCase();
      const token1Address = nativeToken.address.toLowerCase();
      const isToken0First = token0Address < token1Address;

      const [token0, token1] = isToken0First
        ? [projectToken.address, nativeToken.address]
        : [nativeToken.address, projectToken.address];

      // For limit order (sell SCORES), we only provide SCORES tokens
      // The position will be converted to WETH when price crosses the range
      const amount0Desired = isToken0First ? projectAmountWei : 0n;
      const amount1Desired = isToken0First ? 0n : projectAmountWei;

      const mintParams = {
        token0: token0 as Address,
        token1: token1 as Address,
        fee: poolFee, // Use the actual pool fee
        tickLower: tickLower,
        tickUpper: tickUpper,
        amount0Desired: amount0Desired,
        amount1Desired: amount1Desired,
        amount0Min: 0n,
        amount1Min: 0n,
        recipient: address,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200) // 20 minutes
      };

      console.log("🔄 Creating limit order position:", mintParams);

      // First, approve Position Manager to spend project tokens
      console.log("🔐 Approving Position Manager to spend project tokens...");
      const approveHash = await walletClient.writeContract({
        address: projectToken.address as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [positionManagerAddress as Address, projectAmountWei],
        account: address
      });

      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      console.log("✅ Project token approved for Position Manager");

      // Mint the limit order position
      const mintHash = await walletClient.writeContract({
        address: positionManagerAddress as Address,
        abi: POSITION_MANAGER_ABI,
        functionName: "mint",
        args: [mintParams],
        account: address
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: mintHash });
      console.log("✅ Limit order position created:", receipt);

      toast({
        title: "Success",
        description: `Limit order created: ${projectAmount} ${projectToken.symbol} will be sold when price reaches ${targetPrice} ${nativeToken.symbol}`,
      });

      setProjectAmount("");
      setTargetPrice("");

    } catch (error) {
      console.error("Error creating limit order:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create limit order",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-zinc-50">
      <h3 className="text-lg font-medium mb-4">
        {(() => {
          const uniswapUrl = chainId ? getUniswapPoolUrl(chainId, poolAddress) : null;
          if (uniswapUrl) {
            return (
              <a
                href={uniswapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Trading Options
              </a>

            );
            {uniswapUrl && (
              <ExternalLink ref={uniswapUrl} className="text-sm text-green-600 hover:text-green-800">
                View on Uniswap
              </ExternalLink>
            )}
          } else {
            return "Trading Options";
          }
        })()}
      </h3>

      {/* Tabbed Interface */}
      <div className="flex border-b mb-4">
        <Button
          variant={activeTab === "market" ? "tab-selected" : "bottomline"}
          onClick={() => setActiveTab("market")}
          className="flex-1"
        >
          Sell at Market
        </Button>
        <Button
          variant={activeTab === "limit" ? "tab-selected" : "bottomline"}
          onClick={() => setActiveTab("limit")}
          className="flex-1"
        >
          Limit Order
        </Button>
        <Button
          variant={activeTab === "lp" ? "tab-selected" : "bottomline"}
          onClick={() => setActiveTab("lp")}
          className="flex-1"
        >
          LP
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "market" && (
        <div className="space-y-4">
          <div>
            {priceInfo.poolPrice ? (
              <div className="text-sm">
                <label className="block text-sm font-medium mb-2">
                  {(1 / priceInfo.poolPrice).toFixed(8)} {nativeToken.symbol} per {projectToken.symbol}
                </label>
              </div>
            ) : (
              <div className="text-sm text-blue-600">
                Loading market price...
              </div>
            )}
            <input
              type="number"
              value={marketSellAmount}
              onChange={(e) => setMarketSellAmount(e.target.value)}
              placeholder={`Enter ${projectToken.symbol} amount`}
              className="w-full p-2 border rounded"
              disabled={isLoading || disabled}
              min="0"
              step="0.000001"
            />

            {/* Percentage buttons */}
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const balance = Number(projectTokenBalance) / 10 ** (projectToken.decimals || 18);
                  setMarketSellAmount((balance * 0.25).toFixed(6));
                }}
                disabled={isLoading || disabled}
                className="flex-1"
              >
                25%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const balance = Number(projectTokenBalance) / 10 ** (projectToken.decimals || 18);
                  setMarketSellAmount((balance * 0.5).toFixed(6));
                }}
                disabled={isLoading || disabled}
                className="flex-1"
              >
                50%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const balance = Number(projectTokenBalance) / 10 ** (projectToken.decimals || 18);
                  setMarketSellAmount((balance * 0.75).toFixed(6));
                }}
                disabled={isLoading || disabled}
                className="flex-1"
              >
                75%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const balance = Number(projectTokenBalance) / 10 ** (projectToken.decimals || 18);
                  setMarketSellAmount(balance.toFixed(6));
                }}
                disabled={isLoading || disabled}
                className="flex-1"
              >
                Max
              </Button>
            </div>

            {marketSellAmount && priceInfo.poolPrice && (
              <p className="text-sm text-gray-500 mt-1">
                You'll receive approximately {(parseFloat(marketSellAmount) / priceInfo.poolPrice).toFixed(6)} {nativeToken.symbol}
              </p>
            )}

            {liquidityError && (
              <p className="text-sm text-red-500 mt-1">
                ⚠️ {liquidityError}
              </p>
            )}
          </div>
          <ButtonWithWallet
            onClick={marketSell}
            disabled={isLoading || disabled || !marketSellAmount}
            className="w-full"
          >
            {isLoading ? "Selling..." : "Sell at Market"}
          </ButtonWithWallet>
        </div>
      )}

      {activeTab === "limit" && (
        <div className="space-y-4">
          {/* Current Market Price Display */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Current Market Price</h4>
            {priceInfo.poolPrice ? (
              <div className="text-sm text-blue-800">
                <span className="font-medium">
                  {(1 / priceInfo.poolPrice).toFixed(8)} {nativeToken.symbol} per {projectToken.symbol}
                </span>
                <br />
                <span className="text-xs text-blue-600">
                  ({priceInfo.poolPrice.toFixed(2)} {projectToken.symbol} per {nativeToken.symbol})
                </span>
              </div>
            ) : (
              <div className="text-sm text-blue-600">
                Loading market price...
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum price per token in {nativeToken.symbol} for 1 {projectToken.symbol}
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Enter limit sell price"
              className="w-full p-2 border rounded"
              disabled={isLoading || disabled}
              min="0"
              step="0.000001"
            />
            {priceInfo.poolPrice && (
              <div className="text-sm text-gray-500 mt-1">
                <span>Min: {(1 / priceInfo.poolPrice).toFixed(8)}</span>
                {targetPrice && (
                  <div className="mt-1">
                    {parseFloat(targetPrice) > (1 / priceInfo.poolPrice) ? (
                      <span className="text-amber-600">
                        ⏳ Your limit price is above market price (will wait for price to rise)
                      </span>
                    ) : (
                      <span className="text-green-600">
                        ✓ Your limit price is at or below market price (will execute immediately)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount of {projectToken.symbol} to sell
            </label>
            <input
              type="number"
              value={projectAmount}
              onChange={(e) => setProjectAmount(e.target.value)}
              placeholder={`Enter ${projectToken.symbol} amount`}
              className="w-full p-2 border rounded"
              disabled={isLoading || disabled}
            />
          </div>
          <ButtonWithWallet
            onClick={createLimitOrder}
            disabled={isLoading || disabled || !projectAmount || !targetPrice}
            className="w-full"
          >
            {isLoading ? "Creating..." : "Create Limit Order"}
          </ButtonWithWallet>
        </div>
      )}

      {activeTab === "lp" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-2">
              Provide both tokens to seed initial liquidity. This enables one-sided positions for other users.
            </p>

            {/* Balance Display */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Available Balance</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>ETH: {(Number(nativeBalance) / 10 ** 18).toFixed(6)}</p>
                <p>WETH: {(Number(wethBalance) / 10 ** 18).toFixed(6)}</p>
                <p className="font-medium text-blue-900">
                  Total: {((Number(nativeBalance) + Number(wethBalance)) / 10 ** 18).toFixed(6)} {nativeToken.symbol}
                </p>
              </div>
            </div>

            <label className="block text-sm font-medium">
              Amount of {nativeToken.symbol} to provide
            </label>
            <input
              type="number"
              value={nativeAmount}
              onChange={(e) => {
                setNativeAmount(e.target.value);
                // For LP tab, automatically calculate balanced project token amount
                if (activeTab === "lp" && priceInfo.poolPrice && e.target.value) {
                  const nativeAmountFloat = parseFloat(e.target.value);
                  if (!isNaN(nativeAmountFloat)) {
                    const balancedProjectAmount = nativeAmountFloat * priceInfo.poolPrice;
                    setProjectAmount(balancedProjectAmount.toFixed(6));
                  }
                }
              }}
              placeholder={`Enter ${nativeToken.symbol} amount`}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            />
            {balanceError && (
              <div className="text-sm text-red-600 mt-1">
                ⚠️ {balanceError}
              </div>
            )}

            {/* Percentage Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPercentageAmount(25)}
                disabled={isLoading || (nativeBalance + wethBalance) === 0n}
                className="flex-1"
              >
                25%
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPercentageAmount(50)}
                disabled={isLoading || (nativeBalance + wethBalance) === 0n}
                className="flex-1"
              >
                50%
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPercentageAmount(75)}
                disabled={isLoading || (nativeBalance + wethBalance) === 0n}
                className="flex-1"
              >
                75%
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPercentageAmount(100)}
                disabled={isLoading || (nativeBalance + wethBalance) === 0n}
                className="flex-1"
              >
                Max
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {/* Project Token Balance Display */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Available {projectToken.symbol} Balance</h4>
              <div className="text-sm text-green-800">
                <p className="font-medium text-green-900">
                  {(Number(projectTokenBalance) / 10 ** projectToken.decimals).toFixed(6)} {projectToken.symbol}
                </p>
              </div>
            </div>

            <label className="block text-sm font-medium">
              Amount of {projectToken.symbol} to provide
            </label>
            <input
              type="number"
              value={projectAmount}
              onChange={(e) => {
                setProjectAmount(e.target.value);
                // For LP tab, automatically calculate balanced native token amount
                if (activeTab === "lp" && priceInfo.poolPrice && e.target.value) {
                  const projectAmountFloat = parseFloat(e.target.value);
                  if (!isNaN(projectAmountFloat)) {
                    const balancedNativeAmount = projectAmountFloat / priceInfo.poolPrice;
                    setNativeAmount(balancedNativeAmount.toFixed(6));
                  }
                }
              }}
              placeholder={`Enter ${projectToken.symbol} amount`}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            />

            {/* Project Token Percentage Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setProjectTokenPercentageAmount(25)}
                disabled={isLoading || projectTokenBalance === 0n}
                className="flex-1"
              >
                25%
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setProjectTokenPercentageAmount(50)}
                disabled={isLoading || projectTokenBalance === 0n}
                className="flex-1"
              >
                50%
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setProjectTokenPercentageAmount(75)}
                disabled={isLoading || projectTokenBalance === 0n}
                className="flex-1"
              >
                75%
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setProjectTokenPercentageAmount(100)}
                disabled={isLoading || projectTokenBalance === 0n}
                className="flex-1"
              >
                Max
              </Button>
            </div>
          </div>

                     <ButtonWithWallet
             onClick={addLiquidity}
              disabled={isLoading || !nativeAmount || !projectAmount || disabled || !!balanceError}
             className="w-full"
           >
              {isLoading ? "Adding Liquidity..." : "Seed Initial Liquidity"}
           </ButtonWithWallet>
        </div>
      )}

      <PositionsList projectToken={projectToken} nativeToken={nativeToken} />
    </div>
  );
}