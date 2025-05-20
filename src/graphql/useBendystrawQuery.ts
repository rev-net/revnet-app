import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import request from "graphql-request";
import { useJBChainId } from "juice-sdk-react";
import { arbitrum, base, mainnet, optimism } from "viem/chains";

const bendystrawUrl = process.env.NEXT_PUBLIC_BENDYSTRAW_URL;
const testnetBendystrawUrl = process.env.NEXT_PUBLIC_TESTNET_BENDYSTRAW_URL;

import { useEffect } from "react";

export function useBendystrawQuery<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables, options]: TVariables extends Record<string, never>
    ? [undefined?, { pollInterval?: number; enabled?: boolean }?]
    : [TVariables, { pollInterval?: number; enabled?: boolean }?]
): UseQueryResult<TResult> {
  const chainId = useJBChainId();

  const isMainnet = [mainnet, base, arbitrum, optimism].some(
    (c) => c.id === chainId
  );

  const url = isMainnet ? bendystrawUrl : testnetBendystrawUrl;

  const query = useQuery({
    queryKey: [(document.definitions[0] as any).name.value, variables],
    queryFn: async ({ queryKey }) => {
      if (!url) throw new Error("No subgraph url");

      return request(
        `${url}/graphql`,
        document,
        queryKey[1] ? queryKey[1] : undefined
      );
    },
  });

  useEffect(() => {
    if (!options?.pollInterval) return;

    const interval = setInterval(() => {
      query.refetch();
    }, options.pollInterval);

    return () => clearInterval(interval);
  }, [options?.pollInterval, query.refetch]);

  return query;
}
