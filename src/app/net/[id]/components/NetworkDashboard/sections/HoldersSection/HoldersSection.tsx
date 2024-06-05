import {
  OrderDirection,
  Participant_OrderBy,
  useParticipantsQuery,
} from "@/generated/graphql";
import { ParticipantsTable } from "../../../ParticipantsTable";
import { useJBContractContext, useJBTokenContext } from "juice-sdk-react";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { useState } from "react";
import { ParticipantsPieChart } from "../../../ParticipantsPieChart";
import { zeroAddress } from "viem";
import { Button } from "@/components/ui/button";
import { twJoin } from "tailwind-merge";

export function HoldersSection() {
  const [participantsView, setParticipantsView] = useState<"table" | "pie">(
    "table"
  );
  const { projectId } = useJBContractContext();
  const { token } = useJBTokenContext();
  const boostRecipient = useBoostRecipient();
  const totalOutstandingTokens = useTotalOutstandingTokens();

  const { data: participantsData } = useParticipantsQuery({
    variables: {
      orderBy: Participant_OrderBy.balance,
      orderDirection: OrderDirection.desc,
      where: {
        projectId: Number(projectId),
        balance_gt: "0", // TODO is this a subgraph bug?
        wallet_not: zeroAddress,
      },
    },
    pollInterval: 10_000,
  });

  return (
    <div>
      <div className="mb-2">
        <Button
          variant="ghost"
          className={twJoin(
            "text-sm font-normal",
            participantsView === "table" && "font-medium underline"
          )}
          onClick={() => setParticipantsView("table")}
        >
          List
        </Button>
        <Button
          variant="ghost"
          className={twJoin(
            "text-sm font-normal",
            participantsView === "pie" && "font-medium underline"
          )}
          onClick={() => setParticipantsView("pie")}
        >
          Chart
        </Button>
      </div>

      {token?.data &&
      participantsData &&
      participantsData.participants.length > 0 ? (
        <>
          <div
            className={twJoin(
              "max-h-96 overflow-auto p-2 bg-zinc-50 rounded-md border-zinc-100 border",
              participantsView === "table" ? "" : "hidden"
            )}
          >
            <ParticipantsTable
              participants={participantsData}
              token={token?.data}
              totalSupply={totalOutstandingTokens}
              boostRecipient={boostRecipient}
            />
          </div>
          <div className={participantsView === "pie" ? "" : "hidden"}>
            <ParticipantsPieChart
              participants={participantsData}
              totalSupply={totalOutstandingTokens}
              token={token?.data}
            />
          </div>
        </>
      ) : (
        <span className="text-zinc-500">No holders yet.</span>
      )}
    </div>
  );
}
