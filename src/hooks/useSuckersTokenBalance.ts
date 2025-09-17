import {
  getPrimaryNativeTerminal,
  getProjectTerminalStore,
  jbTerminalStoreAbi,
  NATIVE_TOKEN,
} from "juice-sdk-core";
import { useJBChainId, useJBContractContext, useSuckers } from "juice-sdk-react";
import { getContract } from "viem";
import { useConfig } from "wagmi";
import { useQuery } from "wagmi/query";

/**
 * Return the current surplus of JB Native token across each sucker on all chains for the current project.
 */
export function useSuckersTokenBalance(tokens?: Record<number, `0x${string}`>) {
  const config = useConfig();

  const chainId = useJBChainId();
  const { projectId, version } = useJBContractContext();

  const { data: pairs = [], isLoading, isError } = useSuckers();

  // Default tokens map using NATIVE_TOKEN for all chains if not provided
  const defaultTokens = Object.keys(pairs || {}).reduce(
    (acc, chainIdStr) => {
      const chainId = Number(chainIdStr);
      acc[chainId] = NATIVE_TOKEN as `0x${string}`;
      return acc;
    },
    {} as Record<number, `0x${string}`>,
  );

  const finalTokens = tokens || defaultTokens;

  const balanceQuery = useQuery({
    queryKey: [
      "suckersNativeTokenBalance",
      projectId.toString(),
      chainId?.toString(),
      pairs?.map((pair: any) => pair.peerChainId).join(","),
    ],
    queryFn: async () => {
      if (!chainId) return null;

      if (!pairs || pairs.length === 0) {
        return [];
      }

      /**
       * For each peer, get its terminal, then get the current surplus.
       */
      const balances = await Promise.all(
        pairs.map(async (pair: any) => {
          const { peerChainId, projectId } = pair;
          const token = finalTokens[peerChainId];
          const [terminal, store] = await Promise.all([
            getPrimaryNativeTerminal(config, peerChainId, projectId, version),
            getProjectTerminalStore(config, peerChainId, projectId, version),
          ]);

          const contract = getContract({
            address: store,
            abi: jbTerminalStoreAbi,
            client: config.getClient({ chainId: peerChainId }),
          });

          const balance = await contract.read.balanceOf([terminal, projectId, token]);

          return { balance, chainId: peerChainId, projectId };
        }),
      );

      return balances;
    },
  });

  return {
    isLoading: balanceQuery.isLoading || isLoading,
    isError: balanceQuery.isError || isError,
    data: balanceQuery.data as
      | { balance: bigint; chainId: number; projectId: bigint }[]
      | undefined,
  };
}
