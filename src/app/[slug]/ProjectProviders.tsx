"use client";

import { OPEN_IPFS_GATEWAY_HOSTNAME } from "@/lib/ipfs";
import { JBChainId, JBProjectProvider, JBVersion } from "@bananapus/nana-sdk-react";
import { PropsWithChildren } from "react";

const TESTNET_CHAIN_IDS = new Set([11155111, 11155420, 84532, 421614]);

export function ProjectProviders(
  props: PropsWithChildren<{
    projectId: bigint;
    chainId: JBChainId;
    version: JBVersion;
  }>,
) {
  const bendystrawUrl = `${process.env.NEXT_PUBLIC_BENDYSTRAW_URL}`.split("/");

  // Extract API key: if URL ends with domain only, return empty string
  // If URL has a path after domain, use that as the API key
  const apiKey =
    bendystrawUrl.length > 3 && bendystrawUrl[bendystrawUrl.length - 1]
      ? bendystrawUrl[bendystrawUrl.length - 1]
      : "";

  // The public bendystraw endpoints CORS-block browsers from non-allowlisted
  // origins, so client-side queries go through our same-origin proxy (which
  // forwards server-side, like juicebox-money-v6 does). The SDK builds
  // `<url>/<apiKey>` + `/graphql`, so "public" stands in for a missing key.
  const net = TESTNET_CHAIN_IDS.has(Number(props.chainId)) ? "testnet" : "mainnet";
  // graphql-request rejects relative URLs, so anchor the proxy to the page origin
  // (queries only run client-side; the SSR value is never fetched).
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <JBProjectProvider
      {...props}
      ctxProps={{ metadata: { ipfsGatewayHostname: OPEN_IPFS_GATEWAY_HOSTNAME } }}
      bendystraw={{ apiKey: apiKey || "public", url: `${origin}/api/bendystraw/${net}` }}
    />
  );
}
