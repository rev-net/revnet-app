const IPFS_URL_REGEX = /ipfs:\/\/(.+)/;

// This is an open gateway. It exposes any ipfs content, not just the content we pin.
// Use when fetching public content (like images).
export const OPEN_IPFS_GATEWAY_HOSTNAME =
  process.env.NEXT_PUBLIC_INFURA_IPFS_HOSTNAME;

const PUBLIC_IPFS_GATEWAY_HOSTNAME = "ipfs.io";

/**
 * Return a URL to our open IPFS gateway for the given cid USING INFURA.
 *
 * The 'open' gateway returns any content that is available on IPFS,
 * not just the content we have pinned.
 */
export const ipfsGatewayUrl = (cid: string | undefined): string => {
  return `https://${OPEN_IPFS_GATEWAY_HOSTNAME}/ipfs/${cid}`;
};

/**
 * Return a URL to a public IPFS gateway for the given cid
 */
export const ipfsPublicGatewayUrl = (cid: string | undefined): string => {
  return `https://${PUBLIC_IPFS_GATEWAY_HOSTNAME}/ipfs/${cid}`;
};

/**
 * Return an IPFS URI using the IPFS URI scheme.
 */
export function ipfsUri(cid: string, path?: string) {
  return `ipfs://${cid}${path ?? ""}`;
}

/**
 * Return the IPFS CID from a given [url].
 *
 * Assumes that the last path segment is the CID.
 * @todo this isn't a great assumption. We should make this more robust, perhaps using a regex.
 */
export const cidFromUrl = (url: string) => url.split("/").pop();

export const cidFromIpfsUri = (ipfsUri: string) =>
  ipfsUri.match(IPFS_URL_REGEX)?.[1];

/**
 * Returns a native IPFS link (`ipfs://`) as a https link.
 */
export function ipfsUriToGatewayUrl(ipfsUri: string): string {
  if (!isIpfsUri(ipfsUri)) return ipfsUri;

  const suffix = cidFromIpfsUri(ipfsUri);
  return ipfsGatewayUrl(suffix);
}

// Determines if a string is a valid IPFS url.
export function isIpfsUri(url: string) {
  return url.startsWith("ipfs://");
}

export function isIpfsCid(cid: string) {
  return (
    cid.startsWith("Qm") || cid.startsWith("bafy") || cid.startsWith("bafk")
  );
}
