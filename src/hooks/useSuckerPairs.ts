"use client";

import {
  getJBContractAddress,
  JBChainId,
  JBSuckerContracts,
  jbSuckerRegistryAbi,
} from "@bananapus/nana-sdk-core";
import { useJBContractContext } from "@bananapus/nana-sdk-react";
import { useReadContract } from "wagmi";

export function useSuckerPairs(projectId: number, chainId: JBChainId) {
  const { version } = useJBContractContext();

  const { data, ...rest } = useReadContract({
    abi: jbSuckerRegistryAbi,
    address: getJBContractAddress(JBSuckerContracts.JBSuckerRegistry, version, chainId),
    functionName: "suckerPairsOf",
    args: [BigInt(projectId)],
    chainId,
  });

  return { suckerPairs: data || [], ...rest };
}
