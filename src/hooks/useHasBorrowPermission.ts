import { HasPermissionDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { getRevnetLoanContract, JBChainId } from "juice-sdk-core";
import { useJBContractContext } from "juice-sdk-react";

export function useHasBorrowPermission({
  address,
  projectId,
  chainId,
  resolvedPermissionsAddress,
  skip,
}: {
  address?: `0x${string}`;
  projectId: bigint;
  chainId?: JBChainId;
  resolvedPermissionsAddress?: `0x${string}`;
  skip?: boolean;
}) {
  const { version } = useJBContractContext();

  const operator = chainId ? getRevnetLoanContract(version, chainId) : undefined;

  const querySkip =
    skip || !address || !projectId || !chainId || !resolvedPermissionsAddress || !operator;

  const { data } = useBendystrawQuery(HasPermissionDocument, {
    skip: querySkip,
    account: address as string,
    chainId: chainId as number,
    projectId: Number(projectId),
    operator: operator as string,
    version,
  });

  return data?.permissionHolder?.permissions?.includes(1) ?? undefined;
}
