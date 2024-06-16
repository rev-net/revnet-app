import { useToast } from "@/components/ui/use-toast";
import { useCallback } from "react";
import { ContractFunctionParameters } from "viem";
import {
  revBasicDeployerAbi,
  useWriteRevBasicDeployerLaunchRevnetFor,
} from "revnet-sdk";

export function useDeployRevnet() {
  const { toast } = useToast();
  const { writeContract, data, isError, isPending } =
    useWriteRevBasicDeployerLaunchRevnetFor({
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
        typeof revBasicDeployerAbi,
        "nonpayable",
        "launchRevnetFor"
      >["args"]
    ) => {
      writeContract?.({
        args,
      });
    },
    [writeContract]
  );

  return { write: deployRevnet, data, isError, isPending };
}
