import { ProjectWithPermissionsDocument } from "@/generated/graphql";
import { JB_PERMISSIONS, JBPermissionKey } from "@/lib/permissions";
import { JBPermissionIdsV6 } from "@bananapus/nana-sdk-core/v6";
import { useBendystrawQuery, useJBChainId, useJBContractContext } from "@bananapus/nana-sdk-react";
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

  // v6 renumbered the permission ids (e.g. SET_PROJECT_URI 6→7, SET_SPLIT_GROUPS
  // 17→19, ADJUST_721_TIERS 20→24) — resolve per the project's version.
  const hasPermission = useMemo(
    () => (permission: JBPermissionKey) => {
      const permissionId =
        version === 6
          ? JBPermissionIdsV6[permission as keyof typeof JBPermissionIdsV6]
          : JB_PERMISSIONS[permission];
      return permissionId !== undefined && userPermissions.includes(permissionId);
    },
    [userPermissions, version],
  );

  return {
    hasPermission,
    permissions: userPermissions,
    isLoading,
  };
}
