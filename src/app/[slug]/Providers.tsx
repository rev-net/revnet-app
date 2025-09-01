"use client";

import { OPEN_IPFS_GATEWAY_HOSTNAME } from "@/lib/ipfs";
import { JBChainId, JBProjectProvider } from "juice-sdk-react";

export function Providers({
  children,
  projectId,
  chainId,
}: {
  projectId: bigint;
  chainId: JBChainId;
  children: React.ReactNode;
}) {
  return (
    <JBProjectProvider
      chainId={chainId}
      projectId={projectId}
      ctxProps={{
        metadata: { ipfsGatewayHostname: OPEN_IPFS_GATEWAY_HOSTNAME },
      }}
    >
      {children}
    </JBProjectProvider>
  );
}
