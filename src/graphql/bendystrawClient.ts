import { GraphQLClient } from "graphql-request";
import { cache } from "react";
import { getBendystrawUrl } from "./constants";

export const getBendystrawClient = cache((chainId: number) => {
  const url = getBendystrawUrl(chainId);
  return new GraphQLClient(`${url}/graphql`);
});
