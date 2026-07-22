"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useToast } from "@/components/ui/use-toast";
import { formatWalletError } from "@/lib/utils";
import { JBChainId, jbControllerAbi } from "@bananapus/nana-sdk-core";
import { useJBContractContext } from "@bananapus/nana-sdk-react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface Props {
  chainId: JBChainId;
  projectId: bigint;
}

export function DistributeReservedTokensButton(props: Props) {
  const { chainId, projectId } = props;

  const { toast } = useToast();

  const {
    contracts: { controller },
  } = useJBContractContext();

  const { writeContractAsync, isPending, data: hash } = useWriteContract();

  const { isLoading } = useWaitForTransactionReceipt({ hash });

  return (
    <ButtonWithWallet
      variant="outline"
      loading={isPending || isLoading}
      targetChainId={chainId}
      onClick={async () => {
        try {
          if (!controller.data || !writeContractAsync || !projectId) {
            throw new Error("Missing data. Please try again.");
          }

          await writeContractAsync({
            abi: jbControllerAbi,
            functionName: "sendReservedTokensToSplitsOf",
            chainId,
            address: controller.data,
            args: [projectId],
          });

          toast({ title: "Transaction submitted." });
        } catch (e) {
          console.error(e);
          toast({ variant: "destructive", title: "Error", description: formatWalletError(e) });
        }
      }}
    >
      Distribute pending splits
    </ButtonWithWallet>
  );
}
