import { useQuery } from "@tanstack/react-query";
import {
  getTokenRedemptionQuoteEth,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  readJbControllerPendingReservedTokenBalanceOf,
  readJbDirectoryControllerOf,
  readJbDirectoryPrimaryTerminalOf,
  readJbMultiTerminalCurrentSurplusOf,
  readJbTokensTotalSupplyOf,
  SuckerPair,
} from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useJBRulesetContext,
  useSuckers,
} from "juice-sdk-react";
import { Address } from "viem";
import { useConfig } from "wagmi";
import { useTokenRedemptionQuote } from "./useTokenRedemptionQuoteEth";

/**
 *
 * @note can perf optimize this by moving terminal and controller calls to API endpoints, 
 * and caching for longtime (their static addresses mostly)
 */
async function getTokenRedemptionQuote(
  config: ReturnType<typeof useConfig>,
  chainId: JBChainId,
  tokenAmountWei: bigint,
  {
    projectId,
    // redemption rate assumed to be the same across all chains
    redemptionRate,
    controller,
    primaryNativeTerminal,
  }: {
    projectId: bigint;
    redemptionRate: bigint;
    controller: Address;
    primaryNativeTerminal: Address;
  }
) {
  const [totalSupply, pendingReservedTokens, nativeTokenSurplus] =
    await Promise.all([
      readJbTokensTotalSupplyOf(config, {
        chainId,
        args: [projectId],
      }),
      readJbControllerPendingReservedTokenBalanceOf(config, {
        chainId,
        address: controller,
        args: [projectId],
      }),
      readJbMultiTerminalCurrentSurplusOf(config, {
        chainId,
        address: primaryNativeTerminal ?? undefined,
        args: [projectId, BigInt(NATIVE_TOKEN_DECIMALS), BigInt(NATIVE_TOKEN)],
      }),
    ]);

  return getTokenRedemptionQuoteEth(tokenAmountWei, {
    redemptionRate: Number(redemptionRate),
    totalSupply,
    tokensReserved: pendingReservedTokens,
    overflowWei: nativeTokenSurplus,
  });
}

export function useSuckersTokenRedemptionQuote(tokenAmountWei: bigint) {
  const suckersQuery = useSuckers();
  const pairs = suckersQuery.data as SuckerPair[] | undefined;
  const config = useConfig();

  const chainId = useJBChainId();
  const { projectId } = useJBContractContext();
  const { rulesetMetadata } = useJBRulesetContext();

  const currentChainQuote = useTokenRedemptionQuote(tokenAmountWei, {
    chainId,
  });

  return useQuery({
    queryKey: [
      "suckersTokenRedemptionQuote",
      projectId.toString(),
      chainId?.toString(),
      tokenAmountWei.toString(),
      pairs?.map((pair) => pair.peerChainId).join(","),
    ],
    queryFn: async () => {
      if (!chainId) return null;

      const quotes = await Promise.all(
        pairs?.map(async (pair) => {
          const { peerChainId, projectId } = pair;

          const controller = await readJbDirectoryControllerOf(config, {
            chainId: Number(peerChainId) as JBChainId,
            args: [projectId],
          });

          const primaryNativeTerminal = await readJbDirectoryPrimaryTerminalOf(
            config,
            {
              chainId: Number(peerChainId) as JBChainId,
              args: [projectId, NATIVE_TOKEN],
            }
          );

          return getTokenRedemptionQuote(config, chainId, 0n, {
            projectId,
            redemptionRate: rulesetMetadata.data?.redemptionRate?.value ?? 0n,
            controller: controller,
            primaryNativeTerminal: primaryNativeTerminal,
          });
        }) ?? []
      );

      const sum = quotes.reduce((acc, quote) => acc + quote, 0n);

      return sum + (currentChainQuote ?? 0n);
    },
  });
}
