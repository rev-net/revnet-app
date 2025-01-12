"use client";

import { Nav } from "@/components/layout/Nav";
import { JB_CHAIN_SLUGS, JBChainId } from "juice-sdk-core";
import { Providers } from "./Providers";
import { NetworkDashboard } from "./components/NetworkDashboard/NetworkDashboard";
import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

export default function Page({
  params,
}: {
  params: { chain: string; id: string };
}) {

   const [isLoadingIpfs, setIsLoadingIpfs] = useState<boolean>(false);
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);

    useEffect(() => {
      const load = async () => {
        sdk.actions.ready();
      };
      if (sdk && !isSDKLoaded) {
        setIsSDKLoaded(true);
        load();
      }
    }, [isSDKLoaded]);

  const projectId = BigInt(params.id);
  const chainId = JB_CHAIN_SLUGS[params.chain.toLowerCase()]?.chain
    .id as JBChainId;
  if (!chainId) {
    return <div>JB not deployed on this chain, sorry.</div>;
  }
  return (
    <Providers chainId={chainId} projectId={projectId}>
      <Nav />

      <NetworkDashboard />
    </Providers>
  );
}
