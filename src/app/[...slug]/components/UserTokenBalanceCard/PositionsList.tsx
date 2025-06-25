import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Address, formatEther, parseEther } from "viem";
import { Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { JBChainId } from "juice-sdk-core";
import { 
  getPoolPositions, 
  collectFees, 
  removeLiquidity, 
  hasUnclaimedFees,
  calculateUnclaimedFees,
  formatTickRangeToPriceRange,
  tickToPrice,
  type UserPosition 
} from "@/lib/uniswap";
import { POSITION_MANAGER_ADDRESSES, UNISWAP_FEE_TIER } from "@/constants";

interface PositionsListProps {
  projectToken: Token;
  nativeToken: Token;
  activeView: 'sell' | 'limit' | 'lp';
}

export function PositionsList({ projectToken, nativeToken, activeView }: PositionsListProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const { toast } = useToast();
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [calculatedFees, setCalculatedFees] = useState<Map<string, { amount0: bigint; amount1: bigint }>>(new Map());
  const [totalPoolLiquidity, setTotalPoolLiquidity] = useState<bigint>(0n);

  const fetchTotalPoolLiquidity = async () => {
    if (!publicClient) return;

    try {
      const { computePoolAddressForTokens } = await import('@/lib/uniswap/pool');
      const poolAddress = computePoolAddressForTokens(projectToken, nativeToken, UNISWAP_FEE_TIER, projectToken.chainId);
      
      const liquidity = await publicClient.readContract({
        address: poolAddress,
        abi: [
          {
            inputs: [],
            name: 'liquidity',
            outputs: [{ name: '', type: 'uint128' }],
            stateMutability: 'view',
            type: 'function'
          }
        ],
        functionName: 'liquidity',
      });

      setTotalPoolLiquidity(BigInt(liquidity));
      console.log('🏊 Total pool liquidity:', liquidity.toString());
    } catch (error) {
      console.error('Error fetching total pool liquidity:', error);
      setTotalPoolLiquidity(0n);
    }
  };

  const fetchPositions = async () => {
    if (!address || !publicClient) return;

    try {
      setIsLoading(true);
      setError(null);
      
    console.log('🔍 Fetching positions with new helpers...');
    
    const poolPositions = await getPoolPositions({
      account: address,
      token0: projectToken,
      token1: nativeToken,
      fee: UNISWAP_FEE_TIER,
      publicClient
    });

    console.log('✅ Positions fetched:', poolPositions.length);
    
    // Debug: Log the tokensOwed values for each position
    poolPositions.forEach((position, index) => {
      console.log(`Position ${index + 1} (${position.tokenId.toString()}):`, {
        token0: position.token0,
        token1: position.token1,
        liquidity: position.liquidity.toString(),
        tokensOwed0: position.tokensOwed0.toString(),
        tokensOwed1: position.tokensOwed1.toString(),
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        fee: position.fee
      });
    });
    
    setPositions(poolPositions);
    
    // Fetch total pool liquidity
    await fetchTotalPoolLiquidity();
  } catch (error) {
    console.error('❌ Error fetching positions:', error);
    setError(error instanceof Error ? error.message : 'Failed to fetch positions');
  } finally {
    setIsLoading(false);
  }
};

  // Fetch positions on mount and when dependencies change
  useEffect(() => {
    fetchPositions();
  }, [address, publicClient, projectToken, nativeToken]);

  // Calculate fees when positions change
  useEffect(() => {
    if (positions.length > 0 && publicClient) {
      calculateFeesForPositions(positions);
    }
  }, [positions, publicClient, projectToken.chainId]);

  const calculateFeesForPositions = async (positions: UserPosition[]) => {
    if (!publicClient) return;

    const feesMap = new Map<string, { amount0: bigint; amount1: bigint }>();
    
    for (const position of positions) {
      try {
        const fees = await calculateUnclaimedFees({
          position,
          publicClient,
          chainId: projectToken.chainId,
          token0: projectToken,
          token1: nativeToken
        });
        
        feesMap.set(position.tokenId.toString(), fees);
        
        console.log(`💰 Calculated fees for position ${position.tokenId.toString()}:`, {
          tokensOwed0: position.tokensOwed0.toString(),
          tokensOwed1: position.tokensOwed1.toString(),
          calculatedAmount0: fees.amount0.toString(),
          calculatedAmount1: fees.amount1.toString(),
          isInRange: position.tickLower <= 0 && position.tickUpper >= 0 // Simplified range check
        });
      } catch (error) {
        console.error(`Error calculating fees for position ${position.tokenId.toString()}:`, error);
        // Use the raw tokensOwed values as fallback
        feesMap.set(position.tokenId.toString(), {
          amount0: position.tokensOwed0,
          amount1: position.tokensOwed1
        });
      }
    }
    
    setCalculatedFees(feesMap);
  };

  const handleCollectFees = async (position: UserPosition) => {
    if (!address || !walletClient?.data || !publicClient) return;

    const actionKey = `collect-${position.tokenId}`;
    setLoadingActions(prev => new Set(prev).add(actionKey));

    try {
      const positionManagerAddress = POSITION_MANAGER_ADDRESSES[projectToken.chainId];
      if (!positionManagerAddress) {
        throw new Error(`Position Manager not found for chain ${projectToken.chainId}`);
      }

      console.log('💰 Collecting fees for position:', position.tokenId.toString());

      const calculatedFee = calculatedFees.get(position.tokenId.toString());
      const result = await collectFees({
        tokenId: position.tokenId,
        recipient: address,
        amount0Max: calculatedFee?.amount0 || position.tokensOwed0,
        amount1Max: calculatedFee?.amount1 || position.tokensOwed1,
        walletClient: walletClient.data,
        publicClient: publicClient as any,
        account: address,
        positionManagerAddress,
        chainId: projectToken.chainId,
        unwrapWethToEth: true
      });

      const message = result.unwrapHash 
        ? `Fees collected and WETH unwrapped! Collect: ${result.collectHash.slice(0, 10)}... Unwrap: ${result.unwrapHash.slice(0, 10)}...`
        : `Fee collection completed! ${result.collectHash.slice(0, 10)}...`;

      toast({
        title: "Success",
        description: message
      });

      // Refresh positions after successful collection
      setTimeout(() => {
        fetchPositions();
        calculateFeesForPositions(positions);
      }, 2000);
    } catch (error) {
      console.error('❌ Error collecting fees:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to collect fees"
      });
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
    }
  };

  const handleRemoveLiquidity = async (position: UserPosition) => {
    if (!address || !walletClient?.data || !publicClient) return;

    const actionKey = `remove-${position.tokenId}`;
    setLoadingActions(prev => new Set(prev).add(actionKey));

    try {
      const positionManagerAddress = POSITION_MANAGER_ADDRESSES[projectToken.chainId];
      if (!positionManagerAddress) {
        throw new Error(`Position Manager not found for chain ${projectToken.chainId}`);
      }

      console.log(' Removing liquidity from position:', position.tokenId.toString());

      // For now, remove all liquidity (can be made configurable later)
      const result = await removeLiquidity({
        tokenId: position.tokenId,
        liquidity: position.liquidity,
        amount0Min: 0n,
        amount1Min: 0n,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20,
        recipient: address,
        walletClient: walletClient.data,
        account: address,
        positionManagerAddress,
        chainId: projectToken.chainId,
        unwrapWethToEth: true
      });

      toast({
        title: "Success",
        description: `Position closed! Decrease: ${result.decreaseHash.slice(0, 10)}... Collect: ${result.collectHash.slice(0, 10)}... Burn: ${result.burnHash.slice(0, 10)}...`
      });

      // Refresh positions after successful removal
      setTimeout(() => {
        fetchPositions();
        calculateFeesForPositions(positions);
      }, 2000);
    } catch (error) {
      console.error('❌ Error removing liquidity:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove liquidity"
      });
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
    }
  };

  const getTokenSymbol = (tokenAddress: Address): string => {
    if (tokenAddress.toLowerCase() === projectToken.address.toLowerCase()) {
      return projectToken.symbol || 'Unknown';
    }
    if (tokenAddress.toLowerCase() === nativeToken.address.toLowerCase()) {
      // Check if this is WETH and display as ETH in the UI
      const { WETH_ADDRESSES } = require('@/constants');
      const wethAddress = WETH_ADDRESSES[projectToken.chainId];
      
      if (wethAddress && tokenAddress.toLowerCase() === wethAddress.toLowerCase()) {
        return 'ETH';
      }
      
      return nativeToken.symbol || 'Unknown';
    }
    return 'Unknown';
  };

  const getLiquidityPercentage = (positionLiquidity: bigint): string => {
    if (totalPoolLiquidity === 0n) return '0.00%';
    
    const percentage = (Number(positionLiquidity) / Number(totalPoolLiquidity)) * 100;
    return percentage.toFixed(2) + '%';
  };

  if (isLoading) {
    return <div className="p-4">Loading positions...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-gray-500 mb-2">Error: {error}</div>
        <Button onClick={fetchPositions} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  if (positions.length === 0) {
    return <div className="p-4 text-gray-500">No positions found in this pool.</div>;
  }

  // Filter positions based on activeView
  const filteredPositions = positions.filter((position) => {
    // Detect if this is a single-sided position (limit order)
    const isSingleSided = (position.tickLower || 0) > 0 || (position.tickUpper || 0) < 0;
    
    if (activeView === 'limit') {
      return isSingleSided; // Only show single-sided positions for LIMIT tab
    } else if (activeView === 'lp') {
      return !isSingleSided; // Only show two-sided positions for LP tab
    }
    
    // For 'sell' view or other cases, show all positions
    return true;
  });

  if (filteredPositions.length === 0) {
    const positionType = activeView === 'limit' ? 'limit orders' : activeView === 'lp' ? 'liquidity positions' : 'positions';
    return <div className="p-4 text-gray-500">No {positionType} found in this pool.</div>;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-3">
        {filteredPositions.map((position) => {
          // Add defensive checks for position properties
          if (!position || typeof position.tokenId === 'undefined') {
            console.error('Invalid position data:', position);
            return null;
          }

          const token0Symbol = getTokenSymbol(position.token0);
          const token1Symbol = getTokenSymbol(position.token1);
          const calculatedFee = calculatedFees.get(position.tokenId.toString());
          const hasFees = calculatedFee ? (calculatedFee.amount0 > 0n || calculatedFee.amount1 > 0n) : hasUnclaimedFees(position);
          const isCollecting = loadingActions.has(`collect-${position.tokenId}`);
          const isRemoving = loadingActions.has(`remove-${position.tokenId}`);

          // Detect if this is a single-sided position (limit order)
          const isSingleSided = (position.tickLower || 0) > 0 || (position.tickUpper || 0) < 0;
          
          // For single-sided positions, show the price where the token is listed
          const getPositionDisplay = () => {
            try {
              if (isSingleSided) {
                // For single-sided, show the price where the token is listed for sale
                const price = tickToPrice(position.tickLower > 0 ? position.tickLower : position.tickUpper, projectToken.decimals, nativeToken.decimals);
                const token0IsProject = projectToken.address.toLowerCase() < nativeToken.address.toLowerCase();
                
                if (token0IsProject) {
                  // If project token is token0, price is tokens per native, so cost per token = 1/price
                  const costPerToken = 1 / price;
                  return `Limit Order: 1 ${projectToken.symbol} = ${costPerToken.toFixed(6)} ${getTokenSymbol(nativeToken.address as Address)}`;
                } else {
                  // If native token is token0, price is native per token
                  return `Limit Order: 1 ${projectToken.symbol} = ${price.toFixed(6)} ${getTokenSymbol(nativeToken.address as Address)}`;
                }
              } else {
                // For two-sided positions, show the range
                return formatTickRangeToPriceRange(
                  position.tickLower, 
                  position.tickUpper, 
                  projectToken, 
                  nativeToken,
                  'tokensPerNative',
                  getTokenSymbol
                );
              }
            } catch (error) {
              console.error('Error in getPositionDisplay:', error);
              return `Position ${position.tokenId.toString()}`;
            }
          };

          return (
            <div key={position.tokenId.toString()} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Position #{position.tokenId.toString()}
                    </h3>
                    {isSingleSided && (
                      <span className="inline-block text-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 leading-tight">
                        Limit Order
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{getTokenSymbol(position.token0)}/{getTokenSymbol(position.token1)}</span>
                    <span className="text-gray-400">•</span>
                    <span>Fee: {position.fee / 10000}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {getLiquidityPercentage(position.liquidity)}
                  </div>
                  <div className="text-xs text-gray-500">Pool Share</div>
                </div>
              </div>

              {/* Position Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-700 font-medium mb-1">Position Range</div>
                <div className="text-sm text-gray-600">
                  {getPositionDisplay()}
                </div>
              </div>

              {/* Fees Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      {getTokenSymbol(position.token0)} Owed
                    </span>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {calculatedFee ? formatEther(calculatedFee.amount0) : formatEther(position.tokensOwed0)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      {getTokenSymbol(position.token1)} Owed
                    </span>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {calculatedFee ? formatEther(calculatedFee.amount1) : formatEther(position.tokensOwed1)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {hasFees && (
                  <ButtonWithWallet
                    targetChainId={projectToken.chainId as JBChainId}
                    onClick={() => handleCollectFees(position)}
                    disabled={isCollecting || isRemoving}
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
                  >
                    {isCollecting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        Collecting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Collect Fees
                      </div>
                    )}
                  </ButtonWithWallet>
                )}
                <ButtonWithWallet
                  targetChainId={projectToken.chainId as JBChainId}
                  onClick={() => handleRemoveLiquidity(position)}
                  disabled={isCollecting || isRemoving}
                  size="sm"
                  variant="secondary"
                  className="flex-1 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
                >
                  {isRemoving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      Closing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Close Position
                    </div>
                  )}
                </ButtonWithWallet>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 