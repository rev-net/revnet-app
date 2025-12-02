import { parseSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import { getProject } from "../getProject";
import { CurrentIssuanceSection } from "./components/CurrentIssuanceSection";
import { IssuancePriceChart } from "./components/IssuancePriceChart/IssuancePriceChart";
import { RangeSelector } from "./components/RangeSelector";
import { StagesTable } from "./components/StagesTable";
import { getRulesets } from "./getRulesets";

interface Props {
  params: { slug: string };
}

export default async function Terms({ params }: Props) {
  const { chainId, projectId, version } = parseSlug(params.slug);

  const project = await getProject(projectId, chainId, version);
  if (!project) notFound();

  const rulesets = await getRulesets(projectId.toString(), chainId, version);

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-500 mb-1">Token Issuance</h3>
          <CurrentIssuanceSection />
        </div>
        <RangeSelector />
      </div>
      <IssuancePriceChart rulesets={rulesets} />
      <StagesTable rulesets={rulesets} />
    </div>
  );
}
