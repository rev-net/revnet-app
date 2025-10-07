import { ProjectWithPermissionsDocument } from "@/generated/graphql";
import { JB_PERMISSIONS, JBPermissionKey } from "@/lib/permissions";
import { useBendystrawQuery, useJBChainId, useJBContractContext } from "juice-sdk-react";
import { useMemo } from "react";
import { useAccount } from "wagmi";

export function useUserPermissions() {
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();
  const { address } = useAccount();

  const { data, isLoading } = useBendystrawQuery(
    ProjectWithPermissionsDocument,
    {
      chainId: Number(chainId),
      projectId: Number(projectId),
      version,
    },
    {
      enabled: !!chainId && !!projectId && !!address,
    },
  );

  const userPermissions = useMemo(() => {
    if (!address || !data?.project) return [];

    const permissionHolders = data.project.permissionHolders?.items || [];
    const userHolder = permissionHolders.find(
      (holder) => holder.operator?.toLowerCase() === address.toLowerCase(),
    );

    return userHolder?.permissions || [];
  }, [address, data?.project]);

  const hasPermission = useMemo(
    () => (permission: JBPermissionKey) => {
      const permissionId = JB_PERMISSIONS[permission];
      return userPermissions.includes(permissionId);
    },
    [userPermissions],
  );

  return {
    hasPermission,
    permissions: userPermissions,
    isLoading,
  };
}
