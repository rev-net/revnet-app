"use client";

import { chainSortOrder } from "@/app/constants";
import { ChainLogo } from "@/components/ChainLogo";
import { EthereumAddress } from "@/components/EthereumAddress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectOperatorDocument } from "@/generated/graphql";
import { JB_CHAINS, JBChainId } from "@bananapus/nana-sdk-core";
import { useBendystrawQuery, useJBContractContext } from "@bananapus/nana-sdk-react";
import Link from "next/link";
import { Address, isAddress } from "viem";
import { ProjectItem } from "../shared";

/**
 * website/-parity "Other info" panel (renderOtherInfoPanel): the sucker
 * group's per-chain project IDs (each linking to that chain's project page)
 * and the revnet operator on every chain (bendystraw's indexed
 * isRevnetOperator permission holder), explorer-linked.
 */
export function OtherInfoPanel({ projects }: { projects: ProjectItem[] }) {
  const rows = projects
    .filter((p): p is ProjectItem & { chainId: JBChainId } => Boolean(JB_CHAINS[p.chainId as JBChainId]))
    .sort(
      (a, b) =>
        (chainSortOrder.get(a.chainId as JBChainId) ?? 0) -
        (chainSortOrder.get(b.chainId as JBChainId) ?? 0),
    );

  if (rows.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-base font-semibold text-zinc-700">Other info</h3>
      <div className="max-w-screen-sm rounded-md border border-zinc-200 [&>div]:rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 hover:bg-zinc-50">
              <TableHead className="whitespace-nowrap font-medium px-3">Chain</TableHead>
              <TableHead className="whitespace-nowrap font-medium px-3">
                Project ID
              </TableHead>
              <TableHead className="whitespace-nowrap font-medium px-3">Operator</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => {
              const chainId = p.chainId as JBChainId;
              const chain = JB_CHAINS[chainId];
              return (
                <TableRow key={`${p.chainId}-${p.projectId}`}>
                  <TableCell className="whitespace-nowrap px-3 py-3">
                    <span className="flex items-center gap-2">
                      <ChainLogo chainId={chainId} width={16} height={16} />
                      {chain.name}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-3">
                    <Link
                      href={`/v6:${chain.slug}:${p.projectId}`}
                      className="underline hover:text-black/70"
                      title={`Open #${p.projectId} on ${chain.name}`}
                    >
                      #{p.projectId}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-3">
                    <OperatorCell chainId={chainId} projectId={p.projectId} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/** The revnet operator on one chain, ENS-resolved and explorer-linked. */
function OperatorCell({ chainId, projectId }: { chainId: JBChainId; projectId: number }) {
  const { version } = useJBContractContext();
  const { data, isLoading } = useBendystrawQuery(ProjectOperatorDocument, {
    chainId,
    projectId,
    version,
  });

  const operator = data?.permissionHolders?.items?.[0]?.operator;

  if (isLoading) return <Skeleton className="h-4 w-24" />;
  if (!operator || !isAddress(operator)) return <span className="text-zinc-400">—</span>;

  return (
    <EthereumAddress
      address={operator as Address}
      short
      withEnsName
      chain={JB_CHAINS[chainId].chain}
    />
  );
}
