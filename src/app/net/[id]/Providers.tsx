"use client";

import { OPEN_IPFS_GATEWAY_HOSTNAME } from "@/lib/ipfs";
import { JBProjectProvider } from "juice-sdk-react";

export function Providers({
  children,
  projectId,
}: {
  projectId: bigint;
  children: React.ReactNode;
}) {
  return (
    <JBProjectProvider
      projectId={projectId}
      ctxProps={{
        metadata: { ipfsGatewayHostname: OPEN_IPFS_GATEWAY_HOSTNAME },
      }}
    >
      {children}
    </JBProjectProvider>
  );
}
