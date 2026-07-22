"use client";

import { useQuery } from "@tanstack/react-query";
import { ProjectItem } from "../../shared";
import { AcrossChainsCard } from "./AcrossChainsCard";
import { BridgesCard } from "./BridgesCard";
import { GossipCard } from "./GossipCard";
import { chainProjectsKey, projectTokenSymbol, toChainProjects } from "./lib";
import { QueuedMovementsCard } from "./QueuedMovementsCard";

/**
 * Owners → Settlement: the project's cross-chain accounting surface — per-chain
 * composition, bridge routes, gossip freshness, and in-flight token movements
 * with local-proof claims (website/ Settlement parity, proofs via suckerProofs).
 */
export function V6SettlementSubtab({ projects }: { projects: ProjectItem[] }) {
  const chains = toChainProjects(projects);

  const { data: tokenSymbol = "tokens" } = useQuery({
    queryKey: ["v6ProjectTokenSymbol", chainProjectsKey(chains)],
    enabled: projects.length > 0,
    staleTime: Infinity,
    queryFn: () => projectTokenSymbol(projects),
  });

  if (chains.length === 0) {
    return <div className="text-zinc-500">No project chains found.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <AcrossChainsCard chains={chains} tokenSymbol={tokenSymbol} />
      {chains.length > 1 ? (
        <>
          <BridgesCard chains={chains} tokenSymbol={tokenSymbol} />
          <GossipCard chains={chains} />
          <QueuedMovementsCard chains={chains} tokenSymbol={tokenSymbol} />
        </>
      ) : (
        // Single-chain projects have nothing to bridge, gossip, or claim — say so
        // instead of silently hiding the sections.
        <div className="text-zinc-500">
          This project settles on one chain, so there are no bridges, cross-chain accounting
          records, or queued token movements. If the operator deploys the project to more chains,
          they&apos;ll show up here.
        </div>
      )}
    </div>
  );
}
