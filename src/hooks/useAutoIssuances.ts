import {
  AutoIssueEventsDocument,
  StoreAutoIssuanceAmountEventsDocument,
} from "@/generated/graphql";
import { useBendystrawQuery, useJBChainId, useJBContractContext } from "juice-sdk-react";
import { useMemo } from "react";
import { useRulesets } from "./useRulesets";

export function useAutoIssuances() {
  const { projectId, version } = useJBContractContext();

  const chainId = useJBChainId();

  const { data: autoIssuancesData } = useBendystrawQuery(StoreAutoIssuanceAmountEventsDocument, {
    where: { projectId: Number(projectId), chainId, version },
  });

  const { data: autoIssueEventsQuery } = useBendystrawQuery(AutoIssueEventsDocument, {
    where: { projectId: Number(projectId), chainId, version },
  });

  const { rulesets } = useRulesets();

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
        stage: rulesetIndex + 1,
        distributed: distributed !== undefined,
        distributedTxn,
      };
    });
  }, [autoIssuancesData, rulesets, autoIssueEventsQuery]);
  return autoIssuances;
}
