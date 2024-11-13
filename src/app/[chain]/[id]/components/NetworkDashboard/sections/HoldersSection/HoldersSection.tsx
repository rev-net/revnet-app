import {
  OrderDirection,
  Participant_OrderBy,
  ParticipantsDocument,
} from "@/generated/graphql";
import { ParticipantsTable } from "../../../ParticipantsTable";
import { useJBContractContext, useJBTokenContext } from "juice-sdk-react";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { useState } from "react";
// import { ParticipantsPieChart } from "../../../ParticipantsPieChart";
import { zeroAddress } from "viem";
import { Button } from "@/components/ui/button";
import { formatTokenSymbol } from "@/lib/utils";
import { twJoin } from "tailwind-merge";
import { useSubgraphQuery } from "@/graphql/useSubgraphQuery";
import { SectionTooltip } from "../SectionTooltip";
import { YouSection } from "./YouSection";

type TableView = "you" | "all" | "splits" | "automints"

export function HoldersSection() {
  const [participantsView, setParticipantsView] = useState<TableView>("you");
  const { projectId } = useJBContractContext();
  const { token } = useJBTokenContext();
  const boostRecipient = useBoostRecipient();
  const totalOutstandingTokens = useTotalOutstandingTokens();

  const { data: participantsData } = useSubgraphQuery(ParticipantsDocument, {
    orderBy: Participant_OrderBy.balance,
    orderDirection: OrderDirection.desc,
    where: {
      projectId: Number(projectId),
      balance_gt: "0", // TODO is this a subgraph bug?
      wallet_not: zeroAddress,
    },
  });

  const hasHolders =
    participantsData && participantsData.participants.length > 0;

  const ownersTab = (view: TableView, label: string) => {
    return (
      <Button
        variant={participantsView === view ? "tab-selected" : "bottomline"}
        className={twJoin(
          "text-sm text-zinc-400",
          participantsView === view && "text-inherit"
        )}
        onClick={() => setParticipantsView(view)}
      >
        {label}
      </Button>
    )
  }

  const getViewClasses = (view: TableView) => twJoin(
    "absolute w-full transition-all duration-300 ease-in-out transform",
    participantsView === view
      ? "translate-x-0 opacity-100"
      : "translate-x-full opacity-0 pointer-events-none"
  );

  if (!hasHolders || !token?.data) {
    return <span className="text-zinc-500">No owners yet.</span>;
  }

  return (
    <div>
      <div className="mb-2">
        <SectionTooltip name="Owners">
          <div className="max-w-md space-y-4 p-2">
            <p className="text-sm text-black-300">
              The accounts who hold {formatTokenSymbol(token)}, either by:
            </p>
            <ul className="text-sm text-black-300 space-y-2 list-disc pl-4">
              <li>Contributing payments to this revnet and receiving {formatTokenSymbol(token)}.</li>
              <li>Receiving {formatTokenSymbol(token)} from splits.</li>
              <li>Receiving {formatTokenSymbol(token)} from automints.</li>
              <li>Acquiring {formatTokenSymbol(token)} from someone else.</li>
            </ul>
          </div>
        </SectionTooltip>
        {/* View Tabs */}
        <div className="flex flex-row space-x-4 mb-3">
          {ownersTab("you", "You")}
          {ownersTab("all", "All")}
          {ownersTab("splits", "Splits")}
          {ownersTab("automints", "Automints")}
        </div>

        {/* ========================= */}
        {/* ========= Views ========= */}
        {/* ========================= */}
        {/* You Section */}
        <div className={participantsView === "you" ? "" : "hidden"}>
          <YouSection
            totalSupply={totalOutstandingTokens}
          />
        </div>

        {/* All Section */}
        <div className={participantsView === "all" ? "" : "hidden"}>
          <div className="max-h-96 overflow-auto p-2 bg-zinc-50 rounded-md border-zinc-100 border">
            <ParticipantsTable
              participants={participantsData}
              token={token.data}
              totalSupply={totalOutstandingTokens}
              boostRecipient={boostRecipient}
            />
          </div>
        </div>

        {/* Splits Section */}
        <div className={participantsView === "splits" ? "" : "hidden"}>
          WIP
        </div>

        {/* Automints Section */}
        <div className={participantsView === "automints" ? "" : "hidden"}>
          WIP
        </div>
      </div>
    </div>
  );
}
