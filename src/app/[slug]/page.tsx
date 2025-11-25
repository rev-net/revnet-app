import { SuckerTransactionStatus } from "@/generated/graphql";
import { getProjectsReclaimableSurplus } from "@/lib/reclaimableSurplus";
import { parseSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { BalanceTable } from "./components/Value/BalanceTable";
import { SuckerTransactionsTable } from "./components/Value/suckerTransactions/SuckerTransactionsTable";
import { UserTokenActions } from "./components/Value/UserTokenActions";
import { getProject } from "./getProject";
import { getSuckerGroup } from "./getSuckerGroup";
import { getSuckerTransactions } from "./getSuckerTransactions";

const statusSchema = z.enum(["pending", "claimable", "claimed"]);

interface Props {
  params: { slug: string };
  searchParams: { status?: string };
}

export default async function YouPage(props: Props) {
  const { slug } = props.params;
  const { status } = props.searchParams;
  const { chainId, projectId, version } = parseSlug(slug);

  const project = await getProject(projectId, chainId, version);
  if (!project) notFound();

  const suckerGroup = await getSuckerGroup(project.suckerGroupId, chainId);
  if (!suckerGroup) notFound();

  const projects = suckerGroup.projects?.items ?? [];
  const currentProject = projects.find((p) => p.chainId === chainId && p.version === version);

  const surplusesPromise = getProjectsReclaimableSurplus(projects);

  const filterStatus = statusSchema.safeParse(status).data as SuckerTransactionStatus | undefined;
  const suckerTransactions = getSuckerTransactions(
    project.suckerGroupId,
    version,
    chainId,
    filterStatus,
  );

  return (
    <div className="flex flex-col gap-8">
      <BalanceTable
        projects={projects}
        surplusesPromise={surplusesPromise}
        totalSupply={suckerGroup.tokenSupply}
      />

      <UserTokenActions projects={projects} surplusesPromise={surplusesPromise} />

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
