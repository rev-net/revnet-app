import { Address, parseEther } from "viem";
import { createSalt } from "@/lib/number";
import { JBChainId } from "juice-sdk-core";
import { optimismSepolia, sepolia } from "viem/chains";

/**
 * TODO
 * @see https://discord.com/channels/1139291093310132376/1139291094069301385/1337164727008366683
 */
const DEPLOYER_MAPPING = {
  [sepolia.id]: {
    [optimismSepolia.id]: "0x7e8417d2458ee22a4f62041d770cd5240a573359",
  },
};
const TOKEN_MAPPING = {};

export function parseSuckerDeployerConfig(
  tokens?: Address[],
  chains?: JBChainId[]
) {
  const deployerConfigurations =
    chains?.map((chainId) => {
      return {
        deployer: "0x" as Address,
        mappings:
          tokens?.map((token) => {
            return {
              localToken: token,
              remoteToken: token,
              minGas: 200_000,
              minBridgeAmount: parseEther("0.01"),
            };
          }) ?? [],
      };
    }) ?? [];

  return {
    deployerConfigurations,
    salt: createSalt(),
  };
}
