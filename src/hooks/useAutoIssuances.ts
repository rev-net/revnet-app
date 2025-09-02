import { MAX_RULESET_COUNT } from "@/app/constants";
import {
  AutoIssueEventsDocument,
  StoreAutoIssuanceAmountEventsDocument,
} from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { useJBChainId, useJBContractContext, useReadJbRulesetsAllOf } from "juice-sdk-react";
import { useMemo } from "react";

export function useAutoIssuances() {
  const { projectId } = useJBContractContext();

  const chainId = useJBChainId();

  const { data: autoIssuancesData } = useBendystrawQuery(StoreAutoIssuanceAmountEventsDocument, {
    where: {
      projectId: Number(projectId),
      chainId,
    },
  });

  const { data: autoIssueEventsQuery } = useBendystrawQuery(AutoIssueEventsDocument, {
    where: {
      projectId: Number(projectId),
      chainId,
    },
  });

  const { data: rulesets } = useReadJbRulesetsAllOf({
    chainId,
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
  });

  const autoIssuances = useMemo(() => {
    return autoIssuancesData?.storeAutoIssuanceAmountEvents.items.map((autoIssuance) => {
      const rulesetIndex = rulesets?.findIndex((r) => String(r.id) === autoIssuance.stageId) || 0;

      const distributed = autoIssueEventsQuery?.autoIssueEvents.items.find((event) => {
        return (
          event.stageId === autoIssuance.stageId &&
          event.beneficiary === autoIssuance.beneficiary &&
          event.count === autoIssuance.count
        );
      });

      let distributedTxn: string | undefined = undefined;
      if (distributed) {
        distributedTxn = distributed.id.split("-")[1];
      }
      return {
        ...autoIssuance,
        startsAt: rulesets?.[rulesetIndex]?.start,
        stage: (rulesets?.length || 0) - rulesetIndex,
        distributed: distributed !== undefined,
        distributedTxn,
      };
    });
  }, [autoIssuancesData, rulesets, autoIssueEventsQuery]);
  return autoIssuances;
}
