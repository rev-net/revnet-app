import { useParticipantsQuery } from "@/generated/graphql";
import { ParticipantsTable } from "../../../ParticipantsTable";
import { useJBContractContext, useJBTokenContext } from "juice-sdk-react";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { useState } from "react";

export function HoldersSection() {
  const [participantsView, setParticipantsView] = useState<"table" | "pie">(
    "pie"
  );
  const { projectId } = useJBContractContext();
  const { token } = useJBTokenContext();
  const boostRecipient = useBoostRecipient();
  const totalOutstandingTokens = useTotalOutstandingTokens();

  const { data: participantsData } = useParticipantsQuery({
    variables: {
      // orderBy: Participant_OrderBy.balance,
      // orderDirection: OrderDirection.desc,
      where: {
        projectId: Number(projectId),
        // balance_gt: "0", // TODO is this a subgraph bug?
        // wallet_not: zeroAddress,
      },
    },
    pollInterval: 10_000,
  });

  return (
    <>
      {token?.data &&
      participantsData &&
      participantsData.participants.length > 0 ? (
        <>
          <div className="max-h-96 overflow-auto p-2 bg-zinc-50 rounded-md border-zinc-100 border">
            <ParticipantsTable
              participants={participantsData}
              token={token?.data}
              totalSupply={totalOutstandingTokens}
              boostRecipient={boostRecipient}
            />
          </div>
          {/* <ParticipantsPieChart
            participants={participantsData}
            totalSupply={totalOutstandingTokens}
            token={token?.data}
          /> */}
        </>
      ) : (
        <span className="text-zinc-500">No holders yet.</span>
      )}
    </>
  );
}
