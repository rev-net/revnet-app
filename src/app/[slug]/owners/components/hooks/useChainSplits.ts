"use client";

import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import { useFetchProjectRulesets } from "@/hooks/useFetchProjectRulesets";
import { JBCoreContracts, jbSplitsAbi } from "juice-sdk-core";
import { useJBContractContext, useSuckers } from "juice-sdk-react";
import { useMemo } from "react";
import { useReadContracts } from "wagmi";

export function useChainSplits(stageId: number) {
  const { contractAddress } = useJBContractContext();
  const { data: suckers, refetch } = useSuckers();
  const { suckerPairsWithRulesets } = useFetchProjectRulesets(suckers);

  const contracts = useMemo(() => {
    if (!suckerPairsWithRulesets) return [];

    return suckerPairsWithRulesets
      .filter((sucker) => sucker.rulesets?.[stageId]?.id)
      .map((sucker) => ({
        chainId: sucker.peerChainId,
        abi: jbSplitsAbi,
        address: contractAddress(JBCoreContracts.JBSplits, sucker.peerChainId),
        functionName: "splitsOf" as const,
        args: [
          BigInt(sucker.projectId),
          BigInt(sucker.rulesets[stageId].id),
          RESERVED_TOKEN_SPLIT_GROUP_ID,
        ] as const,
      }));
  }, [suckerPairsWithRulesets, contractAddress, stageId]);

  const { data, isLoading } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  const chainSplits = useMemo(() => {
    if (!data || !suckerPairsWithRulesets) return [];

    return suckerPairsWithRulesets
      .filter((sucker) => sucker.rulesets?.[stageId]?.id)
      .map((sucker, idx) => ({
        chainId: sucker.peerChainId,
        projectId: sucker.projectId,
        rulesetId: sucker.rulesets[stageId].id,
        splits: data[idx]?.result || [],
      }));
  }, [data, suckerPairsWithRulesets, stageId]);

  const allRulesets = useMemo(() => {
    if (!suckerPairsWithRulesets || suckerPairsWithRulesets.length === 0) return [];
    return suckerPairsWithRulesets[0].rulesets;
  }, [suckerPairsWithRulesets]);

  return {
    chainSplits,
    allRulesets,
    isLoading,
    refetch,
  };
}
