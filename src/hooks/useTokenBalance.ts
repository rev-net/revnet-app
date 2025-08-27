import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { Address } from "viem";
import { UNISWAP_ABIS } from "@/lib/uniswap";
import { formatPriceForDisplay } from "@/lib/price";

interface UseTokenBalanceParams {
  tokenAddress: Address;
  userAddress: Address | undefined;
  decimals: number;
}

interface UseTokenBalanceReturn {
  balance: bigint;
  formattedBalance: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTokenBalance({
  tokenAddress,
  userAddress,
  decimals
}: UseTokenBalanceParams): UseTokenBalanceReturn {
  const publicClient = usePublicClient();
  
  const [balance, setBalance] = useState<bigint>(0n);
  const [formattedBalance, setFormattedBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch token balance
  const fetchBalance = useCallback(async () => {
    if (!publicClient || !userAddress) {
      setError("Public client or user address not available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const balanceValue = await publicClient.readContract({
        address: tokenAddress,
        abi: UNISWAP_ABIS.ERC20,
        functionName: "balanceOf",
        args: [userAddress]
      }) as bigint;

      setBalance(balanceValue);
      
      // Format balance for display
      const balanceFloat = Number(balanceValue) / 10 ** decimals;
      const formatted = formatPriceForDisplay(balanceFloat, decimals);
      setFormattedBalance(formatted);

    } catch (err) {
      console.error("Error fetching token balance:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch token balance");
      setBalance(0n);
      setFormattedBalance("0");
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, userAddress, tokenAddress, decimals]);

  // Refetch balance
  const refetch = useCallback(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Fetch balance on mount and when dependencies change
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    formattedBalance,
    isLoading,
    error,
    refetch,
  };
}

// Hook for checking token allowance
export function useTokenAllowance({
  tokenAddress,
  ownerAddress,
  spenderAddress,
}: {
  tokenAddress: Address;
  ownerAddress: Address | undefined;
  spenderAddress: Address;
}) {
  const publicClient = usePublicClient();
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllowance = useCallback(async () => {
    if (!publicClient || !ownerAddress) {
      setError("Public client or owner address not available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const allowanceValue = await publicClient.readContract({
        address: tokenAddress,
        abi: UNISWAP_ABIS.ERC20,
        functionName: "allowance",
        args: [ownerAddress, spenderAddress]
      }) as bigint;

      setAllowance(allowanceValue);
    } catch (err) {
      console.error("Error fetching token allowance:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch token allowance");
      setAllowance(0n);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, ownerAddress, tokenAddress, spenderAddress]);

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  return {
    allowance,
    isLoading,
    error,
    refetch: fetchAllowance,
  };
}

// Hook for checking if user has sufficient balance
export function useHasSufficientBalance({
  tokenAddress,
  userAddress,
  decimals,
  requiredAmount,
}: {
  tokenAddress: Address;
  userAddress: Address | undefined;
  decimals: number;
  requiredAmount: bigint;
}) {
  const { balance, isLoading, error } = useTokenBalance({
    tokenAddress,
    userAddress,
    decimals
  });

  const hasSufficientBalance = balance >= requiredAmount;
  const shortfall = hasSufficientBalance ? 0n : requiredAmount - balance;

  return {
    hasSufficientBalance,
    shortfall,
    balance,
    isLoading,
    error,
  };
}
