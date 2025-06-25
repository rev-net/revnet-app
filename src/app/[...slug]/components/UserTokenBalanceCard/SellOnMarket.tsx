import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
import {
  Dialog,
  DialogContent,
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
} from "juice-sdk-core";
import {
  JBChainId,
  useSuckersUserTokenBalance,
  useJBRulesetContext,
  useSuckers,
  useJBTokenContext,
} from "juice-sdk-react";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient, useChainId, useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import { UNISWAP_V3_FACTORY_ADDRESSES, WETH_ADDRESSES, UNISWAP_FEE_TIER } from "@/constants";
import { FixedInt } from "fpnum";
import { AddLiquidity } from "./AddLiquidity";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { useToast } from "@/components/ui/use-toast";
import { 
  createPoolAndMintFirstPosition,
  getPoolInfo,
  calculateSqrtPriceX96,
  checkPoolHasPositions,
  createPoolAndMintFirstPositionWithAmounts,
  createPoolParamsWithTokenBPrice,
} from "@/lib/uniswap";
import { Button } from "@/components/ui/button";
import EtherscanLink from "@/components/EtherscanLink";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjectTokens } from "@/hooks/useTokenA";
import { useProjectSuckers } from "@/graphql/useBendystrawQuery";
import { useTokenBPrice } from "@/hooks/useTokenBPrice";

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
  const { data: suckers } = useSuckers();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const tokenBPrice = useTokenBPrice();

  console.log('🔍 SellOnMarket tokenBPrice debug:', {
    tokenBPrice,
    tokenBPriceType: typeof tokenBPrice,
    tokenBPriceString: tokenBPrice?.toString(),
    isUndefined: tokenBPrice === undefined,
    isNull: tokenBPrice === null
  });

  // State
  const [sellChainId, setSellChainId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [projectTokenAmount, setProjectTokenAmount] = useState("1");
  const [nativeTokenAmount, setNativeTokenAmount] = useState("0.0002");
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
    
    // For Uniswap V3, use WETH if available, otherwise use the native token directly
    const wethAddress = WETH_ADDRESSES[chainId];
    const hasWeth = wethAddress && wethAddress !== '0x0000000000000000000000000000000000000000';
    
    const nativeTokenAddress = hasWeth ? wethAddress : NATIVE_TOKEN as `0x${string}`;
    const nativeTokenSymbol = hasWeth ? "WETH" : "ETH";
    const nativeTokenName = hasWeth ? "Wrapped Ether" : "Ether";

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
        nativeTokenAddress,
        18,
        nativeTokenSymbol,
        nativeTokenName
      )
    };
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
        
        // Set the correct amounts for initial liquidity
        // $AMM2 Amount: 1 token
        setProjectTokenAmount("1");
        
        // WETH Amount: 0.0002 ETH (based on your requirement)
        setNativeTokenAmount("0.0002");
        
        console.log('💰 Set initial liquidity amounts:', {
          projectTokenAmount: "1",
          nativeTokenAmount: "0.0002",
          issuancePrice: Number(quote.value) / 1e18
        });
      } catch (error) {
        console.error('Error getting issuance price:', error);
        // Fallback to default values
        setProjectTokenAmount("1");
        setNativeTokenAmount("0.0002");
      }
    };

    getIssuancePrice();
  }, [ruleset?.data, rulesetMetadata?.data]);

  // Refresh pool positions
  const refreshPoolPositions = async () => {
    if (!tokens || !publicClient) return;
    
    setIsRefreshingPrice(true);
    try {
      if (poolInfo?.exists) {
        const hasPositions = await checkPoolHasPositions({
          token0: tokens.projectToken,
          token1: tokens.nativeToken,
          fee: UNISWAP_FEE_TIER,
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
          UNISWAP_FEE_TIER,
          publicClient
        );
        console.log('✅ Pool info fetched:', info);
        setPoolInfo(info);
        
        // Check if pool has positions
        if (info.exists) {
          const hasPositions = await checkPoolHasPositions({
            token0: tokens.projectToken,
            token1: tokens.nativeToken,
            fee: UNISWAP_FEE_TIER,
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
      
      console.log('🏗️ Creating pool with JB token B price...');
      console.log('📊 Pool creation parameters:', {
        token0: tokens.projectToken.symbol,
        token1: tokens.nativeToken.symbol,
        chainId: tokens.projectToken.chainId,
        projectTokenAmount,
        nativeTokenAmount,
        tokenBPrice: tokenBPrice?.toString() || 'undefined',
        tokenBPriceType: typeof tokenBPrice
      });

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
      
      // Use JB token B price for pool initialization
      console.log('🔧 Creating pool params with tokenBPrice:', {
        tokenBPrice,
        tokenBPriceType: typeof tokenBPrice,
        willUseDefault: !tokenBPrice
      });

      const params = createPoolParamsWithTokenBPrice({
        token0,
        token1,
        fee: UNISWAP_FEE_TIER,
        amount0,
        amount1,
        recipient: address,
        walletClient: walletClient.data,
        publicClient,
        account: address
      }, tokenBPrice || 1n);
      
      console.log('✅ Pool params created:', {
        hasTokenBPrice: !!params.tokenBPrice,
        tokenBPriceValue: params.tokenBPrice?.toString()
      });

      const result = await createPoolAndMintFirstPositionWithAmounts(params);

      console.log('✅ Pool operation completed successfully:', {
        poolAddress: result.poolAddress,
        positionHash: result.positionHash,
        isNewPool: result.isNewPool
      });

      // Refresh pool info
      const newPoolInfo = await getPoolInfo(token0, token1, UNISWAP_FEE_TIER, publicClient);
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
    <Dialog open={disabled === true ? false : undefined}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trade {tokenSymbol}</DialogTitle>
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
              <p className="text-xs text-gray-600 mt-1">
                 Switching to {sellChainId ? JB_CHAINS[Number(sellChainId) as JBChainId].name : ''}...
              </p>
            )}
          </div>

          {/* Balance Information - Show always */}
          {/* Removed this section */}

          {sellChainId && (
            <>
              {/* Chain Switch Required */}
              {needsChainSwitch && (
                <div className="p-4 border rounded-lg bg-gray-50 border-gray-200">
                  <div className="text-center">
                    <p className="font-medium text-gray-800 mb-3">
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
                    <p className="text-sm text-muted-foreground">
                      Uniswap Pool:{" "}
                      <EtherscanLink 
                        value={poolInfo.poolAddress} 
                        type="address"
                        truncateTo={8}
                      />
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="font-bold text-lg text-gray-600 mb-2">
                        No market exists for {tokenSymbol} on {JB_CHAINS[Number(sellChainId) as JBChainId].name}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Create the initial liquidity pool by providing token amounts
                      </p>
                    </div>
                    
                    {/* Token Amount Inputs */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="projectTokenAmount">
                          {tokens?.projectToken.symbol} Amount
                        </Label>
                        <Input
                          id="projectTokenAmount"
                          type="number"
                          value={projectTokenAmount}
                          onChange={(e) => setProjectTokenAmount(e.target.value)}
                          placeholder="1.0"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="nativeTokenAmount">
                          {tokens?.nativeToken.symbol} Amount
                        </Label>
                        <Input
                          id="nativeTokenAmount"
                          type="number"
                          value={nativeTokenAmount}
                          onChange={(e) => setNativeTokenAmount(e.target.value)}
                          placeholder="0.001"
                          min="0"
                          step="0.000001"
                        />
                      </div>
                    </div>
                    
                    <ButtonWithWallet
                      targetChainId={Number(sellChainId) as JBChainId}
                      onClick={createPool}
                      disabled={isLoading || !projectTokenAmount || !nativeTokenAmount}
                      className="w-full"
                    >
                      {isLoading ? 'Creating Market...' : 'Create Market'}
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