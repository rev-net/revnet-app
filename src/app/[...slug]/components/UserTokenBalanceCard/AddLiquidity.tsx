import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Token, Price } from "@uniswap/sdk-core";
import { Address, parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { POSITION_MANAGER_ADDRESSES } from "@/constants";
import { PositionsList } from "./PositionsList";
import { useJBRulesetContext } from "juice-sdk-react";
import { getTokenBtoAQuote } from "juice-sdk-core";
import { FixedInt } from "fpnum";
import { TickMath, FeeAmount } from "@uniswap/v3-sdk";
import JSBI from 'jsbi';

// Minimal ABI for Uniswap V3 Position Manager
const POSITION_MANAGER_ABI = [
  {
    inputs: [
      {
        components: [
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
          { name: 'deadline', type: 'uint256' }
        ],
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'mint',
    outputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' }
    ],
    stateMutability: 'payable',
    type: 'function'
  }
] as const;

// ERC20 ABI for approvals
const ERC20_ABI = [
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
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Add Pool ABI for getting current price
const POOL_ABI = [
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
      { name: 'unlocked', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
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
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [nativeAmount, setNativeAmount] = useState<string>("");
  const [projectAmount, setProjectAmount] = useState<string>("");
  const [isSingleSided, setIsSingleSided] = useState(true);
  const [priceInfo, setPriceInfo] = useState<PriceInfo>({
    issuancePrice: null,
    poolPrice: null
  });
  const { toast } = useToast();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [priceRange, setPriceRange] = useState<{ lower: number; upper: number } | null>(null);

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
      
      console.log('📊 Juicebox Issuance Price Calculation:', {
        oneEth: oneEth.format(),
        amountAQuote: amountAQuote.format(),
        tokensPerEth,  // How many tokens you get for 1 ETH
        ethPerToken,   // How much ETH you need for 1 token
        note: `1 ETH = ${tokensPerEth} ${projectToken.symbol}, or 1 ${projectToken.symbol} = ${ethPerToken} ETH`
      });

      console.log('🔍 Setting issuance price in state:', tokensPerEth);
      setPriceInfo(prev => ({ ...prev, issuancePrice: tokensPerEth }));
    } catch (error) {
      console.error('Error calculating issuance price:', error);
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
          functionName: 'slot0',
        });
  
        const sqrtPriceX96 = BigInt(slot0[0]);
        const tick = Number(slot0[1]);
  
        const token0IsProject = projectToken.address.toLowerCase() < nativeToken.address.toLowerCase();
        
        // Calculate tokens per ETH directly from sqrtPriceX96
        const sqrt = Number(sqrtPriceX96) / 2 ** 96;
        const tokensPerEth = sqrt ** 2; // This is already tokens per ETH
        const ethPerToken = 1 / tokensPerEth;
        
        console.log('📈 Pool Price Information:', {
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
        
        console.log('🔍 Setting pool price in state:', tokensPerEth);
        setPriceInfo(prev => ({ ...prev, poolPrice: tokensPerEth }));
      } catch (error) {
        console.error('Error getting pool price:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
        }
      }
    };
  
    getPoolPrice();
  }, [publicClient, poolAddress, projectToken, nativeToken]);
  
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
      console.warn('No reference price available (neither pool price nor issuance price)');
      return;
    }

    // For a limit sell order, we want to sell only at or above the target price
    // So set the lower tick to the tick for the target price, and the upper tick to a bit higher
    try {
      const targetTick = priceToTick(targetPriceNum, projectToken.decimals, nativeToken.decimals);
      // Set a narrow range above the target price
      const tickLower = targetTick;
      const tickUpper = targetTick + 1000; // ~10% above target price

      setPriceRange({ lower: tickLower, upper: tickUpper });
      
      console.log('Limit order tick range:', {
        targetPrice: targetPriceNum,
        tickLower,
        tickUpper,
        priceFromTickLower: tickToPrice(tickLower, projectToken.decimals, nativeToken.decimals),
        priceFromTickUpper: tickToPrice(tickUpper, projectToken.decimals, nativeToken.decimals)
      });
    } catch (error) {
      console.error('Error calculating limit order tick range:', error);
    }
  }, [targetPrice, projectToken, nativeToken, priceInfo.poolPrice, priceInfo.issuancePrice]);

  const addLiquidity = async () => {
    if (!address || !walletClient || !publicClient) return;
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

    // Validate minimum position size
    if (parseFloat(projectAmount) < 0.001) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Minimum position size is 1 token"
      });
      return;
    }

    try {
      setIsLoading(true);

      // Convert amounts to wei
      let projectAmountWei;
      let nativeAmountWei = 0n;
      
      try {
        projectAmountWei = parseEther(projectAmount);
      } catch (error) {
        console.error('parseEther failed, using fallback conversion:', error);
        // Fallback: convert manually using project token decimals
        projectAmountWei = BigInt(Math.floor(parseFloat(projectAmount) * 10 ** projectToken.decimals));
      }

      // Convert native amount for two-sided liquidity
      if (!isSingleSided && nativeAmount) {
        try {
          nativeAmountWei = parseEther(nativeAmount);
        } catch (error) {
          console.error('parseEther failed for native token, using fallback conversion:', error);
          nativeAmountWei = BigInt(Math.floor(parseFloat(nativeAmount) * 10 ** nativeToken.decimals));
        }
      }
      
      console.log('🔍 Amount conversion debug:', {
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

      if (isSingleSided) {
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
            functionName: 'liquidity',
          });
          hasExistingLiquidity = poolLiquidity > 0n;
          
          // Get current tick for debugging
          const slot0 = await publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: 'slot0',
          });
          currentTick = Number(slot0[1]);
        } catch (error) {
          console.warn('Could not read pool liquidity, assuming no existing liquidity:', error);
          hasExistingLiquidity = false;
        }
        
        // Debug pool state
        console.log('🔍 Pool State Debug:', {
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
            functionName: 'liquidity',
          });
          hasExistingLiquidity = poolLiquidity > 0n;
          
          // Get current tick to determine if pool is initialized
          const slot0 = await publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: 'slot0',
          });
          currentTick = Number(slot0[1]);
        } catch (error) {
          console.warn('Could not read pool liquidity, assuming no existing liquidity:', error);
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
          
          console.log('🔍 Using range that avoids current tick:', {
            currentTick,
            referenceTick,
            tickLower,
            tickUpper,
            rangeWidth,
            note: 'Range positioned to avoid crossing current price'
          });
        } else {
          // No existing liquidity and pool not initialized: use min/max ticks for initial seeding
          tickLower = TickMath.MIN_TICK + 1; // -887272 + 1
          tickUpper = TickMath.MAX_TICK - 1; // 887272 - 1
          
          console.log('🔍 Using min/max ticks for initial liquidity seeding:', {
            tickLower,
            tickUpper,
            note: 'Full range coverage for initial pool seeding'
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
      
      console.log('🔍 Liquidity calculation:', {
        isSingleSided,
        projectAmount: projectAmount,
        nativeAmount: nativeAmount,
        token0: token0,
        token1: token1,
        amount0Desired: amount0Desired.toString(),
        amount1Desired: amount1Desired.toString(),
        tickRange: { lower: tickLower, upper: tickUpper },
        note: isSingleSided ? 'Single-sided liquidity' : 'Two-sided liquidity for initial seeding'
      });

      // Ensure amounts are bigint
      const amount0DesiredBigInt = BigInt(amount0Desired);
      const amount1DesiredBigInt = BigInt(amount1Desired);

      console.log('🔍 BigInt conversion check:', {
        amount0Desired: amount0DesiredBigInt.toString(),
        amount1Desired: amount1DesiredBigInt.toString(),
        amount0Type: typeof amount0DesiredBigInt,
        amount1Type: typeof amount1DesiredBigInt
      });

      console.log('Transaction Parameters:', {
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

      // Approve tokens before minting
      console.log('🔐 Approving tokens...');
      
      await walletClient.writeContract({
        address: token0 as Address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [positionManagerAddress, amount0DesiredBigInt],
        account: address
      });
      
      await walletClient.writeContract({
        address: token1 as Address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [positionManagerAddress, amount1DesiredBigInt],
        account: address
      });

      console.log('✅ Token approvals completed');
      
      // Check if pool is initialized before minting
      try {
        const slot0 = await publicClient.readContract({
          address: poolAddress,
          abi: POOL_ABI,
          functionName: 'slot0',
        });
        
        const sqrtPriceX96 = BigInt(slot0[0]);
        console.log('Pool sqrtPriceX96:', sqrtPriceX96.toString());
        
        // Check if pool is initialized (sqrtPriceX96 should be > 0)
        if (sqrtPriceX96 === 0n) {
          throw new Error("Pool is not initialized. Please seed initial liquidity first.");
        }
        
        console.log('✅ Pool is initialized, proceeding with mint');
      } catch (error) {
        if (error instanceof Error && error.message.includes("Pool is not initialized")) {
          throw error;
        }
        console.warn('Could not verify pool initialization, proceeding anyway:', error);
      }

      // Add liquidity through the position manager
      const mintHash = await walletClient.writeContract({
        address: positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: 'mint',
        args: [{
          token0: token0 as Address,
          token1: token1 as Address,
          fee: FeeAmount.LOW,
          tickLower,
          tickUpper,
          amount0Desired,
          amount1Desired,
          amount0Min: 0n,
          amount1Min: 0n,
          recipient: address,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20)
        }] as const,
        account: address
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: mintHash });
      console.log('Liquidity added:', receipt);

      toast({
        title: "Success",
        description: isSingleSided ? "Limit order created successfully" : "Initial liquidity seeded successfully"
      });

      // Reset form
      setProjectAmount("");
      setNativeAmount("");
      setTargetPrice("");
    } catch (error) {
      console.error('Error adding liquidity:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add liquidity"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-zinc-50">
      <h3 className="text-lg font-medium mb-4">Add Liquidity</h3>
      
      {/* Add price information section */}
      <div className="mb-4 p-3 bg-white rounded-lg border">
  <h3 className="text-sm font-medium text-gray-900 mb-2">Price Information</h3>
  <div className="space-y-1 text-sm text-gray-600">
  <p>
    Juicebox Issuance Price:{" "}
    {priceInfo.issuancePrice ? (
      <span className="font-medium">
        {priceInfo.issuancePrice.toLocaleString(undefined, {
          maximumSignificantDigits: 8,
        })}{" "}
        {projectToken.symbol} per {nativeToken.symbol}
        <span className="text-gray-400 ml-2">
          {isFinite(1 / priceInfo.issuancePrice) && (
            <>(
              {nativeToken.symbol} per {projectToken.symbol}:{" "}
              {(1 / priceInfo.issuancePrice).toLocaleString(undefined, {
                maximumSignificantDigits: 8,
              })}
              )</>
          )}
        </span>
      </span>
    ) : (
      <span className="text-gray-400">Loading...</span>
    )}
  </p>

  {priceInfo.poolPrice ? (
    <p>
      Current Pool Price:{" "}
      <span className="font-medium">
        {priceInfo.poolPrice.toLocaleString(undefined, {
          maximumSignificantDigits: 8,
        })}{" "}
        {projectToken.symbol} per {nativeToken.symbol}
        <span className="text-gray-400 ml-2">
          {isFinite(1 / priceInfo.poolPrice) && (
            <>(
              {nativeToken.symbol} per {projectToken.symbol}:{" "}
              {(1 / priceInfo.poolPrice).toLocaleString(undefined, {
                maximumSignificantDigits: 8,
              })}
              )</>
          )}
        </span>
      </span>
    </p>
  ) : (
    <p className="text-amber-600">
      Pool not initialized. Set initial price below issuance price.
    </p>
  )}

  {priceInfo.issuancePrice && priceInfo.poolPrice && (
    <p className="text-sm text-gray-500 mt-2">
      Price Difference:{" "}
      <span
        className={
          priceInfo.poolPrice > priceInfo.issuancePrice
            ? "text-green-600"
            : "text-red-600"
        }
      >
        {(
          ((priceInfo.poolPrice - priceInfo.issuancePrice) /
            priceInfo.issuancePrice) *
          100
        ).toLocaleString(undefined, {
          maximumSignificantDigits: 4,
        })}
        %
      </span>
      {/* Debug info */}
      <span className="text-xs text-gray-400 ml-2">
        (Debug: issuance={priceInfo.issuancePrice}, pool={priceInfo.poolPrice})
      </span>
    </p>
  )}
</div>

</div>

      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="singleSided"
            checked={isSingleSided}
            onChange={(e) => setIsSingleSided(e.target.checked)}
            className="rounded border-zinc-300"
          />
          <label htmlFor="singleSided" className="text-sm">
            Single-sided liquidity
          </label>
        </div>

        {isSingleSided && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {priceInfo.poolPrice ? 'Minimum price per token in' : 'Initial Price'} {nativeToken.symbol} for 1 {projectToken.symbol}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={priceInfo.poolPrice ? "Enter limit sell price" : "Enter initial price"}
                className="w-full p-2 border rounded"
                disabled={isLoading}
                min={0}
                step="0.000001"
              />
              {priceRange && (
                <div className="text-xs text-gray-500">
                  Tick range: {priceRange.lower} – {priceRange.upper} <br />
                  Tick width: {priceRange.upper - priceRange.lower}
                </div>
              )}
              {priceInfo.issuancePrice && !priceInfo.poolPrice && (
                <span className="text-sm text-amber-600">
                  Max: {priceInfo.issuancePrice.toFixed(6)}
                </span>
              )}
              {priceInfo.poolPrice && (
                <span className="text-sm text-gray-500">
                  Min: {priceInfo.poolPrice.toFixed(6)}
                </span>
              )}
            </div>
            {targetPrice && priceInfo.issuancePrice && (
              <p className="text-sm text-gray-500">
                {!priceInfo.poolPrice ? (
                  parseFloat(targetPrice) >= priceInfo.issuancePrice ? (
                    <span className="text-red-600">
                      Initial price must be below issuance price
                    </span>
                  ) : (
                    <span className="text-green-600">
                      Initial price is valid
                    </span>
                  )
                ) : (
                  parseFloat(targetPrice) <= priceInfo.poolPrice ? (
                    <span className="text-red-600">
                      Limit sell price must be above current pool price
                    </span>
                  ) : (
                    <span className="text-green-600">
                      Limit sell price is valid
                    </span>
                  )
                )}
              </p>
            )}
          </div>
        )}

        {!isSingleSided && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-2">
              Provide both tokens to seed initial liquidity. This enables one-sided positions for other users.
            </p>
            <label className="block text-sm font-medium">
              Amount of {nativeToken.symbol} to provide
            </label>
            <input
              type="number"
              value={nativeAmount}
              onChange={(e) => setNativeAmount(e.target.value)}
              placeholder={`Enter ${nativeToken.symbol} amount`}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            {isSingleSided ? `Amount of ${projectToken.symbol} to sell` : `Amount of ${projectToken.symbol} to provide`}
          </label>
          <input
            type="number"
            value={projectAmount}
            onChange={(e) => setProjectAmount(e.target.value)}
            placeholder={`Enter ${projectToken.symbol} amount`}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
        </div>

        <ButtonWithWallet
          onClick={addLiquidity}
          disabled={
            isLoading || 
            (isSingleSided ? 
              (!projectAmount || !targetPrice || parseFloat(targetPrice) <= (priceInfo.poolPrice || 0)) : 
              (!nativeAmount || !projectAmount)
            ) || 
            disabled
          }
          className="w-full"
        >
          {isLoading ? 'Adding Liquidity...' : (isSingleSided ? 'Create Limit Order' : 'Seed Initial Liquidity')}
        </ButtonWithWallet>

        <PositionsList projectToken={projectToken} nativeToken={nativeToken} />
      </div>
    </div>
  );
} 