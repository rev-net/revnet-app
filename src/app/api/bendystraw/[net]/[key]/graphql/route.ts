import { bendystrawFetch } from "@/graphql/bendystrawClient";
import { NextRequest } from "next/server";

/**
 * Same-origin proxy for the SDK's client-side bendystraw queries.
 *
 * The public bendystraw endpoints answer browsers with a fixed
 * Access-Control-Allow-Origin allowlist, so direct client-side queries are
 * CORS-blocked from any origin not on it (localhost included) — while
 * server-side fetches work fine. Routing the browser's queries through this
 * route keeps them same-origin, matching how juicebox-money-v6 talks to
 * bendystraw (server-side fetch).
 *
 * URL shape (the SDK builds `<url>/<apiKey>` then appends `/graphql`):
 *   /api/bendystraw/<mainnet|testnet>/<key|public>/graphql
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { net: string; key: string } },
) {
  const base =
    params.net === "testnet" ? "https://testnet.bendystraw.xyz" : "https://bendystraw.xyz";
  const keyPath = params.key && params.key !== "public" ? `/${params.key}` : "";

  const upstream = await bendystrawFetch(`${base}${keyPath}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: await req.text(),
    // GraphQL responses are query-specific; let the client's own cache policy rule.
    cache: "no-store",
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
}
