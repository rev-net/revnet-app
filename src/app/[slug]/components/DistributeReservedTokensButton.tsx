import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useToast } from "@/components/ui/use-toast";
import {
  useJBChainId,
  useJBContractContext,
  useWriteJbControllerSendReservedTokensToSplitsOf,
} from "juice-sdk-react";
import { useWaitForTransactionReceipt } from "wagmi";

export function DistributeReservedTokensButton() {
  const { toast } = useToast();
  const {
    projectId,
    contracts: { controller },
  } = useJBContractContext();
  const chainId = useJBChainId();

  const { writeContract, isPending, data } = useWriteJbControllerSendReservedTokensToSplitsOf({
    mutation: {
      onSuccess() {
        toast({
          title: "Transaction submitted.",
        });
      },
    },
  });

  const {
    data: txData,
    isSuccess,
    isLoading: isTxLoading,
  } = useWaitForTransactionReceipt({
    hash: data,
  });

  return (
    <ButtonWithWallet
      variant="outline"
      loading={isPending || isTxLoading}
      targetChainId={chainId}
      onClick={() => {
        if (!controller.data) {
          return;
        }

        if (!projectId) {
          return;
        }

        writeContract?.({
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
