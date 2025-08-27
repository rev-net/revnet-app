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
  useJBContractContext,
  useJBChainId,
} from "juice-sdk-react";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { Token } from "@uniswap/sdk-core";
import { parseEther } from "viem";
import { FixedInt } from "fpnum";
import { AddLiquidity } from "./AddLiquidity";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { toast } from "@/components/ui/use-toast";

// Import our new utilities and hooks
import { useUniswapPool } from "@/hooks/useUniswapPool";
import { useUniswapPrice } from "@/hooks/useUniswapPrice";
import { PoolStatus } from "@/components/uniswap/PoolStatus";
import { PriceDisplay } from "@/components/uniswap/PriceDisplay";
import { UNISWAP_CONSTANTS, UNISWAP_ABIS } from "@/lib/uniswap";
import { UNISWAP_V3_FACTORY_ADDRESSES, WETH_ADDRESSES } from "@/constants";
import { FeeAmount } from "@uniswap/v3-sdk";

export function SellOnMarket({
  tokenSymbol,
  disabled,
  children,
}: PropsWithChildren<{
  tokenSymbol: string;
  disabled?: boolean;
}>) {
  const { address } = useAccount();
  const { data: balances } = useSuckersUserTokenBalance();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { token } = useJBTokenContext();
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();
  const [sellChainId, setSellChainId] = useState<string>();
  const [initialPrice, setInitialPrice] = useState<number | null>(null);
  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;

  // Create token instances once when chain is selected
  const tokens = useMemo(() => {
    if (!sellChainId || !token?.data) return null;

    const chainIdNum = Number(sellChainId);
    const isEthChain = NATIVE_TOKEN === "0x000000000000000000000000000000000000EEEe";

    if (isEthChain) {
      // For ETH chains, use WETH for Uniswap V3 pools
      const wethAddress = WETH_ADDRESSES[chainIdNum];
      if (!wethAddress || wethAddress === "0x0000000000000000000000000000000000000000") {
        console.warn(`WETH address not available for chain ${sellChainId}`);
        return null;
      }

      return {
        projectToken: new Token(
          chainIdNum,
          token.data.address as `0x${string}`,
          token.data.decimals,
          tokenSymbol,
          tokenSymbol
        ),
        nativeToken: new Token(
          chainIdNum,
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
          chainIdNum,
          token.data.address as `0x${string}`,
          token.data.decimals,
          tokenSymbol,
          tokenSymbol
        ),
        nativeToken: new Token(
          chainIdNum,
          NATIVE_TOKEN as `0x${string}`,
          18,
          "ETH",
          "Ether"
        )
      };
    }
  }, [sellChainId, token?.data, tokenSymbol]);

  // Use our new hooks for pool and price management
  const {
    poolAddress,
    poolState,
    isLoading: poolLoading,
    error: poolError,
    createPool,
    initializePool,
    refetch: refetchPool
  } = useUniswapPool({
    tokenA: (tokens?.projectToken.address || "0x0000000000000000000000000000000000000000") as Address,
    tokenB: (tokens?.nativeToken.address || "0x0000000000000000000000000000000000000000") as Address,
    fee: UNISWAP_CONSTANTS.FEE_TIERS.HIGH,
    chainId: Number(sellChainId) || 0
  });

  const {
    currentPrice,
    isLoading: priceLoading,
    error: priceError,
    refetch: refetchPrice
  } = useUniswapPrice({
    poolAddress,
    token0Address: (tokens?.projectToken.address || "0x0000000000000000000000000000000000000000") as Address,
    token1Address: (tokens?.nativeToken.address || "0x0000000000000000000000000000000000000000") as Address
  });

  // Calculate issuance price
  useEffect(() => {
    if (!ruleset?.data || !rulesetMetadata?.data) return;

    try {
      const oneEth = new FixedInt(parseEther("1"), 18);
      const amountAQuote = getTokenBtoAQuote(
        oneEth,
        token?.data?.decimals || 18,
        {
          weight: ruleset.data.weight,
          reservedPercent: rulesetMetadata.data.reservedPercent,
        }
      );

      const tokensPerEth = Number(amountAQuote.format());
      const correctedTokensPerEth = tokensPerEth < 1 ? 1 / tokensPerEth : tokensPerEth;

      setInitialPrice(correctedTokensPerEth);
    } catch (error) {
      console.error("Error calculating issuance price:", error);
    }
  }, [ruleset?.data, rulesetMetadata?.data, token?.data?.decimals]);

  // Handle pool creation
  const handleCreatePool = async () => {
    try {
      await createPool();
      toast({
        title: "Pool Created",
        description: "Uniswap V3 pool has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create pool. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle pool initialization
  const handleInitializePool = async () => {
    if (!initialPrice) {
      toast({
        title: "Error",
        description: "Initial price not available.",
        variant: "destructive",
      });
      return;
    }

    try {
      await initializePool(initialPrice);
      toast({
        title: "Pool Initialized",
        description: "Pool has been initialized with the initial price.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize pool. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sell {tokenSymbol} on Market</DialogTitle>
          <DialogDescription>
            Trade your {tokenSymbol} tokens on Uniswap V3
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chain Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Chain</label>
            <Select value={sellChainId} onValueChange={setSellChainId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a chain" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(JB_CHAINS).map(([id, chain]) => (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center gap-2">
                      <ChainLogo chainId={Number(id) as JBChainId} />
                      {chain.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pool Status */}
          {sellChainId && tokens && (
            <PoolStatus
              poolState={poolState}
              chainId={Number(sellChainId)}
              onCreatePool={handleCreatePool}
              onInitializePool={handleInitializePool}
              isLoading={poolLoading}
            />
          )}



          {/* Trading Interface */}
          {sellChainId && tokens && poolState.exists && poolState.hasInitialPrice && poolAddress && (
            <AddLiquidity
              poolAddress={poolAddress}
              projectToken={tokens.projectToken}
              nativeToken={tokens.nativeToken}
              disabled={disabled}
            />
          )}

          {/* Error Display */}
          {(poolError || priceError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {poolError || priceError}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
