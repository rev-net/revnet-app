import { parseSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import { V6ShopTab } from "../components/v6/shop/V6ShopTab";
import { getProject } from "../getProject";
import { getSuckerGroup } from "../getSuckerGroup";

interface Props {
  params: { slug: string };
}

export default async function ShopPage(props: Props) {
  const { slug } = props.params;
  const { chainId, projectId, version } = parseSlug(slug);
  if (version !== 6) notFound();

  const project = await getProject(projectId, chainId, version);
  if (!project) notFound();

  const suckerGroup = await getSuckerGroup(project.suckerGroupId, chainId);
  if (!suckerGroup) notFound();

  return <V6ShopTab projects={suckerGroup.projects?.items ?? []} />;
}
