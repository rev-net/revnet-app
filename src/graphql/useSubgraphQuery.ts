import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import request from "graphql-request";
import { useJBChainId } from "juice-sdk-react";
import {
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  sepolia,
} from "viem/chains";

const URLS = {
  [sepolia.id]: process.env.NEXT_PUBLIC_SEPOLIA_SUBGRAPH_URL,
  [optimismSepolia.id]: process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_SUBGRAPH_URL,
  [baseSepolia.id]: process.env.NEXT_PUBLIC_BASE_SEPOLIA_SUBGRAPH_URL,
  [arbitrumSepolia.id]: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_SUBGRAPH_URL,
};

export function useSubgraphQuery<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<TResult> {
  const chainId = useJBChainId() ?? sepolia.id; // TODO maybe make this an argument one day?

  return useQuery({
    queryKey: [(document.definitions[0] as any).name.value, variables],
    queryFn: async ({ queryKey }) => {
      const url = URLS[chainId];
      if (!url) {
        throw new Error("No subgraph url for chain: " + chainId);
      }

      return request(url, document, queryKey[1] ? queryKey[1] : undefined);
    },
  });
}
