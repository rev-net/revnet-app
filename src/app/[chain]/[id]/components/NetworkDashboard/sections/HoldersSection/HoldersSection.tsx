import {
  OrderDirection,
  Participant,
  Participant_OrderBy,
  ParticipantsDocument,
} from "@/generated/graphql";
import { ParticipantsTable } from "../../../ParticipantsTable";
import {
  JBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { useState } from "react";
import { ParticipantsPieChart } from "../../../ParticipantsPieChart";
import { zeroAddress } from "viem";
import { Button } from "@/components/ui/button";
import { formatTokenSymbol } from "@/lib/utils";
import { twJoin } from "tailwind-merge";
import { useSubgraphQuery } from "@/graphql/useSubgraphQuery";
import { SectionTooltip } from "../SectionTooltip";
import { YouSection } from "./YouSection";
import { useAccount } from "wagmi";
import { SplitsSection } from "./SplitsSection";
import { useOmnichainSubgraphQuery } from "@/graphql/useOmnichainSubgraphQuery";
import { UserTokenBalanceCard } from "../../../UserTokenBalanceCard/UserTokenBalanceCard";
import { DistributeReservedTokensButton } from "../../../DistributeReservedTokensButton";

type TableView = "you" | "all" | "splits" | "autoissuance";

export function HoldersSection() {
  const { address } = useAccount();
  const [participantsView, setParticipantsView] = useState<TableView>(
    address ? "you" : "all"
  );
  const [isOpen, setIsOpen] = useState(false);
  const { projectId } = useJBContractContext();
  const { token } = useJBTokenContext();
  const boostRecipient = useBoostRecipient();

  const totalOutstandingTokens = useTotalOutstandingTokens();

  const participantsQuery = useOmnichainSubgraphQuery(ParticipantsDocument, {
    orderBy: Participant_OrderBy.balance,
    orderDirection: OrderDirection.desc,
    where: {
      projectId: Number(projectId),
      balance_gt: "0", // TODO is this a subgraph bug?
      wallet_not: zeroAddress,
    },
  });

  const participantsData = participantsQuery.data?.flatMap((d) =>
    d.value.response.participants.map((p) => ({
      ...p,
      chainId: d.value.chainId,
    }))
  ) as (Participant & { chainId: JBChainId })[];

  const participantsDataAggregate =
    participantsData?.reduce((acc, participant) => {
      const existingParticipant = acc[participant.wallet.id];
      return {
        ...acc,
        [participant.wallet.id]: {
          wallet: participant.wallet,
          balance:
            BigInt(existingParticipant?.balance ?? 0) +
            BigInt(participant.balance ?? 0),
          volume:
            BigInt(existingParticipant?.volume ?? 0) +
            BigInt(participant.volume ?? 0),
          chains: [
            ...(acc[participant.wallet.id]?.chains ?? []),
            participant.chainId,
          ],
        },
      };
    }, {} as Record<string, any>) ?? {};

  const hasHolders = participantsData && participantsData.length > 0;

  const ownersTab = (view: TableView, label: string) => {
    return (
      <Button
        variant={participantsView === view ? "tab-selected" : "bottomline"}
        className={twJoin(
          "text-md text-zinc-400",
          participantsView === view && "text-inherit"
        )}
        onClick={() => setParticipantsView(view)}
      >
        {label}
      </Button>
    );
  };

  if (!hasHolders || !token?.data) {
    return <span className="text-zinc-500">No owners yet.</span>;
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
    <div className="mt-4">
      {/* Dropdown Header */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-left text-black-600"
      >
        <span
          className={`transform transition-transform font-sm ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        >
          ▶
        </span>
            <SectionTooltip name="Owners">
              <div className="max-w-md space-y-4 p-2">
            <p className="text-md text-black-300">
              The accounts who hold {formatTokenSymbol(token)}, either by:
            </p>
            <ul className="text-md text-black-300 space-y-2 list-disc pl-4">
              <li>
                Contributing payments to this revnet and receiving{" "}
                {formatTokenSymbol(token)}.
              </li>
              <li>Receiving {formatTokenSymbol(token)} from splits.</li>
              <li>Receiving {formatTokenSymbol(token)} from auto issuance.</li>
              <li>Acquiring {formatTokenSymbol(token)} from someone else.</li>
            </ul>
          </div>
        </SectionTooltip>
      </button>

      {/* Dropdown Content */}
      {isOpen && 
        <div className="mt-2 pl-4 text-gray-600 text-md">
          <div className="mb-2">
        {/* View Tabs */}
        <div className="flex flex-row space-x-4 mb-3">
          {ownersTab("you", "You")}
          {ownersTab("all", "All")}
          {ownersTab("splits", "Splits")}
          {ownersTab("autoissuance", "Auto issuance")}
        </div>

        {/* ========================= */}
        {/* ========= Views ========= */}
        {/* ========================= */}
        {/* You Section */}
        <div className={participantsView === "you" ? "" : "hidden"}>
          <YouSection totalSupply={totalOutstandingTokens} />
          <UserTokenBalanceCard />
        </div>

        {/* All Section */}
        <div className={participantsView === "all" ? "" : "hidden"}>
          <div className="flex flex-row max-h-96 overflow-auto p-2 bg-zinc-50 rounded-md border-zinc-100 border">
            <div className="w-1/3">
              <ParticipantsPieChart
                participants={Object.values(participantsDataAggregate)}
                totalSupply={totalOutstandingTokens}
                token={token?.data}
              />
            </div>
            <div>
              <ParticipantsTable
                participants={Object.values(participantsDataAggregate)}
                token={token.data}
                totalSupply={totalOutstandingTokens}
                boostRecipient={boostRecipient}
              />
            </div>
          </div>
        </div>

        {/* Splits Section */}
        <div className={participantsView === "splits" ? "" : "hidden"}>
          <div className="max-h-96 overflow-auto p-2 bg-zinc-50 rounded-md border-zinc-100 border mb-4">
            <SplitsSection />
          </div>
          <DistributeReservedTokensButton />
        </div>

        {/* Auto issuance */}
        <div className={participantsView === "autoissuance" ? "" : "hidden"}>
          WIP
        </div>
      </div>
        </div>
        }
    </div>
    </div>
  );
}

