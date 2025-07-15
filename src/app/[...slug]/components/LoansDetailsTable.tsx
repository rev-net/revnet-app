import { JB_CHAINS, JBChainId, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { LoansByAccountDocument } from "@/generated/graphql";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatSeconds } from "@/lib/utils";
import { formatUnits } from "viem";
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
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { useJBTokenContext, useSuckers } from "juice-sdk-react";
import { useReadRevLoansBorrowableAmountFrom } from "revnet-sdk";

// Constants for loan calculations and display
const LOAN_CONSTANTS = {
  CURRENCY_ID: 61166n,
  DECIMAL_PLACES: {
    BORROWED_AMOUNT: 6,
    COLLATERAL_AMOUNT: 6,
  },
  POLL_INTERVAL: 3000, // Refresh every 3 seconds
  TABLE_MAX_HEIGHT: "max-h-96",
} as const;

// Separate component for each loan row to avoid Rules of Hooks violation
function LoanRow({ 
  loan, 
  revnetId, 
  tokenSymbol, 
  selectedLoanId, 
  now, 
  onSelectLoan, 
  onReallocateLoan 
}: {
  loan: any;
  revnetId: bigint;
  tokenSymbol: string;
  selectedLoanId?: string;
  now: number;
  onSelectLoan?: (loanId: string, chainId: number) => void;
  onReallocateLoan?: (loan: any) => void;
}) {
  const nativeTokenSymbol = useNativeTokenSymbol();
  const { token } = useJBTokenContext();
  const projectTokenDecimals = token?.data?.decimals ?? 18;

  const borrowEth = Number(formatUnits(BigInt(loan.borrowAmount), NATIVE_TOKEN_DECIMALS)).toFixed(4);

  // Calculate headroom: current value of collateral - borrowed amount
  const { data: currentCollateralValue } = useReadRevLoansBorrowableAmountFrom({
    chainId: loan.chainId as JBChainId,
    args: [revnetId, BigInt(loan.collateral), BigInt(NATIVE_TOKEN_DECIMALS), LOAN_CONSTANTS.CURRENCY_ID],
  });

  const headroom = currentCollateralValue && currentCollateralValue > BigInt(loan.borrowAmount)
    ? currentCollateralValue - BigInt(loan.borrowAmount)
    : 0n;

  const headroomEth = Number(formatUnits(headroom, NATIVE_TOKEN_DECIMALS)).toFixed(4);

  return (
    <TableRow
      className={`hover:bg-zinc-100 ${selectedLoanId === loan.id ? "bg-zinc-100" : ""}`}
    >
      <TableCell className="whitespace-nowrap px-3 py-2">
        {(loan.chainId in JB_CHAINS) ? (
          <ChainLogo chainId={loan.chainId as JBChainId} width={15} height={15} />
        ) : (
          <span>{loan.chainId}</span>
        )}
      </TableCell>
      <TableCell className="text-left px-3 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="whitespace-nowrap">
              {borrowEth} {nativeTokenSymbol}
            </span>
          </TooltipTrigger>
          <TooltipContent>Loan ID: {loan.id?.toString() ?? "Unavailable"}</TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="text-left px-3 py-2">
        <span className="whitespace-nowrap">
          {Number(formatUnits(BigInt(loan.collateral), projectTokenDecimals)).toFixed(LOAN_CONSTANTS.DECIMAL_PLACES.COLLATERAL_AMOUNT)}&nbsp;{tokenSymbol}
        </span> 
      </TableCell>
      <TableCell className="text-left px-3 py-2">
        <span className="whitespace-nowrap">
          {headroomEth} {nativeTokenSymbol}
        </span>
      </TableCell>
      <TableCell className="text-left px-3 py-2">
        <span className="whitespace-nowrap text-gray-700">
          {formatSeconds(Math.max(0, loan.prepaidDuration - (now - Number(loan.createdAt))))}
        </span>
      </TableCell>
      <TableCell className="text-center px-3 py-2">
        <div className="flex gap-1 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectLoan?.(loan.id, Number(loan.chainId))}
            className="text-xs px-2 py-1"
          >
            Repay
          </Button>
          {onReallocateLoan && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReallocateLoan(loan)}
              className="text-xs px-2 py-1"
            >
              Reallocate
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function LoanDetailsTable({
  revnetId,
  address,
  onSelectLoan,
  onReallocateLoan,
  chainId,
  tokenSymbol,
  title,
  selectedLoanId,
}: {
  revnetId: bigint;
  address: string;
  onSelectLoan?: (loanId: string, chainId: number) => void;
  onReallocateLoan?: (loan: any) => void;
  chainId?: number;
  tokenSymbol: string;
  title?: string;
  selectedLoanId?: string;
}) {
  // Get all suckers (project deployments across chains) for this revnet
  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;
  
  // Get all project IDs across chains
  const projectIds = suckers?.map(sucker => Number(sucker.projectId)) || [Number(revnetId)];
  
  const { data } = useBendystrawQuery(LoansByAccountDocument, {
    owner: address,
  }, {
    pollInterval: LOAN_CONSTANTS.POLL_INTERVAL, // Refresh every 3 seconds
  });
  if (!data?.loans?.items) return null;

  const now = Math.floor(Date.now() / 1000);
  
  // Filter loans by all project IDs across chains
  const filteredLoans = data.loans.items.filter((loan) => 
    projectIds.includes(Number(loan.projectId))
  );
  
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
      <div className={LOAN_CONSTANTS.TABLE_MAX_HEIGHT + " overflow-auto bg-zinc-50 border border-zinc-200"}>
        <div className="flex flex-col p-2 overflow-x-auto">
          <div className="min-w-full">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left px-3 py-2">Chain</TableHead>
                <TableHead className="text-left px-3 py-2">Borrowed</TableHead>
                <TableHead className="text-left px-3 py-2">Locked Collateral</TableHead>
                <TableHead className="text-left px-3 py-2">Refinanceable</TableHead>
                <TableHead className="text-left px-3 py-2">Fees Increase In</TableHead>
                <TableHead className="text-left px-3 py-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLoans.map((loan) => (
                <LoanRow
                  key={`${loan.id}-${loan.createdAt}`}
                  loan={loan}
                  revnetId={revnetId}
                  tokenSymbol={tokenSymbol}
                  selectedLoanId={selectedLoanId}
                  now={now}
                  onSelectLoan={onSelectLoan}
                  onReallocateLoan={onReallocateLoan}
                />
              ))}
            </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}