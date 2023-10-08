import { UsePrepareContractWriteConfig } from "wagmi";
import {
  basicRevnetDeployerABI,
  useBasicRevnetDeployerDeployRevnetFor,
} from "./contract";

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

/**
    address _boostOperator,
    JBProjectMetadata memory _revnetMetadata,
    string memory _name,
    string memory _symbol,
    RevnetParams memory _revnetData,

    IJBPaymentTerminal[] memory _terminals,
    BuybackHookSetupData memory _buybackHookSetupData
     */
export function useDeployRevnet() {
  const { write } = useBasicRevnetDeployerDeployRevnetFor();
  return (
    args: UsePrepareContractWriteConfig<
      typeof basicRevnetDeployerABI,
      "deployRevnetFor"
    >["args"]
  ) => {
    write?.({
      args,
    });
  };
}
