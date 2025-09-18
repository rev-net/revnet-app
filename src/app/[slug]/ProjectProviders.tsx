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

  return (
    <JBProjectProvider
      {...props}
      ctxProps={{ metadata: { ipfsGatewayHostname: OPEN_IPFS_GATEWAY_HOSTNAME } }}
      bendystraw={{ apiKey: bendystrawUrl[bendystrawUrl.length - 1] }}
    />
  );
}
