import { ONE_ETHER } from "juice-hooks";
import { UsePrepareContractWriteConfig, useContractWrite } from "wagmi";
import {
  basicRevnetDeployerABI,
  usePrepareBasicRevnetDeployerDeployRevnetFor,
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

export function useDeployRevnet(
  args: UsePrepareContractWriteConfig<
    typeof basicRevnetDeployerABI,
    "deployRevnetFor"
  >["args"]
) {
  const { config } = usePrepareBasicRevnetDeployerDeployRevnetFor({
    /**
    address _boostOperator,
    JBProjectMetadata memory _revnetMetadata,
    string memory _name,
    string memory _symbol,
    RevnetParams memory _revnetData,

    IJBPaymentTerminal[] memory _terminals,
    BuybackHookSetupData memory _buybackHookSetupData
     */
    args,
  });
  const write = useContractWrite(config);

  return write;
}
