import { Token } from "@uniswap/sdk-core";
import { Address, parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient, useBlockNumber } from "wagmi";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PositionsList } from "./PositionsList";
import { useJBRulesetContext } from "juice-sdk-react";
import { getTokenBtoAQuote } from "juice-sdk-core";
import { FixedInt } from "fpnum";
import { FeeAmount } from "@uniswap/v3-sdk";
import { 
  completeLiquidityProvision, 
  calculateSqrtPriceX96, 
  usePoolPrice,
  getPoolState
} from "@/lib/uniswap";
import { performSwap, getSwapQuote, checkPoolForSwap } from "@/lib/uniswap/swap";
import { Button } from "@/components/ui/button";
import { unwrapWeth } from "@/lib/uniswap/position";

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

  // Update state for view selection to include 'lp'
  const [activeView, setActiveView] = useState<'sell' | 'limit' | 'lp'>('sell');

  // Check if pool has liquidity and set default radio button state
  useEffect(() => {
    const checkPoolLiquidity = async () => {
      if (!poolAddress || !publicClient) return;

      try {
        const poolState = await getPoolState(poolAddress, publicClient, projectToken, nativeToken);
        const hasLiquidity = poolState.exists && poolState.initialized && poolState.liquidity > 0n;
        setPoolHasLiquidity(hasLiquidity);
        
        // Only set single-sided for limit order tab, not for LP tab
        if (activeView === 'limit') {
          setIsSingleSided(hasLiquidity);
        } else if (activeView === 'lp') {
          setIsSingleSided(false); // Always two-sided for LP tab
        }
      } catch (error) {
        // Default to two-sided if we can't determine pool state
        setPoolHasLiquidity(false);
        setIsSingleSided(false);
      }
    };

    checkPoolLiquidity();
  }, [poolAddress, publicClient, projectToken, nativeToken, blockNumber, activeView]);

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

  // Auto-set view based on pool liquidity
  useEffect(() => {
    if (poolHasLiquidity) {
      setActiveView('sell'); // Default to sell when pool exists
    } else {
      setActiveView('lp'); // Default to LP when no pool
    }
  }, [poolHasLiquidity]);

  // Handle tab changes to set correct liquidity type
  useEffect(() => {
    if (activeView === 'lp') {
      setIsSingleSided(false); // Always two-sided for LP tab
    } else if (activeView === 'limit') {
      setIsSingleSided(poolHasLiquidity || false); // Single-sided for limit orders
    }
  }, [activeView, poolHasLiquidity]);

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

      // Check if we need to unwrap WETH
      const { WETH_ADDRESSES } = await import('@/constants');
      const wethAddress = WETH_ADDRESSES[projectToken.chainId];
      
      if (wethAddress && nativeToken.address.toLowerCase() === wethAddress.toLowerCase()) {
        // Unwrap the received WETH to ETH
        const unwrapResult = await unwrapWeth({
          amount: result.amountOut,
          recipient: address,
          walletClient: walletClient.data,
          account: address,
          chainId: projectToken.chainId
        });
        
        toast({
          title: "Success",
          description: `Successfully swapped ${projectAmount} ${projectToken.symbol} for ${(Number(result.amountOut) / 1e18).toFixed(6)} ${nativeToken.symbol} and unwrapped to ETH`
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully swapped ${projectAmount} ${projectToken.symbol} for ${(Number(result.amountOut) / 1e18).toFixed(6)} ${nativeToken.symbol}`
        });
      }

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
    <>
      {/* View Tabs - Only show when pool exists */}
      {poolHasLiquidity && (
        <div className="flex flex-row space-x-4 mb-4">
          <Button
            variant={activeView === 'sell' ? "tab-selected" : "bottomline"}
            size="sm"
            onClick={() => setActiveView('sell')}
            className="px-3 py-2"
          >
            SPOT
          </Button>
          <Button
            variant={activeView === 'limit' ? "tab-selected" : "bottomline"}
            size="sm"
            onClick={() => setActiveView('limit')}
            className="px-3 py-2"
          >
            LIMIT
          </Button>
          <Button
            variant={activeView === 'lp' ? "tab-selected" : "bottomline"}
            size="sm"
            onClick={() => setActiveView('lp')}
            className="px-3 py-2"
          >
            LP
          </Button>
        </div>
      )}

      {/* Sell on Market Card */}
      {(activeView === 'sell' && poolHasLiquidity) && (
        <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-800">Sell on Market</h4>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
              Market Order
            </span>
          </div>

          {/* Current Price Display */}
          {poolPriceInfo.tokensPerEth && (
            <div className="text-sm text-zinc-700 mb-4 p-3 border rounded bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Current Price:</p>
                <span className="text-xs text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Live
                </span>
              </div>
              <p>1 {projectToken.symbol} = {(poolPriceInfo.tokensPerEth || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {nativeToken.symbol}</p>
              <p>1 {nativeToken.symbol} = {(poolPriceInfo.ethPerToken || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {projectToken.symbol}</p>
            </div>
          )}
          
          <div className="mb-3 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
              <input
                type="number"
                value={projectAmount}
                onChange={(e) => {
                  setProjectAmount(e.target.value);
                }}
                placeholder="0.0"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-white"
                disabled={disabled || isSwapLoading}
              />
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">{projectToken.symbol}</div>
                <div className="text-xs text-gray-600">You Sell</div>
              </div>
            </div>
            
            {/* Swap arrow */}
            <div className="flex justify-center mb-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* You receive amount - always show when sell tab is active */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={swapQuote?.amountOut || "0.0"}
                readOnly
                className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800 pointer-events-none select-none"
              />
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">{nativeToken.symbol}</div>
                <div className="text-xs text-gray-600">You receive</div>
              </div>
            </div>
          </div>

          <Button
            variant="default"
            onClick={sellOnMarket}
            disabled={disabled || isSwapLoading || !projectAmount || !swapQuote}
            className="w-full"
            loading={isSwapLoading}
          >
            {isSwapLoading ? "Selling..." : "Sell on Market"}
          </Button>
        </div>
      )}

      {/* Limit Order Card */}
      {(activeView === 'limit' || (!poolHasLiquidity && activeView !== 'lp')) && (
        <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-800">Set Sell Price</h4>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
              Single-sided
            </span>
          </div>

          {/* Pool Price Display */}
          {poolPriceInfo.tokensPerEth && (
            <div className="text-sm text-zinc-700 mb-4 p-3 border rounded bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Current Price:</p>
                <span className="text-xs text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Live
                </span>
              </div>
              <p>1 {projectToken.symbol} = {(poolPriceInfo.tokensPerEth || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {nativeToken.symbol}</p>
              <p>1 {nativeToken.symbol} = {(poolPriceInfo.ethPerToken || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {projectToken.symbol}</p>
            </div>
          )}

          {/* Liquidity type selector - only show when no pool exists */}
          {!poolHasLiquidity && (
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
          )}

          {/* Project token amount */}
          <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
              <input
                type="number"
                value={projectAmount}
                onChange={(e) => setProjectAmount(e.target.value)}
                placeholder="0.0"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-white"
                disabled={disabled || isLoading}
              />
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">{projectToken.symbol}</div>
                <div className="text-xs text-gray-600">You Sell</div>
              </div>
            </div>

            {/* @ symbol separator */}
            <div className="flex justify-center mb-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            {/* Native token amount (only for two-sided when no pool exists) */}
            {!poolHasLiquidity && !isSingleSided && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                <input
                  type="number"
                  value={nativeAmount}
                  onChange={(e) => setNativeAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-white"
                  disabled={disabled || isLoading}
                />
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">{nativeToken.symbol}</div>
                  <div className="text-xs text-gray-600">Amount</div>
                </div>
              </div>
            )}

            {/* Target price for single-sided liquidity */}
            {(!poolHasLiquidity || isSingleSided) && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.0"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-white select-none"
                  disabled={disabled || isLoading}
                />
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">{nativeToken.symbol}</div>
                  <div className="text-xs text-gray-600">Target Price</div>
                </div>
              </div>
            )}
          </div>

          {/* Add liquidity button */}
          <Button
            variant="default"
            onClick={addLiquidity}
            disabled={disabled || isLoading}
            className="w-full"
            loading={isLoading}
          >
            {isLoading ? "Adding Liquidity..." : "Create Limit Order"}
          </Button>
        </div>
      )}

      {/* LP Card - Two-sided Liquidity */}
      {activeView === 'lp' && (
        <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-800">Provide Liquidity</h4>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
              Two-sided
            </span>
          </div>

          {/* Pool Price Display */}
          {poolPriceInfo.tokensPerEth && (
            <div className="text-sm text-zinc-700 mb-4 p-3 border rounded bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Current Price:</p>
                <span className="text-xs text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Live
                </span>
              </div>
              <p>1 {projectToken.symbol} = {(poolPriceInfo.tokensPerEth || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {nativeToken.symbol}</p>
              <p>1 {nativeToken.symbol} = {(poolPriceInfo.ethPerToken || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} {projectToken.symbol}</p>
            </div>
          )}

          {/* Project token amount */}
          <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
              <input
                type="number"
                value={projectAmount}
                onChange={(e) => setProjectAmount(e.target.value)}
                placeholder="0.0"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-white"
                disabled={disabled || isLoading}
              />
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">{projectToken.symbol}</div>
                <div className="text-xs text-gray-600">Amount</div>
              </div>
            </div>

            {/* @ symbol separator */}
            <div className="flex justify-center mb-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>

            {/* Native token amount */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <input
                type="number"
                value={nativeAmount}
                onChange={(e) => setNativeAmount(e.target.value)}
                placeholder="0.0"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-white"
                disabled={disabled || isLoading}
              />
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">{nativeToken.symbol}</div>
                <div className="text-xs text-gray-600">Amount</div>
              </div>
            </div>
          </div>

          {/* Add liquidity button */}
          <Button
            variant="default"
            onClick={addLiquidity}
            disabled={disabled || isLoading}
            className="w-full"
            loading={isLoading}
          >
            {isLoading ? "Adding Liquidity..." : "Add Liquidity"}
          </Button>
        </div>
      )}

      {/* Your Positions Card - Only show when Limit Order or LP tab is selected */}
      {(activeView === 'limit' || activeView === 'lp' || !poolHasLiquidity) && (
        <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-800">Your Positions</h4>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
              Liquidity Positions
            </span>
          </div>
          
          <PositionsList projectToken={projectToken} nativeToken={nativeToken} />
        </div>
      )}
    </>
  );
} 