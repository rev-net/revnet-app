import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Token, Price } from "@uniswap/sdk-core";
import { Address, parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient, useBlockNumber } from "wagmi";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { POSITION_MANAGER_ADDRESSES } from "@/constants";
import { PositionsList } from "./PositionsList";
import { useJBRulesetContext } from "juice-sdk-react";
import { getTokenBtoAQuote, JBChainId } from "juice-sdk-core";
import { FixedInt } from "fpnum";
import { TickMath, FeeAmount } from "@uniswap/v3-sdk";
import JSBI from 'jsbi';
import { 
  completeLiquidityProvision, 
  calculateSqrtPriceX96, 
  safeParseEther,
  formatTickRangeToPriceRange,
  priceToTick,
  tickToPrice,
  usePoolPrice,
  getPoolState
} from "@/lib/uniswap";
import { performSwap, getSwapQuote, checkPoolForSwap } from "@/lib/uniswap/swap";

interface PriceInfo {
  issuancePrice: number | null;  // Price from Juicebox (tokens per ETH)
  poolPrice: number | null;      // Current pool price (tokens per ETH)
}

interface AddLiquidityProps {
  poolAddress: Address;
  projectToken: Token;
  nativeToken: Token;
  disabled?: boolean;
  onLiquidityAdded?: () => void;
}

