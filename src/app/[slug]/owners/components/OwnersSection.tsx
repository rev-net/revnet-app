"use client";

import { Button } from "@/components/ui/button";
import { ParticipantsDocument, ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { getTokenConfigForChain, getTokenSymbolFromAddress } from "@/lib/tokenUtils";
import { formatTokenSymbol } from "@/lib/utils";
import { useJBChainId, useJBContractContext, useJBTokenContext } from "juice-sdk-react";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { AutoIssuance } from "./AutoIssuance";
import { DistributeReservedTokensButton } from "./DistributeReservedTokensButton";
import { ParticipantsPieChart } from "./ParticipantsPieChart";
import { ParticipantsTable } from "./ParticipantsTable";
import { SplitsSection } from "./SplitsSection";

type TableView = "all" | "splits" | "autoissuance";

export function OwnersSection() {
  const chainId = useJBChainId();

  const [participantsView, setParticipantsView] = useState<TableView>("all");
  const { projectId, version } = useJBContractContext();
  const { token } = useJBTokenContext();

  const totalOutstandingTokens = useTotalOutstandingTokens();

  const project = useBendystrawQuery(ProjectDocument, {
    projectId: Number(projectId),
    chainId: Number(chainId),
    version,
  });

  const suckerGroupId = project.data?.project?.suckerGroupId;

  // Get sucker group data for token mapping
  const { data: suckerGroupData } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: suckerGroupId ?? "" },
    { enabled: !!suckerGroupId, pollInterval: 10000 },
  );

  // Get token configuration for the current chain
  const chainTokenConfig = getTokenConfigForChain(suckerGroupData, Number(chainId));
  const baseTokenSymbol = getTokenSymbolFromAddress(chainTokenConfig.token);
  const baseTokenDecimals = chainTokenConfig.decimals;

  const participantsQuery = useBendystrawQuery(ParticipantsDocument, {
    orderBy: "balance",
    orderDirection: "desc",
    where: {
      suckerGroupId: project.data?.project?.suckerGroupId,
      balance_gt: 0,
    },
  });

  console.debug({
    participantsQuery,
    suckerGroupData,
    chainTokenConfig,
    baseTokenSymbol,
    baseTokenDecimals,
  });

  const participantsDataAggregate =
    participantsQuery.data?.participants.items?.reduce(
      (acc, participant) => {
        if (!participant) return acc;
        const existingParticipant = acc[participant.address];
        return {
          ...acc,
          [participant.address]: {
            address: participant.address,
            balance: BigInt(existingParticipant?.balance ?? 0) + BigInt(participant.balance ?? 0),
            volume: BigInt(existingParticipant?.volume ?? 0) + BigInt(participant.volume ?? 0),
            chains: [...(acc[participant.address]?.chains ?? []), participant.chainId],
          },
        };
      },
      {} as Record<string, any>,
    ) ?? {};

  const ownersTab = (view: TableView, label: string) => {
    return (
      <Button
        variant={participantsView === view ? "tab-selected" : "bottomline"}
        className={twJoin("text-md text-zinc-400", participantsView === view && "text-inherit")}
        onClick={() => setParticipantsView(view)}
      >
        {label}
      </Button>
    );
  };

  return (
    <div className="text-gray-600 text-md">
      <div className="mb-2">
        {/* View Tabs */}
        <div className="flex flex-row space-x-4 mb-3">
          {ownersTab("all", "All")}
          {ownersTab("splits", "Splits")}
          {ownersTab("autoissuance", "Auto issue")}
        </div>

        {/* ========================= */}
        {/* ========= Views ========= */}
        {/* ========================= */}

        {/* All Section */}
        <div className={participantsView === "all" ? "" : "hidden"}>
          <div className="space-y-4 p-2 pb-0 sm:pb-2">
            <p className="text-md text-black font-light italic">
              {formatTokenSymbol(token)} owners are accounts who either paid in, received splits,
              received auto issuance, or traded for them on the secondary market.
            </p>
          </div>
          <div className="flex sm:flex-row flex-col max-h-140 sm:items-start items-center sm:border-t border-zinc-200">
            <div className="w-1/3">
              <ParticipantsPieChart
                participants={Object.values(participantsDataAggregate)}
                totalSupply={totalOutstandingTokens}
                token={token?.data}
              />
            </div>
            <div className="overflow-auto p-2 bg-zinc-50 rounded-tl-none border-zinc-200 sm:border-t-[0px] border w-full">
              <div>
                <ParticipantsTable
                  participants={Object.values(participantsDataAggregate)}
                  token={token?.data}
                  totalSupply={totalOutstandingTokens}
                  baseTokenSymbol={baseTokenSymbol}
                  baseTokenDecimals={baseTokenDecimals}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Splits Section */}
        <div className={participantsView === "splits" ? "" : "hidden"}>
          <SplitsSection />
          <DistributeReservedTokensButton />
        </div>

        {/* Auto issuance */}
        <div className={participantsView === "autoissuance" ? "" : "hidden"}>
          <AutoIssuance />
        </div>
      </div>
    </div>
  );
}
