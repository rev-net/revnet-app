"use client";

import {
  getJBContractAddress,
  JBChainId,
  JBSuckerContracts,
  jbSuckerRegistryAbi,
} from "juice-sdk-core";
import { useJBContractContext } from "juice-sdk-react";
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
