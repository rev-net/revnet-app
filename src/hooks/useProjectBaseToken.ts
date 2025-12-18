import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { isNativeToken, Token } from "@/lib/token";
import { JBChainId, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { useBendystrawQuery, useJBChainId, useJBContractContext } from "juice-sdk-react";

type ReturnData = Token & { tokenMap: Record<JBChainId, Token> };

export function useProjectBaseToken(): ReturnData | undefined {
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();

  const { data } = useBendystrawQuery(
    ProjectDocument,
    { chainId: Number(chainId), projectId: Number(projectId), version },
    { enabled: !!chainId && !!projectId, pollInterval: 30000 },
  );

  const { data: suckerGroupData } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: data?.project?.suckerGroupId ?? "" },
    { enabled: !!data?.project?.suckerGroupId, pollInterval: 30000 },
  );

  if (!data?.project) return undefined;
  const { project } = data;

  const tokenMap =
    suckerGroupData?.suckerGroup?.projects?.items?.reduce(
      (acc, project) => {
        if (project.token) {
          acc[Number(project.chainId) as JBChainId] = {
            address: project.token as `0x${string}`,
            symbol: project.tokenSymbol!,
            isNative: isNativeToken(project.token),
            decimals: project.decimals || NATIVE_TOKEN_DECIMALS,
          };
        }
        return acc;
      },
      {} as Record<JBChainId, Token>,
    ) || ({} as Record<JBChainId, Token>);

  return {
    symbol: project.tokenSymbol!,
    decimals: project.decimals!,
    isNative: isNativeToken(project.token),
    address: project.token as `0x${string}`,
    tokenMap,
  };
}
