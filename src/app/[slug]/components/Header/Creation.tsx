import EtherscanLink from "@/components/EtherscanLink";
import { ProjectCreateEventDocument } from "@/generated/graphql";
import { format } from "date-fns";
import { useBendystrawQuery, useJBContractContext } from "juice-sdk-react";

export function Creation() {
  const { projectId, version } = useJBContractContext();

  const { data: projectCreateEvent } = useBendystrawQuery(ProjectCreateEventDocument, {
    where: { projectId: Number(projectId), version },
  });

  const { txHash, timestamp } = projectCreateEvent?.projectCreateEvents.items?.[0] ?? {};

  return timestamp && txHash ? (
    <EtherscanLink value={txHash} type="tx" className="text-zinc-500 text-sm">
      Since {format(timestamp * 1000, "MMM dd, yyyy")}
    </EtherscanLink>
  ) : null;
}
