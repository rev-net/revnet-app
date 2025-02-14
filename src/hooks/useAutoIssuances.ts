import { useMemo } from "react";
import { useSubgraphQuery } from "@/graphql/useSubgraphQuery";
import {
  useJBChainId,
  useJBContractContext,
  useReadJbRulesetsAllOf
} from "juice-sdk-react";
import {
  AutoIssueEventsDocument,
  StoreAutoIssuanceAmountEventsDocument,
} from "@/generated/graphql";
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

  const { data: autoIssueEventsQuery } = useSubgraphQuery(
    AutoIssueEventsDocument,
    {
      where: { revnetId: String(projectId) },
    }
  );

  const { data: rulesets } = useReadJbRulesetsAllOf({
    chainId,
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
  });

  const autoIssuances = useMemo(() => {
    return autoIssuancesData?.storeAutoIssuanceAmountEvents.map((autoIssuance) => {
      const rulesetIndex =
        rulesets?.findIndex((r) => String(r.id) === autoIssuance.stageId) || 0;

        const distributed = autoIssueEventsQuery?.autoIssueEvents.find(
        (event) => {
          return (
            event.stageId === autoIssuance.stageId &&
            event.beneficiary === autoIssuance.beneficiary &&
            event.count === autoIssuance.count
          )
        }
      );

      let distributedTxn: string | undefined = undefined;
      if (distributed) {
        distributedTxn = distributed.id.split("-")[1];
      }
      return {
        ...autoIssuance,
        startsAt: rulesets?.[rulesetIndex]
        ?.start,
        stage: (rulesets?.length || 0) - rulesetIndex,
        distributed: distributed !== undefined,
        distributedTxn,
      };
    });
  }, [autoIssuancesData, rulesets, autoIssueEventsQuery]);
  return autoIssuances;
}
