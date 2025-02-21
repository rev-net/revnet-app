import { Nav } from "@/components/layout/Nav";
import { jbUrn } from "juice-sdk-core";
import { Providers } from "./Providers";
import { NetworkDashboard } from "./components/NetworkDashboard/NetworkDashboard";

export default function Page({ params }: { params: { jbUrn: string } }) {
  const { projectId, chainId } = jbUrn(decodeURIComponent(params.jbUrn));
  return (
    <Providers chainId={chainId} projectId={projectId}>
      <Nav />

      <NetworkDashboard />
    </Providers>
  );
}
