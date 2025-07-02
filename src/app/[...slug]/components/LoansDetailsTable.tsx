import { JB_CHAINS, JBChainId, NATIVE_TOKEN, NATIVE_TOKEN_DECIMALS, ETH_CURRENCY_ID } from "juice-sdk-core";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { LoansDetailsByAccountDocument } from "@/generated/graphql";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatSeconds } from "@/lib/utils";
import { useReadRevLoansBorrowableAmountFrom } from "revnet-sdk";
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

// Constants for loan calculations and display
const LOAN_CONSTANTS = {
  CURRENCY_ID: ETH_CURRENCY_ID,
  EFFICIENCY_THRESHOLDS: {
    HIGH: 90,      // Green color threshold
    MEDIUM: 70,    // Yellow color threshold
    REALLOCATION_OPPORTUNITY: 80, // Show reallocation opportunity below this
  },
  DECIMAL_PLACES: {
    BORROWED_AMOUNT: 6,
    COLLATERAL_AMOUNT: 6,
    EFFICIENCY_PERCENTAGE: 1,
    UNUSED_CAPACITY: 6,
  },
  POLL_INTERVAL: 3000, // Refresh every 3 seconds
  TABLE_MAX_HEIGHT: "max-h-96",
} as const;

// Custom hook to calculate loan efficiency
function useLoanEfficiency(loan: any, projectId: bigint) {
  const { data: maxBorrowableWithCurrentCollateral } = useReadRevLoansBorrowableAmountFrom({
    chainId: loan?.chainId && loan.chainId in JB_CHAINS ? (loan.chainId as JBChainId) : undefined,
    args: loan && loan.chainId && loan.chainId in JB_CHAINS
      ? [
          projectId,
          BigInt(loan.collateral || 0),
          BigInt(NATIVE_TOKEN_DECIMALS),
          BigInt(LOAN_CONSTANTS.CURRENCY_ID),
        ]
      : undefined,
  });

  if (!maxBorrowableWithCurrentCollateral || !loan || !loan.chainId || !(loan.chainId in JB_CHAINS)) {
    return {
      unusedCapacity: 0n,
      borrowingEfficiency: 0,
      hasReallocationOpportunity: false,
    };
  }

  const unusedCapacity = maxBorrowableWithCurrentCollateral - BigInt(loan.borrowAmount || 0);
  const borrowingEfficiency = (Number(loan.borrowAmount || 0) / Number(maxBorrowableWithCurrentCollateral)) * 100;
  const hasReallocationOpportunity = borrowingEfficiency < LOAN_CONSTANTS.EFFICIENCY_THRESHOLDS.REALLOCATION_OPPORTUNITY; // Show opportunity if efficiency < 80%

  return {
    unusedCapacity,
    borrowingEfficiency,
    hasReallocationOpportunity,
  };
}

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
  const { unusedCapacity, borrowingEfficiency, hasReallocationOpportunity } = useLoanEfficiency(loan, revnetId);
  const nativeTokenSymbol = useNativeTokenSymbol();

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
              {(Number(loan.borrowAmount) / 1e18).toFixed(LOAN_CONSTANTS.DECIMAL_PLACES.BORROWED_AMOUNT)} {nativeTokenSymbol}
            </span>
          </TooltipTrigger>
          <TooltipContent>Loan ID: {loan.id?.toString() ?? "Unavailable"}</TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="text-left px-3 py-2">
        <span className="whitespace-nowrap">
          {(Number(loan.collateral) / 1e18).toFixed(LOAN_CONSTANTS.DECIMAL_PLACES.COLLATERAL_AMOUNT)}&nbsp;{tokenSymbol}
        </span> 
      </TableCell>
      <TableCell className="text-left px-3 py-2">
        <div className="text-sm">
          <div className={`font-medium ${borrowingEfficiency > LOAN_CONSTANTS.EFFICIENCY_THRESHOLDS.HIGH ? 'text-green-600' : borrowingEfficiency > LOAN_CONSTANTS.EFFICIENCY_THRESHOLDS.MEDIUM ? 'text-yellow-600' : 'text-red-600'}`}>
            {borrowingEfficiency.toFixed(LOAN_CONSTANTS.DECIMAL_PLACES.EFFICIENCY_PERCENTAGE)}%
          </div>
        </div>
      </TableCell>
      <TableCell className="text-left px-3 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-sm cursor-help">
              <div className="font-medium">
                {Number(formatUnits(unusedCapacity, NATIVE_TOKEN_DECIMALS)).toFixed(LOAN_CONSTANTS.DECIMAL_PLACES.UNUSED_CAPACITY)} {nativeTokenSymbol}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {hasReallocationOpportunity 
              ? `You can borrow ${Number(formatUnits(unusedCapacity, NATIVE_TOKEN_DECIMALS)).toFixed(LOAN_CONSTANTS.DECIMAL_PLACES.UNUSED_CAPACITY)} more ${nativeTokenSymbol} without adding collateral`
              : 'Loan is already efficient - consider adding more collateral to borrow more'
            }
          </TooltipContent>
        </Tooltip>
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
  const { data } = useBendystrawQuery(LoansDetailsByAccountDocument, {
    owner: address,
    projectId: Number(revnetId),
  }, {
    pollInterval: LOAN_CONSTANTS.POLL_INTERVAL, // Refresh every 3 seconds
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
      <div className={LOAN_CONSTANTS.TABLE_MAX_HEIGHT + " overflow-auto bg-zinc-50 border border-zinc-200"}>
        <div className="flex flex-col p-2 overflow-x-auto">
          <div className="min-w-full">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left px-3 py-2">Chain</TableHead>
                <TableHead className="text-left px-3 py-2">Borrowed</TableHead>
                <TableHead className="text-left px-3 py-2">Collateral</TableHead>
                <TableHead className="text-left px-3 py-2">Efficiency</TableHead>
                <TableHead className="text-left px-3 py-2">Unused Capacity</TableHead>
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