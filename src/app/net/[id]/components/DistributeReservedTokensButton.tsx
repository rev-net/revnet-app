import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
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
  const { write, isLoading, data } =
    useWriteJbControllerSendReservedTokensToSplitsOf({
      address: controller.data ?? undefined,
      args: projectId ? [projectId] : undefined,
      onSuccess() {
        toast({
          title: "Transaction submitted.",
        });
      },
    });

  const {
    data: txData,
    isSuccess,
    isLoading: isTxLoading,
  } = useWaitForTransactionReceipt({
    hash: data?.hash,
  });

  return (
    <Button
      variant="outline"
      loading={isLoading || isTxLoading}
      onClick={() => write?.()}
    >
      Release operator tokens
    </Button>
  );
}
