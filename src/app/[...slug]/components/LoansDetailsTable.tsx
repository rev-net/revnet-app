import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { LoansDetailsByAccountDocument } from "@/generated/graphql";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatSeconds } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChainLogo } from "@/components/ChainLogo";
import { Button } from "@/components/ui/button";

export function LoanDetailsTable({
  revnetId,
  address,
  onSelectLoan,
  chainId,
  tokenSymbol,
  title,
  selectedLoanId,
}: {
  revnetId: bigint;
  address: string;
  onSelectLoan?: (loanId: string, chainId: number) => void;
  chainId?: number;
  tokenSymbol: string;
  title?: string;
  selectedLoanId?: string;
}) {
  const { data } = useBendystrawQuery(LoansDetailsByAccountDocument, {
    owner: address,
    projectId: Number(revnetId),
  }, {
    pollInterval: 3000, // Refresh every 3 seconds
  });
  if (!data?.loans?.items) return null;

  const now = Math.floor(Date.now() / 1000);
  const filteredLoans =
    chainId && chainId !== 0
      ? data.loans.items.filter((loan) => Number(loan.chainId) === chainId)
      : data.loans.items;
  if (!filteredLoans.length)
    return null;

  const sortedLoans = [...filteredLoans].sort((a, b) => {
    const timeA = a.prepaidDuration - (now - Number(a.createdAt));
    const timeB = b.prepaidDuration - (now - Number(b.createdAt));
    return timeA - timeB;
  });
  return (
    <>
      {title && <p className="text-md font-semibold mt-6 mb-4 text-black">{title}</p>}
      <div className="max-h-96 overflow-auto bg-zinc-50 border border-zinc-200">
        <div className="flex flex-col p-2 overflow-x-auto">
          <div className="min-w-full">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chain</TableHead>
                <TableHead className="text-left pr-4">Borrowed</TableHead>
                <TableHead className="text-left pr-4">Collateral</TableHead>
                <TableHead className="text-left pr-6">Fees Increase In</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLoans.map((loan) => (
                <TableRow
                  key={`${loan.id}-${loan.createdAt}`}
                  className={`hover:bg-zinc-100 ${selectedLoanId === loan.id ? "bg-zinc-100" : ""}`}
                >
                  <TableCell className="whitespace-nowrap">
                    {(loan.chainId in JB_CHAINS) ? (
                      <ChainLogo chainId={loan.chainId as JBChainId} width={15} height={15} />
                    ) : (
                      <span>{loan.chainId}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="whitespace-nowrap">
                          {(Number(loan.borrowAmount) / 1e18).toFixed(4)} ETH
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Loan ID: {loan.id?.toString() ?? "Unavailable"}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="whitespace-nowrap">
                      {(Number(loan.collateral) / 1e18).toFixed(4)}&nbsp;{tokenSymbol}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="whitespace-nowrap">
                      {formatSeconds(Math.max(0, loan.prepaidDuration - (now - Number(loan.createdAt))))}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectLoan?.(loan.id, Number(loan.chainId))}
                      className="text-xs px-2 py-1"
                    >
                      Repay
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}