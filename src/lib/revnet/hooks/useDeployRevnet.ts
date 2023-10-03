import { encodeFunctionData } from "viem";
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

/**
    address _boostOperator,
    JBProjectMetadata memory _revnetMetadata,
    string memory _name,
    string memory _symbol,
    RevnetParams memory _revnetData,

    IJBPaymentTerminal[] memory _terminals,
    BuybackHookSetupData memory _buybackHookSetupData
     */
export function useDeployRevnet(
  args: UsePrepareContractWriteConfig<
    typeof basicRevnetDeployerABI,
    "deployRevnetFor"
  >["args"]
) {
  const { config, data } = usePrepareBasicRevnetDeployerDeployRevnetFor({
    args,
  });
  // if (args) {
  //   const x = encodeFunctionData({
  //     abi: basicRevnetDeployerABI,
  //     functionName: "deployRevnetFor",
  //     args,
  //   });

  //   console.log(x);
  // }

  const write = useContractWrite(config);
  return write;
}
