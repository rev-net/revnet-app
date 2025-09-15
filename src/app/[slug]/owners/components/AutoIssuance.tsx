"use client";

import { EthereumAddress } from "@/components/EthereumAddress";
import EtherscanLink from "@/components/EtherscanLink";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";
import { commaNumber } from "@/lib/number";
import { formatTokenSymbol } from "@/lib/utils";
import { format } from "date-fns";
import { formatUnits, revDeployerAbi, RevnetCoreContracts } from "juice-sdk-core";
import { useJBContractContext, useJBTokenContext } from "juice-sdk-react";
import { CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export function AutoIssuance() {
  const { token } = useJBTokenContext();
  const autoIssuances = useAutoIssuances();
  const now = Math.floor(new Date().getTime() / 1000);
  const [autoIssueId, setAutoIssueId] = useState<string | null>(null);
  const { contractAddress } = useJBContractContext();

  const { writeContract, isPending, data } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Autoissuance distributed!",
        description: "Transaction has been confirmed.",
      });
      setAutoIssueId(null);
    }
  }, [isSuccess]);

  if (autoIssuances?.length === 0)
    return <div className="text-center text-zinc-400">No autoissuances</div>;

  return (
    <div className="max-h-96 overflow-auto bg-zinc-50 border-zinc-200 border mb-4">
      <div className="flex flex-col p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stage</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Unlock date</TableHead>
              <TableHead>Distribute</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {autoIssuances &&
              autoIssuances.map((autoIssuance) => (
                <TableRow key={autoIssuance.id}>
                  <TableCell>{autoIssuance.stage}</TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row text-sm">
                      <div className="flex flex-col sm:flex-row text-sm">
                        <EthereumAddress
                          address={autoIssuance.beneficiary as `0x${string}`}
                          short
                          withEnsAvatar
                          withEnsName
                          className="hidden sm:block"
                        />
                        <EthereumAddress
                          address={autoIssuance.beneficiary as `0x${string}`}
                          short
                          avatarProps={{ size: "sm" }}
                          withEnsAvatar
                          withEnsName
                          className="block sm:hidden"
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {commaNumber(formatUnits(autoIssuance.count, token?.data?.decimals || 18))}{" "}
                    {formatTokenSymbol(token)}
                  </TableCell>
                  <TableCell>
                    {autoIssuance.startsAt &&
                      format(autoIssuance.startsAt * 1000, "MMM dd, yyyy p")}
                  </TableCell>
                  <TableCell>
                    {autoIssuance.distributed ? (
                      <div className="text-zinc-400 flex flex-row gap-2 items-center">
                        <EtherscanLink
                          value={autoIssuance.distributedTxn}
                          type="tx"
                          truncateTo={4}
                        />
                        <CheckIcon className="w-4 h-4 text-teal-500" />
                      </div>
                    ) : (
                      <Button
                        disabled={(autoIssuance?.startsAt || 0) >= now}
                        loading={(isPending || isLoading) && autoIssueId === autoIssuance.id}
                        onClick={() => {
                          writeContract({
                            abi: revDeployerAbi,
                            functionName: "autoIssueFor",
                            address: contractAddress(RevnetCoreContracts.REVDeployer),
                            args: [
                              BigInt(autoIssuance.projectId),
                              autoIssuance.stageId,
                              autoIssuance.beneficiary as `0x${string}`,
                            ],
                          });
                          setAutoIssueId(autoIssuance.id);
                        }}
                      >
                        Distribute
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
