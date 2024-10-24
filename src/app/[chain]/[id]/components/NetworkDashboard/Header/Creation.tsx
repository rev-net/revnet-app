import EtherscanLink from "@/components/EtherscanLink";
import { ProjectCreateEventDocument } from "@/generated/graphql";
import { useSubgraphQuery } from "@/graphql/useSubgraphQuery";
import { format } from "date-fns";
import { useJBContractContext } from "juice-sdk-react";

export function Creation() {
  const { projectId } = useJBContractContext();

  const { data: projectCreateEvent } = useSubgraphQuery(
    ProjectCreateEventDocument,
    {
      where: { projectId: Number(projectId) },
    }
  );

  const { txHash, timestamp } =
    projectCreateEvent?.projectEvents?.[0]?.projectCreateEvent ?? {};

  return (
    timestamp && txHash ? (
        <EtherscanLink
          value={txHash}
          type="tx"
          className="text-zinc-500 text-sm"
        >
          Since {format(timestamp * 1000, "yyyy-MM-dd")}
        </EtherscanLink>
      ) : null
  )
}
