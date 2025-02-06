import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "juice-sdk-react";
// import { useReadRevDeployerUnrealizedAutoIssuanceAmountOf } from "revnet-sdk";
import { formatUnits } from "juice-sdk-core";
import { formatTokenSymbol } from "@/lib/utils";
import { commaNumber } from "@/lib/number";
import { EthereumAddress } from "@/components/EthereumAddress";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";

export function AutoIssuance() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();
  const { token } = useJBTokenContext();

  const autoIssuances = useAutoIssuances();

  // const { data: unrealized } = useReadRevDeployerUnrealizedAutoIssuanceAmountOf(
  //   {
  //     chainId,
  //     args: [projectId],
  //   }
  // );

  const now = Math.floor(new Date().getTime() / 1000);

  return (
    <div className="max-h-96 overflow-auto bg-zinc-50 border-zinc-200 border mb-4">
      <div className="flex flex-col p-2">
        {/* {unrealized && token.data && (
          <div className="ml-2 italic">
            Total unrealized auto-issuance tokens:{" "}
            {commaNumber(formatUnits(unrealized, token.data.decimals))}{" "}
            {formatTokenSymbol(token)}
          </div>
        )} */}
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
                    <Button disabled={(autoIssuance?.startsAt || 0) >= now}>
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
