import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JB_CHAINS,
  NATIVE_TOKEN,
  getTokenBtoAQuote,
  JBProjectToken,
} from "juice-sdk-core";
import {
  JBChainId,
  useSuckersUserTokenBalance,
  useJBRulesetContext,
  useSuckers,
  useJBTokenContext,
} from "juice-sdk-react";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Address, parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient, useChainId, useSwitchChain } from "wagmi";
import { Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import { UNISWAP_V3_FACTORY_ADDRESSES, WETH_ADDRESSES } from "@/constants";
import { FixedInt } from "fpnum";
import { AddLiquidity } from "./AddLiquidity";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { useToast } from "@/components/ui/use-toast";
import { 
  createPoolAndMintFirstPosition,
  getPoolInfo,
  calculateSqrtPriceX96,
  checkPoolHasPositions,
} from "@/lib/uniswap";
import { Button } from "@/components/ui/button";

export function SellOnMarket({
  tokenSymbol,
  disabled,
  children,
}: PropsWithChildren<{
  tokenSymbol: string;
  disabled?: boolean;
}>) {
  const { address } = useAccount();
  const walletClient = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();
  const { token } = useJBTokenContext();
  const { data: balances } = useSuckersUserTokenBalance();
  const { data: suckers } = useSuckers();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const nativeTokenSymbol = useNativeTokenSymbol();

  // State
  const [sellChainId, setSellChainId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [initialPrice, setInitialPrice] = useState<number | null>(null);
  const [poolHasPositions, setPoolHasPositions] = useState<boolean>(false);
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);

  // Add these hooks for chain switching
  const userChainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Get the correct factory address for the selected chain
  const factoryAddress = useMemo(() => {
    if (!sellChainId) return null;
    const address = UNISWAP_V3_FACTORY_ADDRESSES[Number(sellChainId)];
    return address ? (address as `0x${string}`) : null;
  }, [sellChainId]);

  // Create token instances once when chain is selected
  const tokens = useMemo(() => {
    if (!sellChainId || !token?.data) return null;

    const chainId = Number(sellChainId);
    
    // Check if the native token from JB is ETH
    const isEthChain = NATIVE_TOKEN === '0x000000000000000000000000000000000000EEEe';
    
    if (isEthChain) {
      // For ETH chains, use WETH for Uniswap V3 pools
      const wethAddress = WETH_ADDRESSES[chainId];
      if (!wethAddress || wethAddress === '0x0000000000000000000000000000000000000000') {
        console.warn(`WETH address not available for chain ${sellChainId}`);
        return null;
      }

      return {
        projectToken: new Token(
          chainId,
          token.data.address as `0x${string}`,
          token.data.decimals,
          tokenSymbol,
          tokenSymbol
        ),
        nativeToken: new Token(
          chainId,
          wethAddress,
          18,
          "WETH",
          "Wrapped Ether"
        )
      };
    } else {
      // For non-ETH chains, use the native token directly
      return {
        projectToken: new Token(
          chainId,
          token.data.address as `0x${string}`,
          token.data.decimals,
          tokenSymbol,
          tokenSymbol
        ),
        nativeToken: new Token(
          chainId,
          NATIVE_TOKEN as `0x${string}`,
          18,
          "NATIVE",
          "Native Token"
        )
      };
    }
  }, [sellChainId, token?.data, tokenSymbol]);

  // Get issuance price from Juicebox
  useEffect(() => {
    const getIssuancePrice = async () => {
      if (!ruleset?.data || !rulesetMetadata?.data) return;

    try {
        const quote = await getTokenBtoAQuote(
          new FixedInt(parseEther("1"), 18),
          18,
        {
          weight: ruleset.data.weight,
          reservedPercent: rulesetMetadata.data.reservedPercent,
        }
      );
        const issuancePrice = Number(quote.value) / 1e18;
        setInitialPrice(issuancePrice);
    } catch (error) {
        console.error('Error getting issuance price:', error);
    }
    };

    getIssuancePrice();
  }, [ruleset?.data, rulesetMetadata?.data]);

  // Refresh pool positions status
  const refreshPoolPositions = async () => {
    if (!tokens || !publicClient) return;
    
    setIsRefreshingPrice(true);
    try {
      if (poolInfo?.exists) {
        const hasPositions = await checkPoolHasPositions({
          token0: tokens.projectToken,
          token1: tokens.nativeToken,
          fee: FeeAmount.HIGH,
          publicClient
        });
        setPoolHasPositions(hasPositions);
      } else {
        setPoolHasPositions(false);
      }
    } finally {
      setIsRefreshingPrice(false);
    }
  };

  // Fetch pool info when chain or tokens change
  useEffect(() => {
    const fetchPoolInfo = async () => {
      if (!tokens || !publicClient) {
        setPoolInfo(null);
        return;
      }
      try {
        console.log('🔍 Fetching pool info with helper...');
        const info = await getPoolInfo(
          tokens.projectToken,
          tokens.nativeToken,
          FeeAmount.HIGH,
          publicClient
        );
        console.log('✅ Pool info fetched:', info);
        setPoolInfo(info);
        
        // Check if pool has positions
        if (info.exists) {
          const hasPositions = await checkPoolHasPositions({
            token0: tokens.projectToken,
            token1: tokens.nativeToken,
            fee: FeeAmount.HIGH,
            publicClient
          });
          setPoolHasPositions(hasPositions);
        } else {
          setPoolHasPositions(false);
        }
      } catch (err) {
        console.log('❌ Pool info fetch failed:', err);
        setPoolInfo(null);
      }
    };
    fetchPoolInfo();
  }, [tokens, publicClient]);

  // Check if user needs to switch chains
  const needsChainSwitch = sellChainId && userChainId !== Number(sellChainId);

  const createPool = async () => {
    if (!address || !walletClient?.data || !publicClient || !tokens) return;

    try {
      setIsLoading(true);
      
      console.log('🏗️ Creating pool with high-level helper...');
      console.log('📊 Pool creation parameters:', {
        token0: tokens.projectToken.symbol,
        token1: tokens.nativeToken.symbol,
        chainId: tokens.projectToken.chainId,
        initialPrice
      });

      // Use fixed amounts for initial pool creation
      const projectTokenAmount = "1";
      const nativeTokenAmount = initialPrice ? (1 * initialPrice).toFixed(6) : "0.001";

      // Determine token order and amounts
      const [token0, token1] = tokens.projectToken.address.toLowerCase() < tokens.nativeToken.address.toLowerCase() 
        ? [tokens.projectToken, tokens.nativeToken] 
        : [tokens.nativeToken, tokens.projectToken];

      const [amount0, amount1] = tokens.projectToken.address.toLowerCase() < tokens.nativeToken.address.toLowerCase()
        ? [parseEther(projectTokenAmount), parseEther(nativeTokenAmount)]
        : [parseEther(nativeTokenAmount), parseEther(projectTokenAmount)];

      console.log('🔄 Token order and amounts:', {
        token0: { symbol: token0.symbol, amount: amount0.toString() },
        token1: { symbol: token1.symbol, amount: amount1.toString() },
        isToken0First: tokens.projectToken.address.toLowerCase() < tokens.nativeToken.address.toLowerCase()
      });
      
      // Use the high-level helper for pool creation and first position
      const result = await createPoolAndMintFirstPosition({
        token0,
        token1,
        fee: FeeAmount.HIGH,
        amount0,
        amount1,
        initialPrice: calculateSqrtPriceX96(initialPrice || 1), // Use issuance price or default to 1
        recipient: address,
        walletClient: walletClient.data,
        publicClient,
        account: address
      });

      console.log('✅ Pool operation completed successfully:', {
        poolAddress: result.poolAddress,
        positionHash: result.positionHash,
        isNewPool: result.isNewPool
      });

      // Refresh pool info
      const newPoolInfo = await getPoolInfo(token0, token1, FeeAmount.HIGH, publicClient);
      setPoolInfo(newPoolInfo);

      // Refresh pool positions status
      await refreshPoolPositions();

      toast({
        title: "Success",
        description: result.isNewPool ? "Pool created and liquidity added" : "Liquidity added to existing pool"
      });

    } catch (error) {
      console.error('❌ Pool creation failed:', error);
      toast({
        variant: "destructive",
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create pool"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sell {tokenSymbol} on Market</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Chain
            </label>
            <Select
              value={sellChainId}
              onValueChange={setSellChainId}
              disabled={disabled || isSwitchingChain}
            >
              <SelectTrigger>
                <SelectValue placeholder={isSwitchingChain ? "Switching chain..." : "Select a chain"} />
              </SelectTrigger>
              <SelectContent>
                {suckers?.map((sucker) => (
                  <SelectItem key={sucker.peerChainId} value={sucker.peerChainId}>
                    <div className="flex items-center space-x-2">
                      <ChainLogo chainId={sucker.peerChainId as JBChainId} />
                      <span>{JB_CHAINS[sucker.peerChainId as JBChainId].name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSwitchingChain && (
              <p className="text-xs text-blue-600 mt-1">
                 Switching to {sellChainId ? JB_CHAINS[Number(sellChainId) as JBChainId].name : ''}...
              </p>
            )}
          </div>

          {/* Balance Information - Show always */}
          <div className="p-4 border rounded-lg bg-zinc-50">
            <div className="text-sm">
              <p className="font-medium mb-2">Your {tokenSymbol} balance:</p>
              {balances?.map((balance, index) => (
                <div key={index} className="flex justify-between gap-2 mt-1">
                  <span>{JB_CHAINS[balance.chainId as JBChainId].name}</span>
                  <span className="font-medium">
                    {balance.balance?.format(6)} {tokenSymbol}
                  </span>
                </div>
              ))}
              <hr className="my-2" />
              <div className="flex justify-between gap-2">
                <span>[All chains]</span>
                <span className="font-medium">
                  {new JBProjectToken(
                    balances?.reduce((acc, curr) => acc + curr.balance.value, 0n) ?? 0n
                  ).format(6)} {tokenSymbol}
                </span>
              </div>
            </div>
          </div>

          {sellChainId && (
            <>
              {/* Chain Switch Required */}
              {needsChainSwitch && (
                <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                  <div className="text-center">
                    <p className="font-medium text-amber-800 mb-3">
                      Switch to {JB_CHAINS[Number(sellChainId) as JBChainId].name} to continue
                    </p>
                    <Button
                      onClick={() => switchChain({ chainId: Number(sellChainId) as JBChainId })}
                      disabled={isSwitchingChain}
                      className="w-full"
                    >
                      {isSwitchingChain ? "Switching..." : "Switch Chain"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Pool Operations - Only show when on correct chain */}
              {!needsChainSwitch && (
                <>
                  {/* Add Liquidity Section - Only show if pool exists */}
                  {poolInfo?.exists && (
                    <div className="p-4 border rounded-lg bg-zinc-50">
                      <AddLiquidity
                        poolAddress={poolInfo.poolAddress}
                        projectToken={tokens!.projectToken}
                        nativeToken={tokens!.nativeToken}
                        disabled={isLoading}
                        onLiquidityAdded={refreshPoolPositions}
                      />
                    </div>
                  )}

                  {/* Pool Status - Prominent display */}
                  <div className="p-4 border rounded-lg bg-zinc-50">
                    {!factoryAddress ? (
                      <div className="text-center">
                        <p className="font-medium text-red-600">
                          Uniswap V3 is not supported on {JB_CHAINS[Number(sellChainId) as JBChainId].name}
                        </p>
                      </div>
                    ) : poolInfo?.exists ? (
                      <div className="text-center">
                        <p className="text-xs text-zinc-600 break-all">
                          {poolInfo.poolAddress}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="font-bold text-lg text-amber-600 mb-2">
                          No market exists for {tokenSymbol} on {JB_CHAINS[Number(sellChainId) as JBChainId].name}
                        </p>
                        <ButtonWithWallet
                          targetChainId={Number(sellChainId) as JBChainId}
                          onClick={createPool}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? 'Creating Pool...' : 'Create Pool'}
                        </ButtonWithWallet>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 