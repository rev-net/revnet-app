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
  formatTickRangeToPriceRange,
  tickToPrice,
  type UserPosition 
} from "@/lib/uniswap";
import { POSITION_MANAGER_ADDRESSES } from "@/constants";

interface PositionsListProps {
  projectToken: Token;
  nativeToken: Token;
}

export function PositionsList({ projectToken, nativeToken }: PositionsListProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const { toast } = useToast();
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

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
      fee: FeeAmount.HIGH,
      publicClient
    });

    console.log('✅ Positions fetched:', poolPositions.length);
      setPositions(poolPositions);
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

      const result = await collectFees({
        tokenId: position.tokenId,
        recipient: address,
        amount0Max: position.tokensOwed0,
        amount1Max: position.tokensOwed1,
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
      setTimeout(fetchPositions, 2000);
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
      setTimeout(fetchPositions, 2000);
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
      return nativeToken.symbol || 'Unknown';
    }
    return 'Unknown';
  };

  if (isLoading) {
    return <div className="p-4">Loading positions...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">Error: {error}</div>
        <Button onClick={fetchPositions} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  if (positions.length === 0) {
    return <div className="p-4 text-gray-500">No positions found in this pool.</div>;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-3">
        {positions.map((position) => {
          // Add defensive checks for position properties
          if (!position || typeof position.tokenId === 'undefined') {
            console.error('Invalid position data:', position);
            return null;
          }

          const token0Symbol = getTokenSymbol(position.token0);
          const token1Symbol = getTokenSymbol(position.token1);
          const hasFees = hasUnclaimedFees(position);
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
                  return `Limit Order: 1 ${projectToken.symbol} = ${costPerToken.toFixed(6)} ${nativeToken.symbol}`;
                } else {
                  // If native token is token0, price is native per token
                  return `Limit Order: 1 ${projectToken.symbol} = ${price.toFixed(6)} ${nativeToken.symbol}`;
                }
              } else {
                // For two-sided positions, show the range
                return formatTickRangeToPriceRange(
                  position.tickLower, 
                  position.tickUpper, 
                  projectToken, 
                  nativeToken,
                  'tokensPerNative'
                );
              }
            } catch (error) {
              console.error('Error in getPositionDisplay:', error);
              return `Position ${position.tokenId.toString()}`;
            }
          };

          return (
          <div key={position.tokenId.toString()} className="p-4 border rounded-lg bg-zinc-50">
              <div className="flex justify-between items-start mb-3">
              <div>
                  <p className="text-sm font-medium">Position #{position.tokenId.toString()}</p>
                  <p className="text-xs text-gray-600">
                    {token0Symbol}/{token1Symbol} • Fee: {position.fee / 10000}%
                    {isSingleSided && <span className="ml-2 text-blue-600">(Limit Order)</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                  Liquidity: {formatEther(position.liquidity)}
                </p>
                  <p className="text-xs text-gray-600">
                    {getPositionDisplay()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-600">{token0Symbol} Owed:</p>
                  <p className="text-sm font-medium">
                    {formatEther(position.tokensOwed0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{token1Symbol} Owed:</p>
                  <p className="text-sm font-medium">
                    {formatEther(position.tokensOwed1)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {hasFees && (
                  <ButtonWithWallet
                    targetChainId={projectToken.chainId as JBChainId}
                    onClick={() => handleCollectFees(position)}
                    disabled={isCollecting || isRemoving}
                    size="sm"
                    variant="outline"
                  >
                    {isCollecting ? 'Collecting...' : 'Collect Fees'}
                  </ButtonWithWallet>
                )}
                <ButtonWithWallet
                  targetChainId={projectToken.chainId as JBChainId}
                  onClick={() => handleRemoveLiquidity(position)}
                  disabled={isCollecting || isRemoving}
                  size="sm"
                  variant="secondary"
                >
                  {isRemoving ? 'Closing Position...' : 'Close Position'}
                </ButtonWithWallet>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 