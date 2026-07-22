import {
  DEFAULT_NATIVE_TOKEN_SYMBOL,
  getJBContractAddress,
  JBChainId,
  JBCoreContracts,
  jbTokensAbi,
  JBVersion,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  USDC_ADDRESSES,
} from "@bananapus/nana-sdk-core";
import { formatUnits, getContract } from "viem";
import { isUsd } from "./currency";
import { getViemPublicClient } from "./wagmiConfig";

export interface Token {
  symbol: string;
  address: `0x${string}`;
  isNative: boolean;
  decimals: number;
}

export function getTokensForChain(chainId: JBChainId | undefined, version?: JBVersion): Token[] {
  if (!chainId) return [];

  const tokens: Token[] = [
    {
      symbol: DEFAULT_NATIVE_TOKEN_SYMBOL,
      address: NATIVE_TOKEN as `0x${string}`,
      isNative: true,
      decimals: NATIVE_TOKEN_DECIMALS,
    },
  ];

  // USDC is only offered as a cross-token payment on v6, where the router terminal
  // registry accepts any token; a v5 project paid in USDC still gets it via its own
  // base token (see PayForm's token selection).
  if (version === 6) {
    const usdcAddress = USDC_ADDRESSES[chainId];
    if (usdcAddress) {
      tokens.push({
        symbol: "USDC",
        address: usdcAddress,
        isNative: false,
        decimals: 6,
      });
    }
  }

  return tokens;
}

export function formatTokenAmount(amount: bigint, token: Pick<Token, "symbol" | "decimals">) {
  const formatted = formatUnits(amount, token.decimals);
  return Number(formatted).toLocaleString("en-US", getTokenFractionDigits(token.symbol));
}

export function getTokenFractionDigits(symbol: string) {
  if (isUsd(symbol)) {
    return { minimumFractionDigits: 2, maximumFractionDigits: 2 } as const;
  }
  if (symbol === "ETH") {
    return { minimumFractionDigits: 0, maximumFractionDigits: 4 } as const;
  }
  return { minimumFractionDigits: 0, maximumFractionDigits: 2 } as const;
}

export function isNativeToken(address: string | null) {
  return address?.toLowerCase() === NATIVE_TOKEN.toLowerCase();
}

export const getTokenAddress = async (
  chainId: JBChainId,
  projectId: number,
  version: JBVersion,
) => {
  const client = getViemPublicClient(chainId);

  const jbTokens = getContract({
    address: getJBContractAddress(JBCoreContracts.JBTokens, version, chainId),
    abi: jbTokensAbi,
    client,
  });

  return await jbTokens.read.tokenOf([BigInt(projectId)]);
};
