import { useJBChainId, useJBContractContext } from "juice-sdk-react";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { ProjectAccountingContextDocument } from "@/generated/graphql";

export function useProjectAccountingContext() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();

  return useBendystrawQuery(ProjectAccountingContextDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
  });
} 