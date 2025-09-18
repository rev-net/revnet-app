"use client";

import { OPEN_IPFS_GATEWAY_HOSTNAME } from "@/lib/ipfs";
import { JBChainId, JBProjectProvider, JBVersion } from "juice-sdk-react";
import { PropsWithChildren } from "react";

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

  return (
    <JBProjectProvider
      {...props}
      ctxProps={{ metadata: { ipfsGatewayHostname: OPEN_IPFS_GATEWAY_HOSTNAME } }}
      bendystraw={{ apiKey }}
    />
  );
}
