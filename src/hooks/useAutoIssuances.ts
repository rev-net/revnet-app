import { useMemo } from "react";
import { useSubgraphQuery } from "@/graphql/useSubgraphQuery";
import { StoreAutoIssuanceAmountEventsDocument } from "@/generated/graphql";
import {
  useJBChainId,
  useJBContractContext,
  useReadJbRulesetsAllOf
} from "juice-sdk-react";
import { MAX_RULESET_COUNT } from "@/app/constants";

export function useAutoIssuances() {
  const { projectId } = useJBContractContext();

  const chainId = useJBChainId();

  const { data: autoIssuancesData } = useSubgraphQuery(
    StoreAutoIssuanceAmountEventsDocument,
    {
      where: { revnetId: String(projectId) },
    }
  );

  const { data: rulesets } = useReadJbRulesetsAllOf({
    chainId,
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
  });

  const autoIssuances = useMemo(() => {
    console.log("AUTOISSUANCES")
    console.log(autoIssuancesData)
    return autoIssuancesData?.storeAutoIssuanceAmountEvents.map((autoIssuance) => {
      const rulesetIndex =
        rulesets?.findIndex((r) => String(r.id) === autoIssuance.stageId) || 0;
      return {
        ...autoIssuance,
        startsAt: rulesets?.[rulesetIndex]
        ?.start,
        stage: (rulesets?.length || 0) - rulesetIndex,
      };
    });
  }, [autoIssuancesData, rulesets]);
  return autoIssuances;
}
