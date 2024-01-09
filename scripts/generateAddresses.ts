import { addressFor, ForgeDeploy } from "forge-run-parser";
import fs from "fs";
import sepoliaRun from "./vendor/juice-contracts-v4/sepolia/run-latest.json";
import optimismSepoliaRun from "./vendor/juice-contracts-v4/optimismSepolia/run-latest.json";

export enum JBContracts {
  JBController = "JBController",
  JBDirectory = "JBDirectory",
  JBMultiTerminal = "JBMultiTerminal",
  JBRulesets = "JBRulesets",
  JBPermissions = "JBPermissions",
  JBProjects = "JBProjects",
  JBSplits = "JBSplits",
  JBTokens = "JBTokens",
  JBTerminalStore = "JBTerminalStore",
}

async function main() {
  const contracts = await Promise.all(
    Object.values(JBContracts).map(async (contractName) => {
      const sepoliaAddress = addressFor(
        contractName,
        sepoliaRun as ForgeDeploy
      );
      const optimismSepoliaAddress = addressFor(
        contractName,
        optimismSepoliaRun as ForgeDeploy
      );
      //   const mainnet = await import(
      //     `@jbx-protocol/juice-contracts-v4/deployments/mainnet/${contractName}.json`
      //   );

      return {
        sepolia: sepoliaAddress,
        optimismSepolia: optimismSepoliaAddress,
        // mainnet: mainnet.address,
      };
    })
  );

  const addresses = Object.values(JBContracts).reduce(
    (acc, contractName, i) => {
      return {
        ...acc,
        [contractName]: contracts[i],
      };
    },
    {}
  );

  fs.writeFileSync("addresses.json", JSON.stringify(addresses));
}

main();
