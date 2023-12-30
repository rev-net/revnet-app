import { Providers } from "./Providers";
import { NetworkDashboard } from "./components/NetworkDashboard";

// TODO update from subby
export function generateStaticParams() {
  return [
    {
      id: "1",
    },
  ];
}

export default function Page({ params }: { params: { id: string } }) {
  const projectId = BigInt(params.id);

  return (
    <Providers projectId={projectId}>
      <NetworkDashboard />
    </Providers>
  );
}
