import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import request from "graphql-request";
import { useJBChainId } from "juice-sdk-react";
import { sepolia } from "viem/chains";
import { SUBGRAPH_URLS } from "./constants";

export function useSubgraphQuery<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<TResult> {
  const chainId = useJBChainId() ?? sepolia.id; // TODO maybe make this an argument one day?

  return useQuery({
    queryKey: [(document.definitions[0] as any).name.value, variables],
    queryFn: async ({ queryKey }) => {
      const url = SUBGRAPH_URLS[chainId];
      if (!url) {
        throw new Error("No subgraph url for chain: " + chainId);
      }

      return request(url, document, queryKey[1] ? queryKey[1] : undefined);
    },
  });
}
