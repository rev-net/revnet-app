import { ProjectAccountingContextDocument } from "@/generated/graphql";
import { useBendystrawQuery, useJBChainId, useJBContractContext } from "@bananapus/nana-sdk-react";

export function useProjectAccountingContext() {
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();

  return useBendystrawQuery(ProjectAccountingContextDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
    version,
  });
}
