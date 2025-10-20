import { type Project } from "@/generated/graphql";
import {
  getProjectTerminalStore,
  JBChainId,
  jbTerminalStoreAbi,
  JBVersion,
  NATIVE_TOKEN_DECIMALS,
} from "juice-sdk-core";
import { getContract } from "viem";
import { toBaseCurrencyId } from "./currency";
import { applyCashOutFee } from "./feeHelpers";
import { getViemPublicClient } from "./wagmiConfig";

export async function getReclaimableSurplus(
  chainId: JBChainId,
  projectId: number,
  tokenAmountWei: bigint,
  version: JBVersion,
  decimals: number,
  currencyId: 1 | 2 | 3,
) {
  try {
    const contract = getContract({
      address: getProjectTerminalStore(chainId, version),
      abi: jbTerminalStoreAbi,
      client: getViemPublicClient(chainId),
    });

    const surplus = await contract.read.currentReclaimableSurplusOf([
      BigInt(projectId),
      tokenAmountWei,
      [],
      [],
      BigInt(decimals),
      BigInt(currencyId),
    ]);

    return applyCashOutFee(surplus).toString();
  } catch (error) {
    console.debug({ chainId, projectId, tokenAmountWei, version, decimals, currencyId });
    console.error(error);
    return "0";
  }
}

export async function getProjectsReclaimableSurplus(
  projects: Array<
    Pick<Project, "chainId" | "projectId" | "tokenSupply" | "version" | "decimals" | "currency">
  >,
) {
  return await Promise.all(
    projects.map(async (project) => {
      const { chainId, projectId, tokenSupply, version, currency } = project;
      const decimals = project.decimals || NATIVE_TOKEN_DECIMALS;
      const currencyId = toBaseCurrencyId(currency, version as JBVersion);

      const value = await getReclaimableSurplus(
        chainId as JBChainId,
        projectId,
        tokenSupply,
        version as JBVersion,
        decimals,
        currencyId,
      );
      return { projectId: project.projectId, value, currencyId, decimals, chainId, version };
    }),
  );
}

export type Surplus = Awaited<ReturnType<typeof getProjectsReclaimableSurplus>>[number];
