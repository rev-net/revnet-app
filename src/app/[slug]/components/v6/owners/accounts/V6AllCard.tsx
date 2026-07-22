"use client";

import { ParticipantsDocument, ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { getTokenConfigForChain, getTokenSymbolFromAddress } from "@/lib/tokenUtils";
import { prettyNumber } from "@/lib/number";
import { formatTokenSymbol } from "@/lib/utils";
import { formatUnits } from "@bananapus/nana-sdk-core";
import {
  useBendystrawQuery,
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "@bananapus/nana-sdk-react";
import { ParticipantsPieChart } from "../../../../owners/components/ParticipantsPieChart";
import { ParticipantsTable } from "../../../../owners/components/ParticipantsTable";

/**
 * "All" card (website/ parity: renderOwnersAll): the holder distribution pie +
 * table, aggregated per account across every chain in the sucker group.
 */
export function V6AllCard() {
  const chainId = useJBChainId();
  const { projectId, version } = useJBContractContext();
  const { token } = useJBTokenContext();
  const totalOutstandingTokens = useTotalOutstandingTokens();

  const project = useBendystrawQuery(ProjectDocument, {
    projectId: Number(projectId),
    chainId: Number(chainId),
    version,
  });
  const suckerGroupId = project.data?.project?.suckerGroupId;

  const { data: suckerGroupData } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: suckerGroupId ?? "" },
    { enabled: !!suckerGroupId, pollInterval: 10000 },
  );

  const chainTokenConfig = getTokenConfigForChain(suckerGroupData, Number(chainId));
  const baseTokenSymbol = getTokenSymbolFromAddress(chainTokenConfig.token);
  const baseTokenDecimals = chainTokenConfig.decimals;

  const participantsQuery = useBendystrawQuery(ParticipantsDocument, {
    orderBy: "balance",
    orderDirection: "desc",
    where: {
      suckerGroupId,
      balance_gt: 0,
    },
  });

  // Aggregate each account's balance/volume across the chains it holds on.
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
  const participants = Object.values(participantsDataAggregate);
  const shownCount = Math.min(10, participants.length);
  const totalLabel = token?.data
    ? `${prettyNumber(
        formatUnits(totalOutstandingTokens, token.data.decimals, { fractionDigits: 1 }),
      )} ${formatTokenSymbol(token.data.symbol)}`
    : null;

  return (
    <div>
      <p className="text-md text-black font-light italic mb-2">
        {formatTokenSymbol(token)} owners are accounts who either paid in, received splits, received
        auto issuance, or traded for them on the secondary market.
      </p>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,0.72fr)_minmax(560px,1.28fr)]">
        <div className="min-w-0">
          <ParticipantsPieChart
            participants={participants}
            totalSupply={totalOutstandingTokens}
            token={token?.data}
            showOwnerCount
          />
          {totalLabel ? (
            <p className="-mt-4 text-center text-sm text-melon-700">Total: {totalLabel}</p>
          ) : null}
        </div>
        <div className="w-full min-w-0 overflow-auto">
          <ParticipantsTable
            participants={participants}
            token={token?.data}
            totalSupply={totalOutstandingTokens}
            baseTokenSymbol={baseTokenSymbol}
            baseTokenDecimals={baseTokenDecimals}
            condensed
            maxRows={10}
          />
        </div>
      </div>
      {participants.length > 0 ? (
        <p className="mt-4 text-sm text-melon-700">
          {participants.length} holder{participants.length === 1 ? "" : "s"} — showing the {shownCount}{" "}
          largest, as shares of the balances tracked here
        </p>
      ) : null}
    </div>
  );
}
