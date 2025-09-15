"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useToast } from "@/components/ui/use-toast";
import { jbControllerAbi } from "juice-sdk-core";
import { useJBChainId, useJBContractContext } from "juice-sdk-react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export function DistributeReservedTokensButton() {
  const { toast } = useToast();
  const {
    projectId,
    contracts: { controller },
  } = useJBContractContext();
  const chainId = useJBChainId();

  const { writeContract, isPending, data } = useWriteContract({
    mutation: {
      onSuccess() {
        toast({ title: "Transaction submitted." });
      },
    },
  });

  const { isLoading } = useWaitForTransactionReceipt({ hash: data });

  return (
    <ButtonWithWallet
      variant="outline"
      loading={isPending || isLoading}
      targetChainId={chainId}
      onClick={() => {
        if (!controller.data) {
          return;
        }

        if (!projectId) {
          return;
        }

        writeContract?.({
          abi: jbControllerAbi,
          functionName: "sendReservedTokensToSplitsOf",
          chainId,
          address: controller.data,
          args: [projectId],
        });
      }}
    >
      Distribute pending splits
    </ButtonWithWallet>
  );
}
