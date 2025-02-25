import { Nav } from "@/components/layout/Nav";
import { JB_CHAINS, JBChainId, jbUrn } from "juice-sdk-core";
import { Providers } from "./Providers";
import { NetworkDashboard } from "./components/NetworkDashboard/NetworkDashboard";

export default function Page({ params }: { params: { jbUrn: string } }) {
  let projectId: bigint | undefined;
  let chainId: JBChainId | undefined;
  try {
    const urn = jbUrn(decodeURIComponent(params.jbUrn));
    projectId = urn?.projectId;
    chainId = urn?.chainId;

    if (!projectId || !chainId || !JB_CHAINS[chainId]) {
      throw new Error("Invalid URN");
    }
  } catch (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        Not found
      </div>
    );
  }

  return (
    <Providers chainId={chainId} projectId={projectId}>
      <Nav />

      <NetworkDashboard />
    </Providers>
  );
}
