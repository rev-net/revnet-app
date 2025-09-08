import { USDC_ADDRESSES } from "@/app/constants";
import { NATIVE_TOKEN } from "juice-sdk-core";

/**
 * Get token symbol from token address
 * @param tokenAddress - The token address to resolve
 * @returns The token symbol (ETH, USDC, or TOKEN as fallback)
 */
export function getTokenSymbolFromAddress(tokenAddress: string) {
  // Check for ETH (case insensitive)
  if (tokenAddress?.toLowerCase() === NATIVE_TOKEN.toLowerCase()) {
    return "ETH";
  }

  // Check for USDC (case insensitive)
  const isUsdc = Object.values(USDC_ADDRESSES)
    .map((addr) => addr.toLowerCase())
    .includes(tokenAddress?.toLowerCase() as `0x${string}`);

  if (isUsdc) return "USDC";

  return "TOKEN";
}

/**
 * Token configuration for a specific chain
 */
export interface TokenConfig {
  token: `0x${string}`;
  currency: number;
  decimals: number;
}

/**
 * Get token configuration for a specific chain from sucker group data
 * @param suckerGroupData - The sucker group data containing projects
 * @param targetChainId - The target chain ID
 * @returns Token configuration for the chain
 */
export function getTokenConfigForChain(suckerGroupData: any, targetChainId: number): TokenConfig {
  if (!suckerGroupData?.suckerGroup?.projects?.items) {
    return {
      token: NATIVE_TOKEN.toLowerCase() as `0x${string}`,
      currency: 1,
      decimals: 18,
    };
  }

  const projectForChain = suckerGroupData.suckerGroup.projects.items.find(
    (project: any) => project.chainId === targetChainId,
  );

  if (projectForChain?.token) {
    return {
      token: projectForChain.token as `0x${string}`,
      currency: Number(projectForChain.currency),
      decimals: projectForChain.decimals || 18,
    };
  }

  return {
    token: NATIVE_TOKEN.toLowerCase() as `0x${string}`,
    currency: 1,
    decimals: 18,
  };
}
