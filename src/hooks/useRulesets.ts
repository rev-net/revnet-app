"use client";

import { MAX_RULESET_COUNT } from "@/app/constants";
import { JBCoreContracts, jbRulesetsAbi, RulesetWeight, WeightCutPercent } from "juice-sdk-core";
import { useJBChainId, useJBContractContext } from "juice-sdk-react";
import { useReadContract } from "wagmi";

export function useRulesets() {
  const { projectId, contractAddress } = useJBContractContext();
  const chainId = useJBChainId();

  const { data, ...rest } = useReadContract({
    abi: jbRulesetsAbi,
    functionName: "allOf",
    address: contractAddress(JBCoreContracts.JBRulesets),
    chainId,
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
    query: {
      select(data) {
        return data
          .map((ruleset) => ({
            ...ruleset,
            weight: new RulesetWeight(ruleset.weight),
            weightCutPercent: new WeightCutPercent(ruleset.weightCutPercent),
          }))
          .reverse();
      },
    },
  });

  return { rulesets: data, ...rest };
}
