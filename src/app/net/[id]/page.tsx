import { Nav } from "@/components/layout/Nav";
import { Providers } from "./Providers";
import { NetworkDashboard } from "./components/NetworkDashboard/NetworkDashboard";

export default function Page({ params }: { params: { id: string } }) {
  const projectId = BigInt(params.id);

  return (
    <Providers projectId={projectId}>
      <Nav />

      <NetworkDashboard />
    </Providers>
  );
}
