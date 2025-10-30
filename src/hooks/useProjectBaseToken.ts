import { USDC_ADDRESSES } from "@/app/constants";
import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { ETH_CURRENCY_ID, JBChainId, NATIVE_TOKEN_DECIMALS, USD_CURRENCY_ID } from "juice-sdk-core";
import { useBendystrawQuery, useJBChainId, useJBContractContext } from "juice-sdk-react";

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
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();

  // Get the suckerGroupId from the current project
  const { data: projectData } = useBendystrawQuery(
    ProjectDocument,
    { chainId: Number(chainId), projectId: Number(projectId), version },
    { enabled: !!chainId && !!projectId, pollInterval: 30000 },
  );
  const suckerGroupId = projectData?.project?.suckerGroupId;

  // Get all projects in the sucker group with their token data
  const { data: suckerGroupData } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: suckerGroupId ?? "" },
    { enabled: !!suckerGroupId, pollInterval: 30000 },
  );

  // Transform into the format expected by useSuckersTokenSurplus
  const tokenMap =
    suckerGroupData?.suckerGroup?.projects?.items?.reduce(
      (acc, project) => {
        if (project.token) {
          acc[Number(project.chainId) as JBChainId] = {
            token: project.token as `0x${string}`,
            currency: Number(project.currency),
            decimals: project.decimals || NATIVE_TOKEN_DECIMALS,
          };
        }
        return acc;
      },
      {} as Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>,
    ) || ({} as Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>);

  // Get all tokens from the map
  const allTokens = Object.values(tokenMap)
    .map((config) => config.token)
    .filter(Boolean);

  // Check if all chains use the same token type
  const isAllUsdc =
    allTokens.length > 0 &&
    allTokens.every(
      (token) =>
        token &&
        Object.values(USDC_ADDRESSES)
          .map((addr) => addr.toLowerCase())
          .includes(token.toLowerCase()),
    );

  const isAllEth = Object.values(tokenMap).every(
    (config: { currency: number }) => config.currency === 1 || config.currency === 61166,
  ); // ETH currency ID (handle both old and new)

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
    currency = USD_CURRENCY_ID(version);
    isNative = false;
    targetCurrency = "usd";
  } else if (isAllEth) {
    tokenType = "ETH";
    symbol = "ETH";
    decimals = NATIVE_TOKEN_DECIMALS;
    currency = ETH_CURRENCY_ID;
    isNative = true;
    targetCurrency = "eth";
  } else {
    tokenType = "MIXED";
    symbol = "ETH"; // Default to ETH instead of TOKEN
    decimals = NATIVE_TOKEN_DECIMALS;
    currency = ETH_CURRENCY_ID;
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
    tokenMap,
  };
}
