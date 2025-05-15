import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import request from "graphql-request";
import { useJBChainId } from "juice-sdk-react";
import { arbitrum, base, mainnet, optimism } from "viem/chains";

const bendystrawUrl = process.env.NEXT_PUBLIC_BENDYSTRAW_URL;
const testnetBendystrawUrl = process.env.NEXT_PUBLIC_TESTNET_BENDYSTRAW_URL;

export function useBendystrawQuery<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<TResult> {
  const chainId = useJBChainId();

  const isMainnet = [mainnet, base, arbitrum, optimism].some(
    (c) => c.id === chainId
  );

  const url = isMainnet ? bendystrawUrl : testnetBendystrawUrl;

  return useQuery({
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
}
