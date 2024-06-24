import { Nav } from "@/components/layout/Nav";
import { JBChainId } from "juice-sdk-react/dist/contexts/JBChainContext/JBChainContext";
import { optimismSepolia, sepolia } from "viem/chains";
import { Providers } from "./Providers";
import { NetworkDashboard } from "./components/NetworkDashboard/NetworkDashboard";

const chainNameMap: Record<string, JBChainId> = {
  sepolia: sepolia.id,
  opSepolia: optimismSepolia.id,
};

export default function Page({
  params,
}: {
  params: { chain: string; id: string };
}) {
  const projectId = BigInt(params.id);
  const chainId = chainNameMap[params.chain.toLowerCase()];

  return (
    <Providers chainId={chainId} projectId={projectId}>
      <Nav />

      <NetworkDashboard />
    </Providers>
  );
}
