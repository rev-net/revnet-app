import { Chain } from "viem";
import { optimismSepolia, sepolia } from "viem/chains";
import { react } from "@wagmi/cli/plugins";

enum RevnetCoreContracts {
  REVBasicDeployer = "REVBasicDeployer",
}

/**
 * Name of chains, according to the nannypus deployment directory names
 */
const CHAIN_NAME = {
  [sepolia.id]: "sepolia",
  [optimismSepolia.id]: "optimism_sepolia",
} as Record<number, string>;

function revnetCorePath(
  chain: Chain,
  contractName: keyof typeof RevnetCoreContracts
) {
  const chainName = CHAIN_NAME[chain.id];
  return `@rev-net/core/deployments/revnet-core-testnet/${chainName}/${contractName}.json`;
}

async function importDeployment(importPath: string) {
  const { default: deployment } = await import(importPath, {
    assert: { type: "json" },
  });
  return deployment as unknown as {
    address: string;
    abi: unknown[];
  };
}

async function buildRevnetCoreContractConfig() {
  const chainToContractAddress = await Promise.all(
    Object.values(RevnetCoreContracts).map(async (contractName) => {
      const deployment = await importDeployment(
        revnetCorePath(sepolia, contractName)
      );
      const deploymentOp = await importDeployment(
        revnetCorePath(optimismSepolia, contractName)
      );

      return {
        name: contractName,
        abi: deployment.abi,
        address: {
          [sepolia.id]: deployment.address,
          [optimismSepolia.id]: deploymentOp.address,
        },
      };
    })
  );

  return chainToContractAddress;
}

const contracts = await buildRevnetCoreContractConfig();

const config = {
  out: "src/lib/revnet/hooks/contract.ts",
  contracts,
  plugins: [react()],
};

export default config;
