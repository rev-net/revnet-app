import { GraphQLClient } from "graphql-request";
import { cache } from "react";
import { getBendystrawUrl } from "./constants";

const RETRY_DELAYS_MS = [250, 750];
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

export const bendystrawFetch: typeof fetch = async (input, init) => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (!RETRYABLE_STATUSES.has(response.status) || attempt === RETRY_DELAYS_MS.length) {
        return response;
      }
    } catch (error) {
      const aborted = (error as { name?: string }).name === "AbortError";
      if (aborted || attempt === RETRY_DELAYS_MS.length) throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
  }
};

export const getBendystrawClient = cache((chainId: number) => {
  const url = getBendystrawUrl(chainId);
  return new GraphQLClient(`${url}/graphql`, { fetch: bendystrawFetch });
});
