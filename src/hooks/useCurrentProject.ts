import { useJBContractContext, useJBChainId } from "juice-sdk-react";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { ProjectDocument } from "@/generated/graphql";

/**
 * Hook to get the current project and its sucker group ID
 * This is the foundation for multi-chain operations
 */
export function useCurrentProject() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();

  const { data: projectData, isLoading } = useBendystrawQuery(
    ProjectDocument,
    {
      chainId: Number(chainId),
      projectId: Number(projectId),
    },
    {
      enabled: !!chainId && !!projectId,
      pollInterval: 10000, // Poll every 10 seconds
    }
  );

  const project = projectData?.project;
  const suckerGroupId = project?.suckerGroupId;

  return {
    project,
    suckerGroupId,
    isLoading,
  };
} 