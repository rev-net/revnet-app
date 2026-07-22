import { parseSlug } from "@/lib/slug";
import { NATIVE_TOKEN_DECIMALS } from "@bananapus/nana-sdk-core";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DescriptionSection } from "./about/components/DescriptionSection";
import { TokenPriceChart } from "./components/TokenPrice/TokenPriceChart";
import { V6OverviewTab } from "./components/v6/overview/V6OverviewTab";
import { getProject } from "./getProject";
import { getSuckerGroup } from "./getSuckerGroup";
import { getRulesets } from "./terms/getRulesets";

interface Props {
  params: { slug: string };
}

export default async function AboutPage(props: Props) {
  const { slug } = props.params;
  const { chainId, projectId, version } = parseSlug(slug);

  const project = await getProject(projectId, chainId, version);
  if (!project) notFound();

  const suckerGroup = await getSuckerGroup(project.suckerGroupId, chainId);
  if (!suckerGroup) notFound();

  const projects = suckerGroup.projects?.items ?? [];

  if (version === 6) {
    const rulesets = await getRulesets(projectId.toString(), chainId, version);
    const startDate = rulesets[0]?.start;
    const hasStarted = !startDate || startDate <= Math.floor(Date.now() / 1000);

    return (
      <div className="flex flex-col gap-6">
        {hasStarted && (
          <Suspense>
            <TokenPriceChart
              projectId={projectId.toString()}
              chainId={chainId}
              version={version}
              suckerGroupId={suckerGroup.id}
              token={project.token ?? ""}
              tokenSymbol={project.tokenSymbol ?? "ETH"}
              tokenDecimals={project.decimals ?? NATIVE_TOKEN_DECIMALS}
            />
          </Suspense>
        )}
        <V6OverviewTab projects={projects} />
      </div>
    );
  }

  return <DescriptionSection projects={projects} />;
}
