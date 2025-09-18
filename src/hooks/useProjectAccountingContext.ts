import { ProjectAccountingContextDocument } from "@/generated/graphql";
import { useBendystrawQuery, useJBChainId, useJBContractContext } from "juice-sdk-react";

export function useProjectAccountingContext() {
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();

  return useBendystrawQuery(ProjectAccountingContextDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
    version,
  });
}
