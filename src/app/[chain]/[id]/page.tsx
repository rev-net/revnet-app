import { chainNameMap } from "@/app/constants";
import { Nav } from "@/components/layout/Nav";
import { Providers } from "./Providers";
import { NetworkDashboard } from "./components/NetworkDashboard/NetworkDashboard";

export default function Page({
  params,
}: {
  params: { chain: string; id: string };
}) {
  const projectId = BigInt(params.id);
  const chainId = chainNameMap[params.chain.toLowerCase()];

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
