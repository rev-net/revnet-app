import {
  JBChainId,
} from "juice-sdk-react";
import { revLoansAddress } from "revnet-sdk";
import { HasPermissionDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";

export function useHasBorrowPermission({
  address,
  projectId,
  chainId,
  resolvedPermissionsAddress,
  skip,
}: {
  address?: `0x${string}`;
  projectId: bigint;
  chainId?: number;
  resolvedPermissionsAddress?: `0x${string}`;
  skip?: boolean;
}) {
  const operator = chainId ? revLoansAddress[chainId as JBChainId] : undefined;
  const querySkip =
    skip ||
    !address ||
    !projectId ||
    !chainId ||
    !resolvedPermissionsAddress ||
    !operator;

  const { data } = useBendystrawQuery(HasPermissionDocument, {
    skip: querySkip,
    account: address as string,
    chainId: chainId as number,
    projectId: Number(projectId),
    operator: operator as string,
  });

  return data?.permissionHolder?.permissions?.includes(1) ?? undefined;
}
