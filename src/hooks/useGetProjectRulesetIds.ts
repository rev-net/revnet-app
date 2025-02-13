import { useState, useEffect, useCallback } from "react";
import { SuckerPair } from "juice-sdk-core";
import { JBChainId, jbRulesetsAbi, jbRulesetsAddress } from "juice-sdk-react";
import { readContract } from "@wagmi/core";
import { MAX_RULESET_COUNT } from "@/app/constants";
import { wagmiConfig } from "@/lib/wagmiConfig";

type SuckerPairWithRuleset = SuckerPair & {
  rulesetId: number;
};

export function useGetProjectRulesetIds(suckers: SuckerPair[] | undefined | null) {
  const [suckerPairsWithRulesets, setSuckerPairsWithRulesets] = useState<SuckerPairWithRuleset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  const fetchRuleSets = useCallback(async () => {
    if (!suckers) return;
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

      const pairsWithRulesets = suckers.map((sucker, index) => ({
        ...sucker,
        rulesetId: Number(allRuleSets[index][MAX_RULESET_COUNT - 1].id),
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
    if (!suckers) return;
    fetchRuleSets();
  }, [suckers, fetchRuleSets]);

  return { suckerPairsWithRulesets, isLoading, error };
}
