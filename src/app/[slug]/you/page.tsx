import { getProjectsReclaimableSurplus } from "@/lib/reclaimableSurplus";
import { parseSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import { getProject } from "../getProject";
import { getSuckerGroup } from "../getSuckerGroup";
import { BalanceTable } from "./components/BalanceTable";
import { UserTokenActions } from "./components/UserTokenActions";

interface Props {
  params: { slug: string };
}

export default async function YouPage(props: Props) {
  const { slug } = props.params;
  const { chainId, projectId, version } = parseSlug(slug);

  const project = await getProject(projectId, chainId, version);
  if (!project) notFound();

  const suckerGroup = await getSuckerGroup(project.suckerGroupId, chainId);
  if (!suckerGroup) notFound();

  const projects = suckerGroup.projects?.items ?? [];

  const surplusesPromise = getProjectsReclaimableSurplus(projects);

  return (
    <div className="flex flex-col gap-6">
      <BalanceTable
        projects={projects}
        surplusesPromise={surplusesPromise}
        totalSupply={suckerGroup.tokenSupply}
      />

      <UserTokenActions projects={projects} />
    </div>
  );
}
