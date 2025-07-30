import { JBChainId, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { SuckerGroupDocument } from "@/generated/graphql";
import { USDC_ADDRESSES } from "@/app/constants";

/**
 * Hook to get all available currencies and their balances across chains in a sucker group
 * This provides the foundation for multi-chain balance calculations
 */
export function useAvailableCurrencies(suckerGroupId?: string) {
  const { data: suckerGroupData, isLoading } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: suckerGroupId ?? "" },
    {
      enabled: !!suckerGroupId,
      pollInterval: 10000, // Poll every 10 seconds
    }
  );

  // Transform projects into token map
  const tokenMap = suckerGroupData?.suckerGroup?.projects?.items?.reduce((acc, project) => {
    if (project.token) {
      acc[Number(project.chainId) as JBChainId] = {
        token: project.token as `0x${string}`,
        currency: Number(project.currency),
        decimals: project.decimals || NATIVE_TOKEN_DECIMALS,
      };
    }
    return acc;
  }, {} as Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>) || {} as Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>;

  // Transform projects into surpluses
  const surpluses = suckerGroupData?.suckerGroup?.projects?.items?.map((project) => ({
    surplus: BigInt(project.balance || 0),
    chainId: project.chainId as JBChainId,
    projectId: BigInt(project.projectId),
  })) || [];

  // Get all unique tokens
  const allTokens = surpluses
    ?.map((surplus) => {
      const tokenConfig = tokenMap?.[surplus.chainId];
      return tokenConfig?.token;
    })
    .filter(Boolean);

  // Check if all tokens are USDC
  const isAllUsdc =
    allTokens &&
    allTokens.length > 0 &&
    allTokens.every((token) => {
      const tokenLower = token?.toLowerCase() as `0x${string}`;
      const usdcAddressesLower = Object.values(USDC_ADDRESSES).map((addr) =>
        addr.toLowerCase()
      );
      return usdcAddressesLower.includes(tokenLower);
    });

  // Check if all tokens are ETH
  const isAllEth = surpluses?.every((surplus) => {
    const tokenConfig = tokenMap?.[surplus.chainId];
    return tokenConfig?.currency === 1 || tokenConfig?.currency === 61166; // ETH currency ID (handle both old and new)
  });

  // Determine target currency and decimals
  const targetDecimals = isAllUsdc ? 6 : NATIVE_TOKEN_DECIMALS;
  const targetCurrency = isAllUsdc ? "USD" : isAllEth ? "ETH" : "TOKEN";

  return {
    tokenMap,
    surpluses,
    isLoading,
    isAllUsdc,
    isAllEth,
    targetCurrency,
    targetDecimals,
    allTokens,
  };
} 