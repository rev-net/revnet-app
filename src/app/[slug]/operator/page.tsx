import { parseSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import { V6OperatorTab } from "../components/v6/operator/V6OperatorTab";
import { getProject } from "../getProject";
import { getProjectOperator } from "../getProjectOperator";
import { getSuckerGroup } from "../getSuckerGroup";

interface Props {
  params: { slug: string };
}

export default async function OperatorPage(props: Props) {
  const { slug } = props.params;
  const { chainId, projectId, version } = parseSlug(slug);
  if (version !== 6) notFound();

  const project = await getProject(projectId, chainId, version);
  if (!project) notFound();

  const suckerGroup = await getSuckerGroup(project.suckerGroupId, chainId);
  if (!suckerGroup) notFound();

  const operator = await getProjectOperator(Number(projectId), chainId, version);

  return (
    <V6OperatorTab
      projects={suckerGroup.projects?.items ?? []}
      operator={operator?.address ?? undefined}
    />
  );
}
