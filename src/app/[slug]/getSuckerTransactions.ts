import {
  SuckerTransactionsDocument,
  SuckerTransactionsQuery,
  SuckerTransactionsQueryVariables,
} from "@/generated/graphql";
import { getBendystrawClient } from "@/graphql/bendystrawClient";
import { unstable_cache } from "next/cache";

export const getSuckerTransactions = unstable_cache(
  async (suckerGroupId: string, version: number, chainId: number) => {
    try {
      const client = getBendystrawClient(chainId);
      const result = await client.request<
        SuckerTransactionsQuery,
        SuckerTransactionsQueryVariables
      >(SuckerTransactionsDocument, { suckerGroupId, version });
      return result.suckerTransactions?.items ?? [];
    } catch (err) {
      console.error((err as any).message);
      return [];
    }
  },
  ["suckerTransactions"],
  { revalidate: 10 },
);
