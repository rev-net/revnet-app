import { useState } from "react";
import { Address, parseEther } from "viem";
import { Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import { PublicClient, WalletClient } from "viem";
import { completeLiquidityProvision } from "@/lib/uniswap";
import { calculateInitialSqrtPrice, isValidPrice } from "@/lib/uniswap/priceCalculations";
import { useToast } from "@/components/ui/use-toast";

interface UseLiquidityProvisionProps {
  projectToken: Token;
  nativeToken: Token;
  projectAmount: string;
  nativeAmount: string;
  targetPrice: string;
  isSingleSided: boolean;
  address: Address;
  walletClient: WalletClient | null;
  publicClient: PublicClient | null | undefined;
  onLiquidityAdded?: () => void;
}

export const useLiquidityProvision = ({
  projectToken,
  nativeToken,
  projectAmount,
  nativeAmount,
  targetPrice,
  isSingleSided,
  address,
  walletClient,
  publicClient,
  onLiquidityAdded,
}: UseLiquidityProvisionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addLiquidity = async () => {
    if (!address || !walletClient || !publicClient) return;

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
    if (isSingleSided && !isValidPrice(targetPrice)) {
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

      // Check user's token balances before attempting liquidity provision
      const projectTokenBalance = await publicClient.readContract({
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

      if (projectTokenBalance < projectAmountWei) {
        const userBalanceFormatted = (Number(projectTokenBalance) / Math.pow(10, projectToken.decimals)).toFixed(6);
        toast({
          variant: "destructive",
          title: "Insufficient Balance",
          description: `You only have ${userBalanceFormatted} ${projectToken.symbol}`
        });
        return;
      }

      // For two-sided liquidity, also check native token balance
      if (!isSingleSided) {
        const nativeTokenBalance = await publicClient.readContract({
          address: nativeToken.address as Address,
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

        if (nativeTokenBalance < nativeAmountWei) {
          const userBalanceFormatted = (Number(nativeTokenBalance) / Math.pow(10, nativeToken.decimals)).toFixed(6);
          toast({
            variant: "destructive",
            title: "Insufficient Balance",
            description: `You only have ${userBalanceFormatted} ${nativeToken.symbol}`
          });
          return;
        }
      }

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
        initialPrice = calculateInitialSqrtPrice(targetPrice);
      }
        
      // Use the comprehensive helper for all liquidity provision
      const result = await completeLiquidityProvision({
        token0,
        token1,
        fee: FeeAmount.HIGH,
        amount0,
        amount1,
        recipient: address,
        walletClient: walletClient as any,
        publicClient,
        account: address,
        useSingleSided: isSingleSided,
        initialPrice
      });

      toast({
        title: "Success",
        description: isSingleSided ? "Limit order created successfully" : "Liquidity added successfully"
      });

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

  return {
    isLoading,
    addLiquidity,
  };
}; 