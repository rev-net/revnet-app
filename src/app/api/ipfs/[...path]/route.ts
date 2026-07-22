import { OPEN_IPFS_GATEWAY_HOSTNAME } from "@/lib/ipfs";
import { NextRequest } from "next/server";

/**
 * Same-origin IPFS asset cache. Tier media resolves to dozens of cold gateway
 * URLs at once and the upstream gateway throttles parallel browser fetches;
 * fronting it here lets the content — immutable by construction (CIDs) — be
 * cached by the browser, the Next data cache, and any CDN in front of the app.
 */
export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.map(encodeURIComponent).join("/");
  const upstream = await fetch(`https://${OPEN_IPFS_GATEWAY_HOSTNAME}/ipfs/${path}`, {
    // CID content never changes — cache the fetch result server-side forever.
    cache: "force-cache",
  });

  if (!upstream.ok) {
    return new Response(null, { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
