import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { UserTokenBalancesDocument } from "@/generated/graphql";

export function useUserTokenBalancesBendy(suckerGroupId: string | undefined, userAddress: string | undefined) {
  const enabled = !!suckerGroupId && !!userAddress;
  const { data, isLoading, isError, refetch } = useBendystrawQuery(
    UserTokenBalancesDocument,
    {
      suckerGroupId: suckerGroupId!,
      userAddress: userAddress!,
    },
    {
      enabled,
      pollInterval: 10000, // Poll every 10 seconds for freshness
    }
  );

  // Flatten balances for easier consumption
  const projects = data?.suckerGroup?.projects?.items || [];
  const balances = projects.map((project) => ({
    chainId: project.chainId,
    projectId: project.projectId,
    decimals: project.decimals,
    currency: project.currency,
    projectBalance: project.balance,
    userBalance: project.participants?.items?.[0]?.balance ?? "0",
    userAddress: project.participants?.items?.[0]?.address,
  }));

  return {
    balances,
    isLoading,
    isError,
    refetch,
    raw: data,
  };
}