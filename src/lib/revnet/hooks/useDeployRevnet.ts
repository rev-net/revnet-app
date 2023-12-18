import { UsePrepareContractWriteConfig } from "wagmi";
import {
  revBasicDeployerABI,
  useRevBasicDeployerDeployRevnetWith,
} from "./contract";
import { useCallback } from "react";

type Boost = {
  rate: bigint;
  startsAtOrAfter: bigint;
};

type RevnetParams = {
  initialIssuanceRate: bigint;
  premintTokenAmount: bigint;
  priceCeilingIncreaseFrequency: bigint;
  priceCeilingIncreasePercentage: bigint;
  priceFloorTaxIntensity: bigint;
  boosts: Boost[];
};

type JBProjectMetadata = {
  domain: number;
  content: string;
};

export function useDeployRevnet() {
  const { write, data } = useRevBasicDeployerDeployRevnetWith();

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
      args: UsePrepareContractWriteConfig<
        typeof revBasicDeployerABI,
        "deployRevnetWith"
      >["args"]
    ) => {
      write?.({
        args,
      });
    },
    [write]
  );

  return { write: deployRevnet, data };
}
