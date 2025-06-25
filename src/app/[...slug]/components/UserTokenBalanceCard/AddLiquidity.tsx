import { Address, parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient, useBlockNumber, useBalance } from "wagmi";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PositionsList } from "./PositionsList";
import { useJBRulesetContext } from "juice-sdk-react";
import { getTokenBtoAQuote } from "juice-sdk-core";
import { FixedInt } from "fpnum";
import { Token } from "@uniswap/sdk-core";
import { 
  usePoolPrice,
  getPoolState
} from "@/lib/uniswap";
import { performSwap } from "@/lib/uniswap/swap";
import { Button } from "@/components/ui/button";
import { unwrapWeth } from "@/lib/uniswap/position";
import { TokenAmount } from "@/components/TokenAmount";
import { NativeTokenValue } from "@/components/NativeTokenValue";
import { useExitFloorPrice } from "@/hooks/useExitFloorPrice";
import { useBalanceValidation } from "@/hooks/useBalanceValidation";
import { useSwapQuote } from "@/hooks/useSwapQuote";
import { useLiquidityProvision } from "@/hooks/useLiquidityProvision";
import { 
  getNativeTokenDisplaySymbol, 
  getNativeTokenDisplaySymbolForBalance
} from "@/lib/tokenDisplay";
import { 
  PriceInfo, 
  calculatePriceRange, 
  formatPrice,
  getDefaultTargetPrice
} from "@/lib/uniswap/priceCalculations";
import { ViewTabs } from "@/components/ViewTabs";
import { PriceDisplay } from "@/components/PriceDisplay";
import { TokenInput } from "@/components/TokenInput";
import { SwapDirectionToggle } from "@/components/SwapDirectionToggle";

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
  const [poolHasLiquidity, setPoolHasLiquidity] = useState<boolean | null>(null);

  // Update state for view selection to include 'lp' - move this up
  const [activeView, setActiveView] = useState<'sell' | 'limit' | 'lp'>('sell');

  // Price information
  const [priceInfo, setPriceInfo] = useState<PriceInfo>({
    issuancePrice: null,
    poolPrice: null,
  });

  // Add block number for auto-updates
  const { data: blockNumber } = useBlockNumber();
  
  // Use the new hook for pool price
  const poolPriceInfo = usePoolPrice(poolAddress, projectToken, nativeToken, publicClient || null, blockNumber ? Number(blockNumber) : undefined);

  // Add balance hooks using Wagmi
  const { data: projectTokenBalance } = useBalance({
    address,
    token: projectToken.address as Address,
  });

  const { data: nativeTokenBalance } = useBalance({
    address,
    token: nativeToken.address as Address,
  });

  // Add ETH balance hook for LP section (since we wrap ETH to WETH)
  const { data: ethBalance } = useBalance({
    address,
  });

  // Add exit floor price hook
  const exitFloorPrice = useExitFloorPrice();

  // Helper function to convert Wagmi balance to TokenAmount format
  const projectTokenAmount = useMemo(() => {
    if (!projectTokenBalance?.value) return null;
    
    return {
      amount: new FixedInt(projectTokenBalance.value, projectToken.decimals),
      symbol: projectToken.symbol
    };
  }, [projectTokenBalance?.value, projectToken.decimals, projectToken.symbol]);

  const nativeTokenAmount = useMemo(() => {
    if (!nativeTokenBalance?.value) return null;
    
    return {
      amount: new FixedInt(nativeTokenBalance.value, nativeToken.decimals),
      symbol: nativeToken.symbol
    };
  }, [nativeTokenBalance?.value, nativeToken.decimals, nativeToken.symbol]);

  // Helper function to convert ETH balance to TokenAmount format
  const ethTokenAmount = useMemo(() => {
    if (!ethBalance?.value) return null;
    
    return {
      amount: new FixedInt(ethBalance.value, 18), // ETH has 18 decimals
      symbol: "ETH"
    };
  }, [ethBalance?.value]);

  // Helper function to get the display symbol for native token
  const getNativeTokenDisplaySymbolMemo = useMemo(() => {
    return getNativeTokenDisplaySymbol(nativeToken, nativeToken.chainId);
  }, [nativeToken.address, nativeToken.chainId, nativeToken.symbol]);

  // Helper function to get the display symbol for native token in balance messages
  const getNativeTokenDisplaySymbolForBalanceMemo = useMemo(() => {
    return getNativeTokenDisplaySymbolForBalance(nativeToken, nativeToken.chainId, activeView);
  }, [nativeToken.address, nativeToken.chainId, nativeToken.symbol, activeView]);

  // Use balance validation hook
  const { hasSufficientBalance, getBalanceErrorMessage } = useBalanceValidation({
    projectAmount,
    nativeAmount,
    projectToken,
    projectTokenBalance: projectTokenBalance?.value,
    nativeTokenBalance: nativeTokenBalance?.value,
    ethBalance: ethBalance?.value,
    isSingleSided,
    activeView,
    projectTokenAmount,
    ethTokenAmount,
    nativeTokenAmount,
  });

  // Use swap quote hook
  const { swapQuote, isSwapLoading, setIsSwapLoading } = useSwapQuote({
    projectAmount,
    projectToken,
    nativeToken,
    publicClient,
    activeView,
  });

  // Use liquidity provision hook
  const { isLoading, addLiquidity } = useLiquidityProvision({
    projectToken,
    nativeToken,
    projectAmount,
    nativeAmount,
    targetPrice,
    isSingleSided,
    address: address!,
    walletClient: walletClient?.data || null,
    publicClient,
    onLiquidityAdded,
  });

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
    return calculatePriceRange(targetPrice, priceInfo.poolPrice);
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

  // Add state to track if we've set the initial target price
  const [hasSetInitialTargetPrice, setHasSetInitialTargetPrice] = useState(false);

  // Set initial target price from current pool price when available
  useEffect(() => {
    if (poolPriceInfo.tokensPerEth && !hasSetInitialTargetPrice && activeView === 'limit') {
      const defaultPrice = getDefaultTargetPrice(poolPriceInfo.tokensPerEth);
      setTargetPrice(defaultPrice);
      setHasSetInitialTargetPrice(true);
    }
  }, [poolPriceInfo.tokensPerEth, hasSetInitialTargetPrice, activeView]);

  // Reset the flag when switching to limit view
  useEffect(() => {
    if (activeView === 'limit') {
      setHasSetInitialTargetPrice(false);
    }
  }, [activeView]);

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

      const amountIn = parseEther(projectAmount);

      // Check user's token balance before attempting swap
      const userBalance = await publicClient.readContract({
        address: projectToken.address as Address,
        abi: [
          {
            inputs: [{ name: 'account', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function'
          }
        ],
        functionName: 'balanceOf',
        args: [address]
      });

      if (userBalance < amountIn) {
        const userBalanceFormatted = (Number(userBalance) / Math.pow(10, projectToken.decimals)).toFixed(6);
        toast({
          variant: "destructive",
          title: "Insufficient Balance",
          description: `You only have ${userBalanceFormatted} ${projectToken.symbol}`
        });
        return;
      }

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
      
      if (onLiquidityAdded) {
        onLiquidityAdded();
      }
    } catch (error) {
      let errorMessage = "Failed to execute swap";
      let errorTitle = "Swap Failed";
      
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes("insufficient") || errorText.includes("balance")) {
          errorMessage = "Insufficient balance or liquidity for this swap";
          errorTitle = "Insufficient Balance";
        } else if (errorText.includes("slippage") || errorText.includes("price")) {
          errorMessage = "Price moved too much. Try again with a smaller amount.";
          errorTitle = "Price Impact Too High";
        } else if (errorText.includes("gas") || errorText.includes("fee")) {
          errorMessage = "Transaction failed due to gas issues. Please try again.";
          errorTitle = "Gas Error";
        } else if (errorText.includes("approval") || errorText.includes("allowance")) {
          errorMessage = "Token approval failed. Please try approving again.";
          errorTitle = "Approval Failed";
        } else if (errorText.includes("deadline") || errorText.includes("expired")) {
          errorMessage = "Transaction deadline expired. Please try again.";
          errorTitle = "Transaction Expired";
        } else if (errorText.includes("pool") || errorText.includes("liquidity")) {
          errorMessage = "Pool doesn't have enough liquidity for this trade.";
          errorTitle = "Insufficient Liquidity";
        } else if (errorText.includes("user rejected") || errorText.includes("user denied")) {
          errorMessage = "Transaction was cancelled by user.";
          errorTitle = "Transaction Cancelled";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage
      });
    } finally {
      setIsSwapLoading(false);
    }
  };

  return (
    <>
      {/* View Tabs */}
      {poolHasLiquidity && (
        <ViewTabs
          activeView={activeView}
          onViewChange={(view) => setActiveView(view as 'sell' | 'limit' | 'lp')}
          views={[
            { id: 'sell', label: 'SPOT' },
            { id: 'limit', label: 'LIMIT' },
            { id: 'lp', label: 'LP' },
          ]}
          className="mb-4"
        />
      )}

      {/* Sell on Market Card */}
      {(activeView === 'sell' && poolHasLiquidity) && (
        <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-800">Sell now</h4>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
              Market Order
            </span>
          </div>
          
          <div className="mb-4 bg-white rounded-lg border border-gray-200 relative">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
              <TokenInput
                token={projectToken}
                value={projectAmount}
                onValueChange={setProjectAmount}
                balance={projectTokenBalance?.value || null}
                label="Sell"
                disabled={disabled || isSwapLoading}
                className="flex-1"
              />
            </div>

            {/* Swap arrow - positioned to overlay */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* You receive amount - always show when sell tab is active */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-b-lg">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Buy</label>
                <input
                  type="text"
                  value={swapQuote?.amountOut || "0.0"}
                  readOnly
                  className="w-36 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800 pointer-events-none select-none"
                />
              </div>
              <div className="text-right pt-2">
                <div className="text-sm font-semibold text-gray-800">
                  {formatPrice(poolPriceInfo.tokensPerEth, 6, getNativeTokenDisplaySymbolMemo)}
                </div>
                <div className="text-xs text-gray-600">Current Price</div>
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
            <h4 className="text-base font-semibold text-gray-800">Sell at price</h4>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
              Single-sided
            </span>
          </div>

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

          {/* Pool Price Display */}
          {poolPriceInfo.tokensPerEth && (
            <PriceDisplay
              poolPriceInfo={poolPriceInfo}
              priceInfo={priceInfo}
              exitFloorPrice={exitFloorPrice}
              projectToken={projectToken}
              getNativeTokenDisplaySymbol={getNativeTokenDisplaySymbolMemo}
            />
          )}

          {/* Project token amount */}
          <div className="mb-4 bg-white rounded-lg border border-gray-200 relative">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
              <TokenInput
                token={projectToken}
                value={projectAmount}
                onValueChange={setProjectAmount}
                balance={projectTokenBalance?.value || null}
                label="Sell"
                disabled={disabled || isLoading}
                className="flex-1"
              />
            </div>

            {/* @ symbol separator */}
            <div className="flex justify-center -my-3 relative z-10">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Target price for single-sided liquidity */}
            {(!poolHasLiquidity || isSingleSided) && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-b-lg">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Price</label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="0.0"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-white select-none"
                    disabled={disabled || isLoading}
                  />
                </div>
                <div className="text-right pt-2">
                  <div className="text-sm font-semibold text-gray-800">
                    {formatPrice(poolPriceInfo.tokensPerEth, 6, "ETH")}
                  </div>
                  <div className="text-xs text-gray-600">Current Price</div>
                </div>
              </div>
            )}

            {/* Balance error message */}
            {getBalanceErrorMessage() && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                {getBalanceErrorMessage()}
              </div>
            )}
          </div>

          {/* Add liquidity button */}
          <Button
            variant="default"
            onClick={addLiquidity}
            disabled={disabled || isLoading || !hasSufficientBalance}
            className="w-full"
            loading={isLoading}
          >
            {isLoading ? "Order Processing..." : "Create Limit Order"}
          </Button>
        </div>
      )}

      {/* LP Card - Two-sided Liquidity */}
      {activeView === 'lp' && (
        <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-800">Provide liquidity</h4>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
              Two-sided
            </span>
          </div>

          {/* Pool Price Display */}
          {poolPriceInfo.tokensPerEth && (
            <PriceDisplay
              poolPriceInfo={poolPriceInfo}
              priceInfo={priceInfo}
              exitFloorPrice={exitFloorPrice}
              projectToken={projectToken}
              getNativeTokenDisplaySymbol={getNativeTokenDisplaySymbolMemo}
            />
          )}

          {/* Project token amount */}
          <div className="mb-4 bg-white rounded-lg border border-gray-200 relative">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
              <TokenInput
                token={projectToken}
                value={projectAmount}
                onValueChange={setProjectAmount}
                balance={projectTokenBalance?.value || null}
                label="Lock"
                disabled={disabled || isLoading}
                className="flex-1"
              />
            </div>

            {/* @ symbol separator */}
            <div className="flex justify-center -my-3 relative z-10">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Native token amount */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-b-lg">
              <TokenInput
                token={nativeToken}
                value={nativeAmount}
                onValueChange={setNativeAmount}
                balance={ethBalance?.value || null}
                label={`Lock ${getNativeTokenDisplaySymbol(nativeToken, nativeToken.chainId)}`}
                disabled={disabled || isLoading || isSingleSided}
                className="flex-1"
              />
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
          
        <PositionsList 
          projectToken={projectToken} 
          nativeToken={nativeToken} 
          activeView={activeView}
        />
    </div>
      )}
    </>
  );
} 
