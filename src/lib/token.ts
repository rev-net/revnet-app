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
} from "juice-sdk-core";
import { formatUnits, getContract, PublicClient } from "viem";

export interface Token {
  symbol: string;
  address: `0x${string}`;
  isNative: boolean;
  decimals: number;
}

export function getTokensForChain(chainId: JBChainId | undefined): Token[] {
  if (!chainId) return [];

  const tokens: Token[] = [
    {
      symbol: DEFAULT_NATIVE_TOKEN_SYMBOL,
      address: NATIVE_TOKEN as `0x${string}`,
      isNative: true,
      decimals: NATIVE_TOKEN_DECIMALS,
    },
  ];

  const usdcAddress = USDC_ADDRESSES[chainId];
  if (usdcAddress) {
    tokens.push({
      symbol: "USDC",
      address: usdcAddress,
      isNative: false,
      decimals: 6,
    });
  }

  return tokens;
}

export function formatTokenAmount(amount: bigint, token: Pick<Token, "symbol" | "decimals">) {
  const formatted = formatUnits(amount, token.decimals);
  const { minimumFractionDigits, maximumFractionDigits } = getTokenFractionDigits(token);
  return Number(formatted).toLocaleString("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

function getTokenFractionDigits(token: Pick<Token, "symbol" | "decimals">) {
  if (token.symbol === "USDC")
    return { minimumFractionDigits: 2, maximumFractionDigits: 2 } as const;
  if (token.symbol === "ETH")
    return { minimumFractionDigits: 0, maximumFractionDigits: 4 } as const;
  return { minimumFractionDigits: 0, maximumFractionDigits: 2 } as const;
}

export async function getTokenAddress(
  client: PublicClient,
  chainId: JBChainId,
  projectId: number,
  version: JBVersion,
) {
  const jbTokens = getContract({
    address: getJBContractAddress(JBCoreContracts.JBTokens, version, chainId),
    abi: jbTokensAbi,
    client,
  });

  return await jbTokens.read.tokenOf([BigInt(projectId)]);
}
