import { JB_REDEEM_FEE_PERCENT } from "@/app/constants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  NATIVE_CURRENCY_ID,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  readJbDirectoryPrimaryTerminalOf,
  readJbTerminalStoreCurrentReclaimableSurplusOf,
  SuckerPair,
} from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useSuckers,
} from "juice-sdk-react";
import { useConfig } from "wagmi";

/**
 * Return the amount of ETH (wei) received from cashing out [tokenAmountWei] project tokens, across all suckers.
 * @param tokenAmountWei the amount of tokens to cash out.
 */
export function useSuckersCashOutQuote(tokenAmountWei: bigint) {
  const config = useConfig();
  const chainId = useJBChainId();
  const { projectId } = useJBContractContext();

  const suckersQuery = useSuckers();
  const pairs = (suckersQuery.data as { suckers: SuckerPair[] | null })
    ?.suckers;

  const queryKey = [
    "suckersTokenRedemptionQuote",
    projectId.toString(),
    chainId?.toString(),
    tokenAmountWei.toString(),
    pairs?.map((pair) => pair.peerChainId).join(","),
  ];

  const suckersQuote = useQuery({
    queryKey,
    staleTime: 10000,
    enabled: Boolean(!suckersQuery.isLoading && chainId),
    queryFn: async () => {
      if (!chainId) {
        return null;
      }

      const quotes = await Promise.all(
        pairs?.map(async ({ peerChainId, projectId }) => {
          return getTokenRedemptionQuote(
            config,
            peerChainId as JBChainId,
            projectId,
            tokenAmountWei
          );
        }) ?? []
      );

      return quotes.reduce((acc, quote) => acc + quote, 0n);
    },
  });

  const grossTotal = suckersQuote.data ?? 0n;
  const fee = (grossTotal * BigInt(JB_REDEEM_FEE_PERCENT * 1000)) / 1000n;
  const netTotal = grossTotal - fee;

  return {
    data: netTotal,
    isLoading: suckersQuote.isLoading || suckersQuery.isLoading,
    errors: [suckersQuery.error, suckersQuote.error].filter(Boolean),
  };
}

async function getTokenRedemptionQuote(
  config: ReturnType<typeof useConfig>,
  chainId: JBChainId,
  projectId: bigint,
  tokenAmountWei: bigint
) {
  const terminalStore = await getProjectTerminalStore(
    config,
    chainId,
    projectId
  );
  return await readJbTerminalStoreCurrentReclaimableSurplusOf(config, {
    chainId,
    address: terminalStore,
    args: [
      projectId,
      tokenAmountWei,
      [],
      [],
      BigInt(NATIVE_TOKEN_DECIMALS),
      BigInt(NATIVE_CURRENCY_ID),
    ],
  });
}

async function getProjectTerminalStore(
  config: ReturnType<typeof useConfig>,
  chainId: JBChainId,
  projectId: bigint
) {
  const primaryNativeTerminal = await readJbDirectoryPrimaryTerminalOf(config, {
    chainId: Number(chainId) as JBChainId,
    args: [projectId, NATIVE_TOKEN],
  });
  const terminalStoreData = await axios.get(
    `https://sepolia.juicebox.money/api/juicebox/v4/terminal/${primaryNativeTerminal}/jb-terminal-store?chainId=${chainId}`
  );
  const terminalStore = terminalStoreData.data.terminalStoreAddress;

  return terminalStore;
}
