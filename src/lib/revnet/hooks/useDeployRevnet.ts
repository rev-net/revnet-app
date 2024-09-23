import { useToast } from "@/components/ui/use-toast";
import { JBChainId } from "juice-sdk-react";
import { useCallback } from "react";
import { revDeployerAbi, useWriteRevDeployerDeployFor } from "revnet-sdk";
import { ContractFunctionParameters } from "viem";
import { useChainId } from "wagmi";

export function useDeployRevnet() {
  const { toast } = useToast();
  const chainId = useChainId() as JBChainId; // TODO check first

  const { writeContract, data, isError, isPending } =
    useWriteRevDeployerDeployFor({
      mutation: {
        onError(e) {
          console.error(e?.message);
          toast({
            title: "Failed to deploy revnet",
            description: e?.message,
          });
        },
      },
    });

  /**
    address _boostOperator,
    JBProjectMetadata memory _revnetMetadata,
    string memory _name,
    string memory _symbol,
    RevnetParams memory _revnetData,

    IJBPaymentTerminal[] memory _terminals,
    BuybackHookSetupData memory _buybackHookSetupData
  */
  const deployRevnet = useCallback(
    (
      args: ContractFunctionParameters<
        typeof revDeployerAbi,
        "nonpayable",
        "deployFor"
      >["args"]
    ) => {
      writeContract?.({
        chainId,
        args,
      });
    },
    [writeContract, chainId]
  );

  return { write: deployRevnet, data, isError, isPending };
}
