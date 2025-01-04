import { Nav } from "@/components/layout/Nav";
import { JB_CHAIN_SLUGS, JBChainId } from "juice-sdk-core";
import { Providers } from "./Providers";
import { NetworkDashboard } from "./components/NetworkDashboard/NetworkDashboard";

export default function Page({
  params,
}: {
  params: { chain: string; id: string };
}) {
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
