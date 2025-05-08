import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { useJBChainId, useJBContractContext } from "juice-sdk-react";

export function useTotalOutstandingTokens() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();

  const { data } = useBendystrawQuery(ProjectDocument, {
    projectId: Number(projectId),
    chainId: Number(chainId),
  });

  const { data: suckerGroup } = useBendystrawQuery(SuckerGroupDocument, {
    id: data?.project?.suckerGroupId ?? "",
  });

  return BigInt(suckerGroup?.suckerGroup?.tokenSupply ?? 0);
}
