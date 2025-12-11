import { parseSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import { DescriptionSection } from "./about/components/DescriptionSection";
import { getProject } from "./getProject";
import { getSuckerGroup } from "./getSuckerGroup";

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

  return <DescriptionSection projects={suckerGroup.projects?.items ?? []} />;
}
