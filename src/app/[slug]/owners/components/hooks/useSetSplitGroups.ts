"use client";

import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import { useToast } from "@/components/ui/use-toast";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { getPublicClient } from "@wagmi/core";
import { jbControllerAbi, JBCoreContracts, SPLITS_TOTAL_PERCENT } from "juice-sdk-core";
import { useGetRelayrTxQuote, useJBContractContext, useSendRelayrTx } from "juice-sdk-react";
import { useCallback, useEffect, useState } from "react";
import { Address, encodeFunctionData } from "viem";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ChainFormData } from "../ChangeSplitRecipientsDialog";

export function useSetSplitGroups(props: { onSuccess: (txHash: string) => void }) {
  const { onSuccess } = props;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { contractAddress } = useJBContractContext();
  const { address: userAddress, chainId: connectedChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { getRelayrTxQuote, reset: resetRelayr } = useGetRelayrTxQuote();
  const { sendRelayrTx } = useSendRelayrTx();
  const [onSuccessCalled, setOnSuccessCalled] = useState(false);

  const {
    writeContractAsync,
    isPending,
    data: txHash,
  } = useWriteContract({
    mutation: {
      onSuccess() {
        toast({ title: "Transaction submitted. Awaiting confirmation..." });
      },
    },
  });
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!isSuccess || onSuccessCalled || !txHash) return;
    onSuccess(txHash);
    setOnSuccessCalled(true);
  }, [isSuccess, onSuccess, onSuccessCalled, txHash]);

  const submitSplits = useCallback(
    async (selectedChains: ChainFormData[]) => {
      if (!userAddress) return;

      setIsSubmitting(true);

      try {
        if (selectedChains.length === 0) throw new Error("Please select at least one chain");

        // Single chain - use direct writeContract
        if (selectedChains.length === 1) {
          const chain = selectedChains[0];

          if (connectedChainId !== chain.chainId) {
            await switchChainAsync?.({ chainId: chain.chainId });
          }

          await writeContractAsync?.({
            abi: jbControllerAbi,
            functionName: "setSplitGroupsOf",
            chainId: chain.chainId,
            address: contractAddress(JBCoreContracts.JBController, chain.chainId),
            args: prepareArgs(chain),
          });

          return { success: true };
        }

        // Multi-chain - use relayr
        const relayrTransactions = [];

        for (const chain of selectedChains) {
          // Switch to chain for gas estimation
          if (connectedChainId !== chain.chainId) {
            await switchChainAsync?.({ chainId: chain.chainId });
          }

          const publicClient = getPublicClient(wagmiConfig, { chainId: chain.chainId });
          if (!publicClient) throw new Error("Public client not available");

          const controller = contractAddress(JBCoreContracts.JBController, chain.chainId);
          const args = prepareArgs(chain);

          const gasEstimate = await publicClient.estimateContractGas({
            address: controller,
            abi: jbControllerAbi,
            functionName: "setSplitGroupsOf",
            args,
            account: userAddress,
          });

          relayrTransactions.push({
            data: {
              from: userAddress,
              to: controller,
              value: 0n,
              gas: gasEstimate + 50_000n,
              data: encodeFunctionData({
                abi: jbControllerAbi,
                functionName: "setSplitGroupsOf",
                args,
              }),
            },
            chainId: chain.chainId,
          });
        }

        const quote = await getRelayrTxQuote(relayrTransactions);
        if (!quote) throw new Error("Failed to get relayr tx quote");

        const hash = await sendRelayrTx?.(quote.payment_info[0]);
        onSuccess(hash);
        setOnSuccessCalled(true);
        resetRelayr();
        return { success: true };
      } catch (e: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: e.message || "Failed to update splits",
        });
        console.error(e);
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      userAddress,
      connectedChainId,
      contractAddress,
      switchChainAsync,
      writeContractAsync,
      getRelayrTxQuote,
      sendRelayrTx,
      toast,
      resetRelayr,
      onSuccess,
    ],
  );

  return {
    submitSplits,
    isSubmitting,
    isPending,
    isTxLoading,
    isSuccess,
  };
}

function prepareArgs(chain: ChainFormData) {
  return [
    chain.projectId,
    chain.rulesetId,
    [{ groupId: RESERVED_TOKEN_SPLIT_GROUP_ID, splits: prepareSplits(chain) }],
  ] as const;
}

function prepareSplits(chain: ChainFormData) {
  const splitPercent = chain.splits.reduce((sum, s) => sum + Number(s.percentage), 0) * 100;

  return chain.splits.map((split) => ({
    preferAddToBalance: false,
    lockedUntil: 0,
    percent: Math.round((Number(split.percentage) * 100 * SPLITS_TOTAL_PERCENT) / splitPercent),
    projectId: 0n,
    beneficiary: split.beneficiary as Address,
    hook: "0x0000000000000000000000000000000000000000" as Address,
  }));
}
