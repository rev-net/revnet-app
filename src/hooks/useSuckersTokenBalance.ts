import {
    getProjectTerminalStore,
    readJbDirectoryPrimaryTerminalOf,
    readJbTerminalStoreBalanceOf,
    JBChainId,
    NATIVE_TOKEN
} from "juice-sdk-core";
import { zeroAddress } from "viem";
import { useConfig } from "wagmi";
import { useQuery } from "wagmi/query";
import {
    useJBChainId,
    useJBContractContext,
    useSuckers
} from "juice-sdk-react";

/**
 * Return the current surplus of JB Native token across each sucker on all chains for the current project.
 */
export function useSuckersTokenBalance(tokens?: Record<number, `0x${string}`>) {
  const config = useConfig();

  const chainId = useJBChainId();
  const { projectId } = useJBContractContext();

  const suckersQuery = useSuckers();
  const pairs = suckersQuery.data;

  // Default tokens map using NATIVE_TOKEN for all chains if not provided
  const defaultTokens = Object.keys(pairs || {}).reduce((acc, chainIdStr) => {
    const chainId = Number(chainIdStr);
    acc[chainId] = NATIVE_TOKEN as `0x${string}`;
    return acc;
  }, {} as Record<number, `0x${string}`>);

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
            readJbDirectoryPrimaryTerminalOf(config, {
              chainId: Number(peerChainId) as JBChainId,
              args: [projectId, token],
            }), // TODO should probably be api'd and cached one day
            getProjectTerminalStore(config, peerChainId, projectId),
          ]);

          const balance = await readJbTerminalStoreBalanceOf(config, {
            chainId: Number(peerChainId) as JBChainId,
            address: store,
            args: [terminal ?? zeroAddress, projectId, token],
          });

          return { balance, chainId: peerChainId, projectId };
        })
      );

      return balances;
    },
  });

  return {
    isLoading: balanceQuery.isLoading || suckersQuery.isLoading,
    isError: balanceQuery.isError || suckersQuery.isError,
    data: balanceQuery.data as
      | { balance: bigint; chainId: number; projectId: bigint }[]
      | undefined,
  };
}