"use client";

import { useCallback, useState } from "react";
import { erc20Abi } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export function useAllowance(chainId: number) {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const [isApproving, setIsApproving] = useState(false);

  const ensureAllowance = useCallback(
    async (tokenAddress: `0x${string}`, spender: `0x${string}`, value: bigint) => {
      if (!address) throw new Error("Wallet not connected");
      if (!publicClient || !walletClient) throw new Error("Please try again");

      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address, spender],
      });

      if (BigInt(allowance) >= BigInt(value)) return null;

      setIsApproving(true);
      try {
        const hash = await walletClient.writeContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, value],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        return hash;
      } finally {
        setIsApproving(false);
      }
    },
    [address, publicClient, walletClient],
  );

  return { ensureAllowance, isApproving };
}