export function AddLiquidity({
  poolAddress,
  projectToken,
  nativeToken,
  disabled,
  onLiquidityAdded,
}: AddLiquidityProps) {
  const { address } = useAccount();
  const walletClient = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();

  // Form state
  const [projectAmount, setProjectAmount] = useState("");
  const [nativeAmount, setNativeAmount] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [isSingleSided, setIsSingleSided] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [poolHasLiquidity, setPoolHasLiquidity] = useState<boolean | null>(null);
  const [isSwapLoading, setIsSwapLoading] = useState(false);
  const [swapQuote, setSwapQuote] = useState<{ amountOut: string; priceImpact: number } | null>(null);

  // Price information
  const [priceInfo, setPriceInfo] = useState<PriceInfo>({
    issuancePrice: null,
    poolPrice: null,
  });

  // Add block number for auto-updates
  const { data: blockNumber } = useBlockNumber();
  
  // Use the new hook for pool price
  const poolPriceInfo = usePoolPrice(poolAddress, projectToken, nativeToken, publicClient || null, blockNumber ? Number(blockNumber) : undefined);

  // Check if pool has liquidity and set default radio button state
  useEffect(() => {
    const checkPoolLiquidity = async () => {
      if (!poolAddress || !publicClient) return;

      try {
        const poolState = await getPoolState(poolAddress, publicClient, projectToken, nativeToken);
        const hasLiquidity = poolState.exists && poolState.initialized && poolState.liquidity > 0n;
        setPoolHasLiquidity(hasLiquidity);
        
        // Set default radio button state based on pool liquidity
        setIsSingleSided(hasLiquidity);
      } catch (error) {
        // Default to two-sided if we can't determine pool state
        setPoolHasLiquidity(false);
        setIsSingleSided(false);
      }
    };

    checkPoolLiquidity();
  }, [poolAddress, publicClient, projectToken, nativeToken, blockNumber]);

  // Get issuance price from Juicebox
  useEffect(() => {
    const getIssuancePrice = async () => {
    if (!ruleset?.data || !rulesetMetadata?.data) return;

    try {
        const quote = await getTokenBtoAQuote(
          new FixedInt(parseEther("1"), projectToken.decimals),
        projectToken.decimals,
        {
          weight: ruleset.data.weight,
          reservedPercent: rulesetMetadata.data.reservedPercent,
        }
      );
        const issuancePrice = Number(quote.value) / 1e18;
        setPriceInfo(prev => ({ ...prev, issuancePrice }));
    } catch (error) {
        // Ignore error
    }
    };

    getIssuancePrice();
  }, [ruleset?.data, rulesetMetadata?.data, projectToken.decimals]);

  // Calculate price range for single-sided liquidity
  const priceRange = useMemo(() => {
    if (!targetPrice || !priceInfo.poolPrice) return null;

    const targetPriceNum = parseFloat(targetPrice);
    
    // Calculate a range around the target price (±10%)
    const rangeMultiplier = 0.1;
    const lowerPrice = targetPriceNum * (1 - rangeMultiplier);
    const upperPrice = targetPriceNum * (1 + rangeMultiplier);
    
    // Convert to ticks using proper Uniswap V3 calculation
    const lowerTick = Math.floor(Math.log(lowerPrice) / Math.log(1.0001));
    const upperTick = Math.floor(Math.log(upperPrice) / Math.log(1.0001));
    
    return { lower: lowerTick, upper: upperTick };
  }, [targetPrice, priceInfo.poolPrice]);

  const addLiquidity = async () => {
    if (!address || !walletClient?.data || !publicClient) return;

    // Validate inputs
    if (isSingleSided) {
      // For single-sided liquidity, only project amount is required
      if (!projectAmount) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Please enter ${projectToken.symbol} amount`
        });
        return;
      }
    } else {
      // For two-sided liquidity, both amounts are required
      if (!projectAmount || !nativeAmount) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter amounts for both tokens"
        });
        return;
      }
    }

    const projectAmountNum = parseFloat(projectAmount);
    const nativeAmountNum = parseFloat(nativeAmount);

    if (isSingleSided) {
      // For single-sided, only validate project amount
      if (isNaN(projectAmountNum) || projectAmountNum <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Please enter a valid positive ${projectToken.symbol} amount`
        });
        return;
      }
    } else {
      // For two-sided, validate both amounts
      if (isNaN(projectAmountNum) || isNaN(nativeAmountNum) || projectAmountNum <= 0 || nativeAmountNum <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter valid positive amounts"
        });
        return;
      }
    }

    // Validate target price for single-sided liquidity
    if (isSingleSided && (!targetPrice || parseFloat(targetPrice) <= 0)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid target price for single-sided liquidity"
      });
      return;
    }

    try {
      setIsLoading(true);

      // Convert amounts to wei
      const projectAmountWei = parseEther(projectAmount);
      const nativeAmountWei = isSingleSided ? 0n : parseEther(nativeAmount);

      // Determine token order and amounts
      const [token0, token1] = projectToken.address.toLowerCase() < nativeToken.address.toLowerCase()
        ? [projectToken, nativeToken]
        : [nativeToken, projectToken];

      const [amount0, amount1] = projectToken.address.toLowerCase() < nativeToken.address.toLowerCase()
        ? [projectAmountWei, nativeAmountWei]
        : [nativeAmountWei, projectAmountWei];

      // Calculate initial price for single-sided liquidity
      let initialPrice: bigint | undefined;
      if (isSingleSided && targetPrice) {
        const targetPriceNum = parseFloat(targetPrice);
        initialPrice = calculateSqrtPriceX96(targetPriceNum);
      }
        
      // Use the comprehensive helper for all liquidity provision
      const result = await completeLiquidityProvision({
        token0,
        token1,
        fee: FeeAmount.HIGH,
        amount0,
        amount1,
        recipient: address,
        walletClient: walletClient.data as any,
        publicClient,
        account: address,
        useSingleSided: isSingleSided,
        initialPrice
      });

      toast({
        title: "Success",
        description: isSingleSided ? "Limit order created successfully" : "Liquidity added successfully"
      });

      // Reset form
      setProjectAmount("");
      setNativeAmount("");
      setTargetPrice("");
      
      if (onLiquidityAdded) {
        onLiquidityAdded();
      }
    } catch (error) {
      console.error('❌ Liquidity provision failed:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add liquidity"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Swap functionality
  const handleSwapQuote = async () => {
    if (!projectAmount || !publicClient) return;

    try {
      const amountIn = parseEther(projectAmount);
      const quote = await getSwapQuote(projectToken, nativeToken, amountIn, publicClient);
      
      if (quote && !('type' in quote)) {
        // Success case - quote is a SwapQuote
        const amountOutEth = Number(quote.amountOut) / 1e18;
        
        setSwapQuote({
          amountOut: amountOutEth.toFixed(6),
          priceImpact: quote.priceImpact
        });
      } else if (quote && 'type' in quote) {
        // Error case - quote is a SwapQuoteError
        setSwapQuote(null);
        
        let errorMessage = quote.message;
        if (quote.type === 'insufficient_liquidity' && quote.details) {
          const tokenInFormatted = quote.details.tokenInBalance 
            ? (Number(quote.details.tokenInBalance) / Math.pow(10, projectToken.decimals)).toFixed(6)
            : '0';
          const tokenOutFormatted = quote.details.tokenOutBalance 
            ? (Number(quote.details.tokenOutBalance) / Math.pow(10, nativeToken.decimals)).toFixed(6)
            : '0';
          const requiredFormatted = (Number(amountIn) / Math.pow(10, projectToken.decimals)).toFixed(6);
          
          errorMessage = `Insufficient liquidity. Pool has ${tokenInFormatted} ${projectToken.symbol} and ${tokenOutFormatted} ${nativeToken.symbol}, but you're trying to swap ${requiredFormatted} ${projectToken.symbol}.`;
        }
        
        toast({
          variant: "destructive",
          title: "Quote Failed",
          description: errorMessage
        });
      } else {
        // Null case
        setSwapQuote(null);
        toast({
          variant: "destructive",
          title: "Quote Failed",
          description: "Unable to get swap quote. The pool may not have sufficient liquidity for this trade."
        });
      }
    } catch (error) {
      setSwapQuote(null);
      toast({
        variant: "destructive",
        title: "Quote Error",
        description: "Failed to get swap quote. Please try a smaller amount or check if the pool has liquidity."
      });
    }
  };

  // Auto-update quote when amount changes
  useEffect(() => {
    if (projectAmount && parseFloat(projectAmount) > 0) {
      const timeoutId = setTimeout(() => {
        handleSwapQuote();
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    } else {
      setSwapQuote(null);
    }
  }, [projectAmount]);

  const sellOnMarket = async () => {
    if (!address || !walletClient?.data || !publicClient || !projectAmount) return;

    const projectAmountNum = parseFloat(projectAmount);
    if (isNaN(projectAmountNum) || projectAmountNum <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Please enter a valid positive ${projectToken.symbol} amount`
      });
      return;
    }

    try {
      setIsSwapLoading(true);

      // Check if pool has liquidity for swapping
      const poolCheck = await checkPoolForSwap(projectToken, nativeToken, publicClient);
      if (!poolCheck.hasLiquidity) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Pool doesn't have sufficient liquidity for swapping"
        });
        return;
      }

      const amountIn = parseEther(projectAmount);

      const result = await performSwap({
        tokenIn: projectToken,
        tokenOut: nativeToken,
        amountIn,
        recipient: address,
        walletClient: walletClient.data,
        publicClient,
        account: address
      });

      toast({
        title: "Success",
        description: `Successfully swapped ${projectAmount} ${projectToken.symbol} for ${(Number(result.amountOut) / 1e18).toFixed(6)} ${nativeToken.symbol}`
      });

      // Reset form
      setProjectAmount("");
      setSwapQuote(null);
      
      if (onLiquidityAdded) {
        onLiquidityAdded();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute swap"
      });
    } finally {
      setIsSwapLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-zinc-50">
      <h3 className="text-lg font-medium mb-4">Sell on Market</h3>

      {/* Sell on Market Card - Only show when pool has liquidity */}
      {poolHasLiquidity && (
        <div className="mb-6 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-800">Sell on Market</h4>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
              Market Order
            </span>
          </div>

          {/* Current Price Display */}
          {poolPriceInfo.tokensPerEth && (
            <div className="text-sm text-zinc-700 mb-4 p-3 border rounded bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Current Price:</p>
                <span className="text-xs text-green-600">
                  Auto-updating
                </span>
              </div>
              <p>1 {projectToken.symbol} = {(poolPriceInfo.tokensPerEth || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {nativeToken.symbol}</p>
              <p>1 {nativeToken.symbol} = {(poolPriceInfo.ethPerToken || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {projectToken.symbol}</p>
            </div>
          )}
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {projectToken.symbol} amount
            </label>
            <input
              type="number"
              value={projectAmount}
              onChange={(e) => {
                setProjectAmount(e.target.value);
              }}
              placeholder={`Enter ${projectToken.symbol} amount`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              disabled={disabled || isSwapLoading}
            />
          </div>

          {swapQuote && (
            <div className="mb-3 p-3 bg-white rounded-md border border-orange-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">You'll receive:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {swapQuote.amountOut} {nativeToken.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Price impact:</span>
                <span className={`text-sm font-medium ${swapQuote.priceImpact > 1 ? 'text-red-600' : 'text-green-600'}`}>
                  {swapQuote.priceImpact.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          <ButtonWithWallet
            targetChainId={projectToken.chainId as JBChainId}
            onClick={sellOnMarket}
            disabled={disabled || isSwapLoading || !projectAmount || !swapQuote}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isSwapLoading ? "Selling..." : "Sell on Market"}
          </ButtonWithWallet>
        </div>
      )}

      {/* Liquidity Provision Section - Only show when no pool exists */}
      {!poolHasLiquidity && (
        <>
          {/* Pool Price Display */}
          {poolPriceInfo.tokensPerEth && (
            <div className="text-sm text-zinc-700 mb-4 p-3 border rounded bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Current Price:</p>
                <span className="text-xs text-green-600">
                  Auto-updating
                </span>
              </div>
              <p>1 {projectToken.symbol} = {(poolPriceInfo.tokensPerEth || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {nativeToken.symbol}</p>
              <p>1 {nativeToken.symbol} = {(poolPriceInfo.ethPerToken || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {projectToken.symbol}</p>
            </div>
          )}

          {/* Liquidity type selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Liquidity Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={isSingleSided}
                  onChange={() => setIsSingleSided(true)}
                  className="mr-2"
                />
                Single-sided (Limit Order)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!isSingleSided}
                  onChange={() => setIsSingleSided(false)}
                  className="mr-2"
                />
                Two-sided Liquidity
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              New pool - two-sided liquidity recommended for initial setup
            </p>
          </div>

          {/* Project token amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {projectToken.symbol} Amount
            </label>
            <input
              type="number"
              value={projectAmount}
              onChange={(e) => setProjectAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled || isLoading}
            />
          </div>

          {/* Native token amount (only for two-sided) */}
          {!isSingleSided && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {nativeToken.symbol} Amount
              </label>
              <input
                type="number"
                value={nativeAmount}
                onChange={(e) => setNativeAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={disabled || isLoading}
              />
            </div>
          )}

          {/* Target price for single-sided liquidity */}
          {isSingleSided && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Price (1 {projectToken.symbol} = {nativeToken.symbol})
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={disabled || isLoading}
              />
              {priceRange && (
                <p className="text-xs text-gray-500 mt-1">
                  Debug - Raw ticks: {priceRange.lower} to {priceRange.upper} | 
                  Raw prices: {tickToPrice(priceRange.lower, projectToken.decimals, nativeToken.decimals).toFixed(10)} to {tickToPrice(priceRange.upper, projectToken.decimals, nativeToken.decimals).toFixed(10)}
                </p>
              )}
            </div>
          )}

          {/* Add liquidity button */}
          <ButtonWithWallet
            targetChainId={projectToken.chainId as JBChainId}
            onClick={addLiquidity}
            disabled={disabled || isLoading}
            className="w-full"
          >
            {isLoading ? "Adding Liquidity..." : isSingleSided ? "Create Limit Order" : "Add Liquidity"}
          </ButtonWithWallet>

          {/* Show existing positions */}
          <PositionsList projectToken={projectToken} nativeToken={nativeToken} />
        </>
      )}
    </div>
  );
} 