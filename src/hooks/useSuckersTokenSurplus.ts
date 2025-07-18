import {
    readJbDirectoryPrimaryTerminalOf,
    readJbMultiTerminalCurrentSurplusOf,
    JBChainId
} from "juice-sdk-core";

import { useConfig } from "wagmi";
import { useQuery } from "wagmi/query";
import {
    useJBChainId,
    useJBContractContext,
    useSuckers
} from "juice-sdk-react";

/**
 * Return the current surplus of JB token (can be different per chain) across each sucker on all chains for the current project.
 */
export function useSuckersTokenSurplus(
    tokenMap: Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>
  ) {
    const config = useConfig();
  
    const chainId = useJBChainId();
    const { projectId } = useJBContractContext();
  
    const suckersQuery = useSuckers();
    const pairs = suckersQuery.data;

    // Create a stable tokenMap key for the query key
    const tokenMapKey = Object.keys(tokenMap).length > 0 
      ? Object.entries(tokenMap)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([chainId, config]) => `${chainId}:${config.token}:${config.currency}:${config.decimals}`)
          .join(',')
      : 'empty';
  
    const surplusQuery = useQuery({
      queryKey: [
        "suckersTokenSurplus",
        projectId.toString(),
        chainId?.toString(),
        pairs?.map((pair) => pair.peerChainId).join(","),
        tokenMapKey, // Include tokenMap in query key
      ],
      queryFn: async () => {
        if (!chainId) {
          return null;
        }

        if (!pairs || pairs.length === 0) {
          return [];
        }

        if (Object.keys(tokenMap).length === 0) {
          return [];
        }
  
        /**
         * For each peer, get its terminal, then get the current surplus.
         */
        const surpluses = await Promise.all(
          pairs.map(async (pair) => {
            const { peerChainId, projectId } = pair;
            
            const tokenConfig = tokenMap[peerChainId as JBChainId];
            
            if (!tokenConfig) {
              return { surplus: null, chainId: peerChainId, projectId };
            }
            
            const { token, currency, decimals } = tokenConfig;
            
            const terminal = await readJbDirectoryPrimaryTerminalOf(config, {
              chainId: Number(peerChainId) as JBChainId,
              args: [projectId, token],
            });

            let surplus;
            try {
              surplus = await readJbMultiTerminalCurrentSurplusOf(config, {
                chainId: Number(peerChainId) as JBChainId,
                address: terminal,
                args: [
                  projectId,
                  [
                    {
                      token: token,
                      decimals: decimals,
                      currency: currency,
                    },
                  ],
                  BigInt(decimals),
                  BigInt(currency),
                ],
              });
            } catch (error) {
              console.error(`Error getting surplus for chain ${peerChainId}:`, error);
              return { surplus: null, chainId: peerChainId, projectId };
            }

            return { surplus, chainId: peerChainId, projectId };
          })
        );
  
        return surpluses;
      },
      enabled: !!chainId && !!projectId && !!pairs && pairs.length > 0 && Object.keys(tokenMap).length > 0,
      retry: 3, // Retry up to 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      staleTime: 30000, // Consider data stale after 30 seconds
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
  
    return {
      isLoading: surplusQuery.isLoading || suckersQuery.isLoading,
      isError: surplusQuery.isError || suckersQuery.isError,
      data: surplusQuery.data as
        | { surplus: bigint; chainId: JBChainId; projectId: bigint }[]
        | undefined,
    };
  }