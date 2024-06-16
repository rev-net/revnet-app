import EtherscanLink from "@/components/EtherscanLink";
import { ProjectCreateEventDocument } from "@/generated/graphql";
import { useSubgraphQuery } from "@/graphql/useSubgraphQuery";
import { format } from "date-fns";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
} from "juice-sdk-react";

export function DescriptionSection() {
  const { projectId } = useJBContractContext();
  const { metadata } = useJBProjectMetadataContext();

  const { description } = metadata?.data ?? {};

  const { data: projectCreateEvent } = useSubgraphQuery(
    ProjectCreateEventDocument,
    {
      where: { projectId: Number(projectId) },
    }
  );
  const { txHash, timestamp } =
    projectCreateEvent?.projectEvents?.[0]?.projectCreateEvent ?? {};

  return (
    <>
      <div className="mb-5">
        {timestamp && txHash ? (
          <EtherscanLink
            value={txHash}
            type="tx"
            className="text-zinc-500 text-sm block"
          >
            Since {format(timestamp * 1000, "yyyy-MM-dd")}
          </EtherscanLink>
        ) : null}
      </div>
      {description
        ? description.split("\n").map((d, idx) => (
            <p className="mb-3" key={idx}>
              {d}
            </p>
          ))
        : null}
    </>
  );
}
