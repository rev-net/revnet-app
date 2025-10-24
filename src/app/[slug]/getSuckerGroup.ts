import {
  SuckerGroupDocument,
  SuckerGroupQuery,
  SuckerGroupQueryVariables,
} from "@/generated/graphql";
import { getBendystrawClient } from "@/graphql/bendystrawClient";
import { unstable_cache } from "next/cache";

export const getSuckerGroup = unstable_cache(
  async (suckerGroupId: string, chainId: number) => {
    try {
      const client = getBendystrawClient(chainId);
      const result = await client.request<SuckerGroupQuery, SuckerGroupQueryVariables>(
        SuckerGroupDocument,
        { id: suckerGroupId },
      );
      return result.suckerGroup;
    } catch (err) {
      console.error((err as any).message);
      return null;
    }
  },
  ["getSuckerGroup"],
  { revalidate: 15 },
);
