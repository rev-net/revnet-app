import { useState, useEffect, useCallback } from "react";
import { SuckerPair } from "juice-sdk-core";
import { JBChainId, jbRulesetsAbi, jbRulesetsAddress } from "juice-sdk-react";
import { readContract } from "@wagmi/core";
import { MAX_RULESET_COUNT } from "@/app/constants";
import { wagmiConfig } from "@/lib/wagmiConfig";

type RuleSet = {
  cycleNumber: number;
  id: number;
  basedOnId: number;
  start: number;
  duration: number;
  weight: bigint;
  weightCutPercent: number;
  approvalHook: `0x${string}`;
  metadata: bigint;
};

type SuckerPairWithRulesets = SuckerPair & {
  readonly rulesets: readonly RuleSet[];
};

export function useFetchProjectRulesets(suckers: SuckerPair[] | undefined | null) {
  const [suckerPairsWithRulesets, setSuckerPairsWithRulesets] = useState<SuckerPairWithRulesets[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  const fetchRuleSets = useCallback(async () => {
    if (!suckers) return undefined;
    setIsLoading(true);
    try {
      const allRuleSets = await Promise.all(
        suckers.map((sucker) =>
          readContract(wagmiConfig, {
            chainId: sucker.peerChainId,
            address: jbRulesetsAddress[sucker.peerChainId as JBChainId],
            abi: jbRulesetsAbi,
            functionName: "allOf",
            args: [sucker.projectId, 0n, BigInt(MAX_RULESET_COUNT)],
          })
        )
      );
      if (allRuleSets.length === 0) return undefined;
      const pairsWithRulesets = suckers.map((sucker, index) => ({
        ...sucker,
        rulesets: allRuleSets[index].slice().reverse() as RuleSet[],
      }));
      setSuckerPairsWithRulesets(pairsWithRulesets);
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [suckers]);

  useEffect(() => {
    if (!suckers) return undefined;
    fetchRuleSets();
    console.log("ERROR", error)
  }, [suckers, fetchRuleSets, error]);

  return {
    suckerPairsWithRulesets: error ? undefined : suckerPairsWithRulesets,
    isLoading,
    error,
  };
}
