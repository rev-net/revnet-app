import { Address, parseEther } from "viem";
import { createSalt } from "@/lib/number";
import {
  jbccipSuckerDeployer_1Address,
  jbccipSuckerDeployer_2Address,
  jbccipSuckerDeployerAddress,
  JBChainId,
  NATIVE_TOKEN,
} from "juice-sdk-core";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
} from "viem/chains";

type CCIPMap = {
  [k in JBChainId]?: {
    [k in JBChainId]?: Address;
  };
};

/**
 * TODO
 * @see https://discord.com/channels/1139291093310132376/1139291094069301385/1337164727008366683
 */
const DEPLOYER_MAPPING: CCIPMap = {
  [sepolia.id]: {
    [optimismSepolia.id]: jbccipSuckerDeployerAddress[sepolia.id],
    [baseSepolia.id]: jbccipSuckerDeployer_1Address[sepolia.id],
    [arbitrumSepolia.id]: jbccipSuckerDeployer_2Address[sepolia.id],
  },
  [mainnet.id]: {
    [optimism.id]: jbccipSuckerDeployerAddress[mainnet.id],
    [base.id]: jbccipSuckerDeployer_1Address[mainnet.id],
    [arbitrum.id]: jbccipSuckerDeployer_2Address[mainnet.id],
  },

  [arbitrumSepolia.id]: {
    [sepolia.id]: jbccipSuckerDeployerAddress[arbitrumSepolia.id],
    [optimismSepolia.id]: jbccipSuckerDeployer_1Address[arbitrumSepolia.id],
    [baseSepolia.id]: jbccipSuckerDeployer_2Address[arbitrumSepolia.id],
  },
  [arbitrum.id]: {
    [sepolia.id]: jbccipSuckerDeployerAddress[arbitrum.id],
    [optimism.id]: jbccipSuckerDeployer_1Address[arbitrum.id],
    [base.id]: jbccipSuckerDeployer_2Address[arbitrum.id],
  },

  [optimismSepolia.id]: {
    [sepolia.id]: jbccipSuckerDeployerAddress[optimismSepolia.id],
    [arbitrumSepolia.id]: jbccipSuckerDeployer_1Address[optimismSepolia.id],
    [baseSepolia.id]: jbccipSuckerDeployer_2Address[optimismSepolia.id],
  },
  [optimism.id]: {
    [sepolia.id]: jbccipSuckerDeployerAddress[optimism.id],
    [arbitrum.id]: jbccipSuckerDeployer_1Address[optimism.id],
    [base.id]: jbccipSuckerDeployer_2Address[optimism.id],
  },

  [baseSepolia.id]: {
    [sepolia.id]: jbccipSuckerDeployerAddress[baseSepolia.id],
    [optimismSepolia.id]: jbccipSuckerDeployer_1Address[baseSepolia.id],
    [arbitrumSepolia.id]: jbccipSuckerDeployer_2Address[baseSepolia.id],
  },
  [base.id]: {
    [sepolia.id]: jbccipSuckerDeployerAddress[base.id],
    [optimism.id]: jbccipSuckerDeployer_1Address[base.id],
    [arbitrum.id]: jbccipSuckerDeployer_2Address[base.id],
  },
};

export function parseSuckerDeployerConfig(
  targetChainId: JBChainId,
  chains: JBChainId[]
) {
  const suckerChains = chains.filter((chainId) => chainId !== targetChainId);
  const deployerConfigurations =
    suckerChains?.map((chainId) => {
      const deployer = DEPLOYER_MAPPING[targetChainId]?.[chainId];
      if (!deployer) {
        throw new Error(`No deployer found for ${targetChainId} -> ${chainId}`);
      }

      return {
        deployer,
        mappings: [
          {
            localToken: NATIVE_TOKEN,
            remoteToken: NATIVE_TOKEN,
            minGas: 200_000,
            minBridgeAmount: parseEther("0.01"),
          },
        ],
      };
    }) ?? [];

  return {
    deployerConfigurations,
    salt: createSalt(),
  };
}
