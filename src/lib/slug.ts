import { JB_CHAINS, jbUrn } from "juice-sdk-core";

export function parseSlug(slug: string) {
  const urn = jbUrn(decodeURIComponent(slug.trim()));

  if (!urn?.projectId || !urn?.chainId || !JB_CHAINS[urn.chainId]) {
    throw new Error("Invalid URN");
  }

  return urn;
}
