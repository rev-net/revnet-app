"use client";
import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import request from "graphql-request";
import { useJBChainId } from "juice-sdk-react";
import { useEffect } from "react";
import { getBendystrawUrl } from "./constants";

export function useBendystrawQuery<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables, options]: TVariables extends Record<string, never>
    ? [undefined?, { pollInterval?: number; enabled?: boolean }?]
    : [TVariables, { pollInterval?: number; enabled?: boolean }?]
): UseQueryResult<TResult> {
  const chainId = useJBChainId();

  const url = getBendystrawUrl(chainId!);

  const query = useQuery({
    queryKey: [
      (document.definitions[0] as any).name.value,
      chainId, // Include chainId in query key
      variables,
    ],
    queryFn: async ({ queryKey }) => {
      if (!url) throw new Error("No subgraph url");

      return request(
        `${url}/graphql`,
        document,
        queryKey[2] ? queryKey[2] : undefined, // variables is now at index 2
      );
    },
    enabled: options?.enabled !== false && !!chainId && !!url, // Add proper enabling conditions
    retry: 3, // Retry up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  useEffect(() => {
    if (!options?.pollInterval) return;

    const interval = setInterval(() => {
      query.refetch();
    }, options.pollInterval);

    return () => clearInterval(interval);
  }, [options?.pollInterval, query.refetch, query]);

  return query;
}
