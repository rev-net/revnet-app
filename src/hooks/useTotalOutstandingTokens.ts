import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { useJBChainId, useJBContractContext } from "juice-sdk-react";

export function useTotalOutstandingTokens() {
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();

  const { data } = useBendystrawQuery(ProjectDocument, {
    projectId: Number(projectId),
    chainId: Number(chainId),
    version,
  });

  const { data: suckerGroup } = useBendystrawQuery(SuckerGroupDocument, {
    id: data?.project?.suckerGroupId ?? "",
  });

  return BigInt(suckerGroup?.suckerGroup?.tokenSupply ?? 0);
}
