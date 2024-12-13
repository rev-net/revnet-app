import { useQuery } from "@tanstack/react-query";
import {
  NATIVE_CURRENCY_ID,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  readJbDirectoryPrimaryTerminalOf,
  readJbMultiTerminalStore,
  readJbTerminalStoreCurrentReclaimableSurplusOf,
  SuckerPair,
} from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useSuckers,
} from "juice-sdk-react";
import { Address, zeroAddress } from "viem";
import { useConfig } from "wagmi";
import { useTokenCashOutQuoteEth } from "../app/[chain]/[id]/components/UserTokenBalanceCard/useTokenCashOutQuoteEth";
import { JB_REDEEM_FEE_PERCENT } from "@/app/constants";

async function getTokenRedemptionQuote(
  config: ReturnType<typeof useConfig>,
  chainId: JBChainId,
  tokenAmountWei: bigint,
  {
    projectId,
    terminalStore,
  }: {
    projectId: bigint;
    terminalStore: Address;
  }
) {
  return readJbTerminalStoreCurrentReclaimableSurplusOf(config, {
    chainId,
    address: terminalStore,
    args: [
      projectId,
      tokenAmountWei,
      [zeroAddress],
      [],
      BigInt(NATIVE_TOKEN_DECIMALS),
      BigInt(NATIVE_CURRENCY_ID),
    ],
  });
}

export function useSuckersTokenRedemptionQuote(tokenAmountWei: bigint) {
  const config = useConfig();
  const chainId = useJBChainId();
  const { projectId } = useJBContractContext();
  const suckersQuery = useSuckers();
  const pairs = suckersQuery.data as SuckerPair[] | undefined;

  const { data: currentChainQuote, isLoading: isQuoteLoading } =
    useTokenCashOutQuoteEth(tokenAmountWei, {
      chainId,
    });

  const suckersQuote = useQuery({
    queryKey: [
      "suckersTokenRedemptionQuote",
      projectId.toString(),
      chainId?.toString(),
      tokenAmountWei.toString(),
      pairs?.map((pair) => pair.peerChainId).join(","),
    ],
    enabled: Boolean(!isQuoteLoading && !suckersQuery.isLoading && chainId),
    queryFn: async () => {
      if (!chainId) {
        return null;
      }

      const quotes = await Promise.all(
        pairs?.map(async (pair) => {
          const { peerChainId, projectId } = pair;

          const primaryNativeTerminal = await readJbDirectoryPrimaryTerminalOf(
            config,
            {
              chainId: Number(peerChainId) as JBChainId,
              args: [projectId, NATIVE_TOKEN],
            }
          );

          const terminalStore = await readJbMultiTerminalStore(config, {
            chainId: Number(peerChainId) as JBChainId,
            address: primaryNativeTerminal,
          });

          return getTokenRedemptionQuote(config, chainId, tokenAmountWei, {
            projectId,
            terminalStore,
          });
        }) ?? []
      );

      return quotes.reduce((acc, quote) => acc + quote, 0n);
    },
  });

  const grossTotal = suckersQuote.data ?? 0n + (currentChainQuote ?? 0n);
  const fee = (grossTotal * BigInt(JB_REDEEM_FEE_PERCENT * 1000)) / 1000n;
  const netTotal = grossTotal - fee;

  return {
    data: netTotal,
    isLoading:
      isQuoteLoading || suckersQuote.isLoading || suckersQuery.isLoading,
  };
}
