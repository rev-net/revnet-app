import { parseSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import { getProject } from "../getProject";
import { getSuckerGroup } from "../getSuckerGroup";
import { UserTokenBalanceCard } from "./components/UserTokenBalanceCard";
import { YouSection } from "./components/YouSection";

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

  return (
    <>
      <YouSection />

      <UserTokenBalanceCard projects={suckerGroup.projects?.items ?? []} />
    </>
  );
}
