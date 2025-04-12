import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import request from "graphql-request";
import { JBChainId, useJBChainId, useSuckers } from "juice-sdk-react";
import { MAINNET_SUBGRAPH_URLS, TESTNET_SUBGRAPH_URLS } from "./constants";

export function useOmnichainSubgraphQuery<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<
  { status: string; value: { response: TResult; chainId: JBChainId } }[]
> {
  const chainId = useJBChainId();
  const { data: suckers } = useSuckers();

  const mainnets =
    chainId && Object.keys(MAINNET_SUBGRAPH_URLS).includes(chainId.toString());
  const subgraphs = mainnets ? MAINNET_SUBGRAPH_URLS : TESTNET_SUBGRAPH_URLS;

  const currentChainSubgraphUrl = chainId
    ? (subgraphs as any)[chainId]
    : undefined;
  const suckerSubgraphUrls = Object.entries(subgraphs).filter(([chainId]) =>
    suckers?.some((s) => s.peerChainId === parseInt(chainId))
  );

  const resolvedSubgraphUrls =
    suckerSubgraphUrls.length > 0
      ? suckerSubgraphUrls
      : [chainId?.toString(), currentChainSubgraphUrl];

  return useQuery({
    queryKey: [(document.definitions[0] as any).name.value, variables],
    queryFn: async ({ queryKey }) => {
      return Promise.allSettled(
        resolvedSubgraphUrls.map(async ([chainId, url]) => {
          if (!url) {
            throw new Error("No subgraph url for chain: " + chainId);
          }

          /**
           * Patch in projectId for the current chainId
           */
          const projectId = suckers?.find(
            (suckerPair) => suckerPair.peerChainId === parseInt(chainId)
          )?.projectId;
          const _queryKey = [...queryKey];
          if (
            projectId &&
            _queryKey[1].where &&
            "projectId" in _queryKey[1].where
          ) {
            _queryKey[1].where.projectId = projectId;
          }

          const response = await request(
            url,
            document,
            _queryKey[1] ? _queryKey[1] : undefined
          );

          return {
            chainId,
            response,
          };
        })
      );
    },
  });
}
