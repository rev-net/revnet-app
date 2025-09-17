import { jbUrn } from "juice-sdk-core";

export function parseSlug(slug: string) {
  const urn = jbUrn(decodeURIComponent(slug.trim()));
  if (!urn) throw new Error("Invalid URN");

  return urn;
}
