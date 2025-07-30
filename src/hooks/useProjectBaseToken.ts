import { useJBChainId, useJBContractContext } from "juice-sdk-react";
import { JBChainId, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { USDC_ADDRESSES } from "@/app/constants";

export type BaseTokenInfo = {
  tokenType: "ETH" | "USDC" | "MIXED";
  symbol: string;
  decimals: number;
  currency: number;
  isNative: boolean;
  targetCurrency: string;
  tokenMap: Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>;
};

export function useProjectBaseToken(): BaseTokenInfo {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();

  // Get the suckerGroupId from the current project
  const { data: projectData, isLoading: projectLoading } = useBendystrawQuery(ProjectDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
  }, {
    enabled: !!chainId && !!projectId,
    pollInterval: 10000
  });
  const suckerGroupId = projectData?.project?.suckerGroupId;

  // Get all projects in the sucker group with their token data
  const { data: suckerGroupData, isLoading: suckerGroupLoading } = useBendystrawQuery(SuckerGroupDocument, {
    id: suckerGroupId ?? "",
  }, {
    enabled: !!suckerGroupId,
    pollInterval: 10000
  });

  // Transform into the format expected by our new hooks pattern
  const tokenMap = suckerGroupData?.suckerGroup?.projects?.items?.reduce((acc, project) => {
    if (project.token) {
      acc[Number(project.chainId) as JBChainId] = {
        token: project.token as `0x${string}`,
        currency: Number(project.currency),
        decimals: project.decimals || NATIVE_TOKEN_DECIMALS
      };
    }
    return acc;
  }, {} as Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>) || {} as Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>;

  // Get all tokens from the map
  const allTokens = Object.values(tokenMap).map(config => config.token).filter(Boolean);
  
  // Check if all chains use the same token type
  const isAllUsdc = allTokens.length > 0 && 
    allTokens.every(token => token && Object.values(USDC_ADDRESSES).map(addr => addr.toLowerCase()).includes(token.toLowerCase()));
  
  const isAllEth = Object.values(tokenMap).every((config: { currency: number }) => config.currency === 1 || config.currency === 61166); // ETH currency ID (handle both old and new)
  
  // Determine token type and configuration
  let tokenType: "ETH" | "USDC" | "MIXED";
  let symbol: string;
  let decimals: number;
  let currency: number;
  let isNative: boolean;
  let targetCurrency: string;

  if (isAllUsdc) {
    tokenType = "USDC";
    symbol = "USD";
    decimals = 6;
    currency = 3; // USD currency ID
    isNative = false;
    targetCurrency = "usd";
  } else if (isAllEth) {
    tokenType = "ETH";
    symbol = "ETH";
    decimals = NATIVE_TOKEN_DECIMALS;
    currency = 1; // ETH currency ID
    isNative = true;
    targetCurrency = "eth";
  } else {
    tokenType = "MIXED";
    symbol = "ETH"; // Default to ETH instead of TOKEN
    decimals = NATIVE_TOKEN_DECIMALS;
    currency = 1; // Default to ETH
    isNative = false;
    targetCurrency = "eth";
  }

  return {
    tokenType,
    symbol,
    decimals,
    currency,
    isNative,
    targetCurrency,
    tokenMap
  };
} 