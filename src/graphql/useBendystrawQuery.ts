import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import request from "graphql-request";

const bendystrawUrl = process.env.NEXT_PUBLIC_BENDYSTRAW_URL;

export function useBendystrawQuery<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<TResult> {
  return useQuery({
    queryKey: [(document.definitions[0] as any).name.value, variables],
    queryFn: async ({ queryKey }) => {
      if (!bendystrawUrl) {
        throw new Error("No subgraph url");
      }

      return request(
        bendystrawUrl,
        document,
        queryKey[1] ? queryKey[1] : undefined
      );
    },
  });
}
