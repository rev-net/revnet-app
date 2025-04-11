"use client";
import { useEffect, useState } from "react";
import { Nav } from "@/components/layout/Nav";
import { JB_CHAINS, JBChainId, jbUrn } from "juice-sdk-core";
import { Providers } from "./Providers";
import { NetworkDashboard } from "./components/NetworkDashboard/NetworkDashboard";

export default function Page({ params }: { params: { slug?: string[] } }) {
  const [projectId, setProjectId] = useState<bigint | undefined>(undefined);
  const [chainId, setChainId] = useState<JBChainId | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      let decoded = "";
      try {
        decoded = decodeURIComponent(params.slug?.[0] ?? "");
      } catch (e) {
        console.error("Failed to decode slug", params.slug?.[0]);
      }
      const urn = jbUrn(decoded);
      if (!urn?.projectId || !urn?.chainId || !JB_CHAINS[urn.chainId]) {
        throw new Error("Invalid URN");
      }
      setProjectId(urn.projectId);
      setChainId(urn.chainId);
    } catch (error) {
      setNotFound(true);
    }
  }, [params.slug]);

  if (notFound) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        Not found
      </div>
    );
  }

  if (!projectId || !chainId) {
    return null;
  }

  return (
    <Providers chainId={chainId} projectId={projectId}>
      <Nav />
      <NetworkDashboard />
    </Providers>
  );
}
