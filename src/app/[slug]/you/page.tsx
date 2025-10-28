import { getProjectsReclaimableSurplus } from "@/lib/reclaimableSurplus";
import { parseSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProject } from "../getProject";
import { getSuckerGroup } from "../getSuckerGroup";
import { getSuckerTransactions } from "../getSuckerTransactions";
import { BalanceTable } from "./components/BalanceTable";
import { SuckerTransactionsTable } from "./components/suckerTransactions/SuckerTransactionsTable";
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
  const currentProject = projects.find((p) => p.chainId === chainId && p.version === version);

  const surplusesPromise = getProjectsReclaimableSurplus(projects);

  const suckerTransactions = getSuckerTransactions(project.suckerGroupId, 5, chainId);

  return (
    <div className="flex flex-col gap-8">
      <BalanceTable
        projects={projects}
        surplusesPromise={surplusesPromise}
        totalSupply={suckerGroup.tokenSupply}
      />

      <UserTokenActions projects={projects} />

      <Suspense>
        <SuckerTransactionsTable
          transactions={await suckerTransactions}
          tokenDecimals={currentProject?.decimals ?? 18}
          tokenSymbol={currentProject?.tokenSymbol ?? ""}
        />
      </Suspense>
    </div>
  );
}
