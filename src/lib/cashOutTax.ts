import { getViemPublicClient } from "@/lib/wagmiConfig";
import {
  getJBContractAddress,
  JBChainId,
  jbControllerAbi,
  JBCoreContracts,
  JBVersion,
} from "juice-sdk-core";
import { unstable_cache } from "next/cache";
import { getContract } from "viem";

export const getCurrentCashOutTax = unstable_cache(
  async (
    projectId: string,
    chainId: JBChainId,
    version: JBVersion,
  ): Promise<number | undefined> => {
    try {
      const client = getViemPublicClient(chainId);
      const controllerAddress = getJBContractAddress(
        JBCoreContracts.JBController,
        version,
        chainId,
      );
      const controller = getContract({
        address: controllerAddress,
        abi: jbControllerAbi,
        client,
      });
      const [, metadata] = await controller.read.currentRulesetOf([BigInt(projectId)]);
      return Number(metadata.cashOutTaxRate);
    } catch {
      return undefined;
    }
  },
  ["currentCashOutTax"],
  { revalidate: 300 }, // 5 minutes
);
