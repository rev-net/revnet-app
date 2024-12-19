import { Address, parseEther } from "viem";
import { createSalt } from "@/lib/number";
import { JBChainId } from "juice-sdk-core";

const DEPLOYER_MAPPING = {};
const TOKEN_MAPPING = {};

export function parseSuckerDeployerConfig(
  tokens: string[],
  chain: JBChainId[]
) {
  const deployerConfigurations = chain.map(chainId => {
    return {
      deployer: "0x" as Address,
      mappings: tokens.map(token => {
        return {
          localToken: token as Address,
          remoteToken: "0x" as Address,
          minGas: 200_000,
          minBridgeAmount: parseEther("0.01"),
        };
      }),
    };
  });

  return {
    deployerConfigurations,
    salt: createSalt(),
  };
}
