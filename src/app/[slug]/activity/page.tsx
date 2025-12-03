import { parseSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import { ActivityFeed } from "../components/ActivityFeed/ActivityFeed";
import { getProject } from "../getProject";

interface Props {
  params: { slug: string };
}

export default async function Page(props: Props) {
  const { slug } = props.params;
  const { chainId, projectId, version } = parseSlug(slug);

  const project = await getProject(projectId, chainId, version);
  if (!project) notFound();

  return <ActivityFeed suckerGroupId={project.suckerGroupId} />;
}
