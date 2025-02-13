import { useState, useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { format } from "date-fns";
import { useJBTokenContext } from "juice-sdk-react";
import { useWriteRevDeployerAutoIssueFor } from "revnet-sdk";
import { formatUnits } from "juice-sdk-core";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTokenSymbol } from "@/lib/utils";
import { commaNumber } from "@/lib/number";
import { EthereumAddress } from "@/components/EthereumAddress";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";
import { toast } from "@/components/ui/use-toast";

export function AutoIssuance() {
  const { token } = useJBTokenContext();
  const autoIssuances = useAutoIssuances();
  const now = Math.floor(new Date().getTime() / 1000);
  const [autoIssueId, setAutoIssueId] = useState<string | null>(null);

  const { writeContract, isPending, data } = useWriteRevDeployerAutoIssueFor();

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
                          address={autoIssuance.beneficiary}
                          short
                          withEnsAvatar
                          withEnsName
                          className="hidden sm:block"
                        />
                        <EthereumAddress
                          address={autoIssuance.beneficiary}
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
                    {commaNumber(
                      formatUnits(autoIssuance.count, token?.data?.decimals || 18)
                    )}{" "}
                    {formatTokenSymbol(token)}
                  </TableCell>
                  <TableCell>
                    {autoIssuance.startsAt &&
                      format(autoIssuance.startsAt * 1000, "MMM dd, yyyy p")}
                  </TableCell>
                  <TableCell>
                    <Button
                      disabled={(autoIssuance?.startsAt || 0) >= now}
                      loading={
                        (isPending || isLoading) &&
                        autoIssueId === autoIssuance.id
                      }
                      onClick={() => {
                        writeContract({
                          args: [
                            autoIssuance.revnetId,
                            autoIssuance.stageId,
                            autoIssuance.beneficiary,
                          ],
                        });
                        setAutoIssueId(autoIssuance.id);
                      }}
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
  );
}
