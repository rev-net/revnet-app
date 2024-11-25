import { MAX_RULESET_COUNT } from "@/app/constants";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
  useReadJbRulesetsAllOf,
} from "juice-sdk-react";
import { useReadRevDeployerUnrealizedAutoMintAmountOf, useWriteRevDeployerAutoMintFor } from "revnet-sdk";
import { formatUnits } from "juice-sdk-core";
import { formatTokenSymbol } from "@/lib/utils";
import { commaNumber } from "@/lib/number";
import { useSubgraphQuery } from "@/graphql/useSubgraphQuery";
import { ProjectsDocument, StoreAutoMintAmountEventsDocument } from "@/generated/graphql";
import { EthereumAddress } from "@/components/EthereumAddress";
import { format } from "date-fns";
import { useMemo } from "react";

export function AutoIssuance() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();
  const { token } = useJBTokenContext();

  const { data: rulesets } = useReadJbRulesetsAllOf({
    chainId,
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
  });

  const { data: unrealized } = useReadRevDeployerUnrealizedAutoMintAmountOf({
    chainId,
    args: [projectId]
  });

  const { data: autoMintsData } = useSubgraphQuery(StoreAutoMintAmountEventsDocument, {
    where: { revnetId: String(projectId) },
    first: 1,
  });
  const autoMints = useMemo(() => {
    return autoMintsData?.storeAutoMintAmountEvents.map((automint) => {
      const rulesetIndex = rulesets?.findIndex((r) => (String(r.id) === automint.stageId)) || 0;
      return {
        ...automint,
        startsAt: rulesets?.[rulesetIndex].start,
        stage: rulesetIndex + 1
      }
    })
  }, [autoMintsData, rulesets])
  const now = new Date().getTime();
  console.log("autoMintData::", autoMints)
  console.log("rulesets::", rulesets)
  return (
    <div className="max-h-96 overflow-auto bg-zinc-50 rounded-md border-zinc-200 border mb-4">
      <div className="flex flex-col p-2">
        {unrealized && token.data && (
          <div className="ml-2 italic">
            Total unrealized auto-issuance tokens:{" "}
            {commaNumber(formatUnits(unrealized, token.data.decimals))}{" "}
            { formatTokenSymbol(token) }
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stage</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Distributable date</TableHead>
              <TableHead>Distribute</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {autoMints && autoMints.map((automint) => (
              <TableRow key={automint.id}>
                <TableCell>
                  {automint.stage}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row text-sm">
                    <div className="flex flex-col sm:flex-row text-sm">
                      <EthereumAddress
                        address={automint.beneficiary}
                        short
                        withEnsAvatar
                        withEnsName
                        className="hidden sm:block"
                      />
                      <EthereumAddress
                        address={automint.beneficiary}
                        short
                        avatarProps={{size: "sm"}}
                        withEnsAvatar
                        withEnsName
                        className="block sm:hidden"
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {commaNumber(formatUnits(automint.count, token?.data?.decimals || 18))}{" "}
                  { formatTokenSymbol(token) }
                </TableCell>
                <TableCell>
                  {automint.startsAt && format(automint.startsAt * 1000, "MMM dd, yyyy p")}
                </TableCell>
                <TableCell>
                  <Button
                    disabled={(automint?.startsAt || 0) <= now}
                  >
                    Distribute
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
