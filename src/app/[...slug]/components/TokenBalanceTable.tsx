import { JBChainId, JB_CHAINS } from "juice-sdk-core";
import {
  useReadRevLoansBorrowableAmountFrom,
} from "revnet-sdk";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { LoansByAccountDocument } from "@/generated/graphql";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function TokenBalanceRow({
  chainId,
  balanceValue,
  projectId,
  tokenSymbol,
  summary,
  showHeader,
  columns,
}: {
  chainId: JBChainId;
  balanceValue: bigint;
  projectId: bigint;
  tokenSymbol: string;
  summary?: { borrowAmount: bigint; collateral: bigint };
  showHeader: boolean;
  columns: Array<"chain" | "holding" | "borrowable" | "debt" | "collateral">;
}) {
  const { data: borrowableAmount } = useReadRevLoansBorrowableAmountFrom({
    chainId,
    args: [projectId, balanceValue, 18n, 61166n],
  });

  function formatAmount(value?: bigint): string {
    return value !== undefined ? (Number(value) / 1e18).toFixed(5) : "—";
  }

  const hasAnyBalance =
    balanceValue > 0n ||
    (borrowableAmount && borrowableAmount > 0n) ||
    (summary?.borrowAmount && summary.borrowAmount > 0n) ||
    (summary?.collateral && summary.collateral > 0n);

  if (!hasAnyBalance) return null;

  return (
    <>
      {columns.includes("chain") && (
        <TableCell className="text-xs py-1 text-left font-medium text-zinc-600">
          {JB_CHAINS[chainId]?.name || chainId}
        </TableCell>
      )}
      {columns.includes("holding") && (
        <TableCell className="text-xs py-1 text-right">{formatAmount(balanceValue)}</TableCell>
      )}
      {columns.includes("borrowable") && (
        <TableCell className="text-xs py-1 text-right">{formatAmount(borrowableAmount)}</TableCell>
      )}
      {columns.includes("debt") && (
        <TableCell className="text-xs py-1 text-right">{formatAmount(summary?.borrowAmount)}</TableCell>
      )}
      {columns.includes("collateral") && (
        <TableCell className="text-xs py-1 text-right">{formatAmount(summary?.collateral)}</TableCell>
      )}
    </>
  );
}

export function TokenBalanceTable({
  balances,
  projectId,
  tokenSymbol,
  terminalAddress,
  address,
  columns = ["chain", "holding", "borrowable", "debt", "collateral"],
}: {
  balances: {
    chainId: number;
    balance: {
      value: bigint;
    };
  }[] | undefined;
  projectId: bigint;
  tokenSymbol: string;
  terminalAddress: `0x${string}`;
  address: string;
  columns?: Array<"chain" | "holding" | "borrowable" | "debt" | "collateral">;
}) {
  const { data } = useBendystrawQuery(LoansByAccountDocument, {
    owner: address,
  });

  function summarizeLoansByChain(
    loans?: Array<{ chainId: number; collateral: string; borrowAmount: string }>
  ) {
    if (!loans) return {};
    return loans.reduce<Record<number, { collateral: bigint; borrowAmount: bigint }>>((acc, loan) => {
      const { chainId, collateral, borrowAmount } = loan;
      if (!acc[chainId]) {
        acc[chainId] = { collateral: 0n, borrowAmount: 0n };
      }
      acc[chainId].collateral += BigInt(collateral);
      acc[chainId].borrowAmount += BigInt(borrowAmount);
      return acc;
    }, {});
  }

  const loanSummary = summarizeLoansByChain(data?.loans?.items);

  if (!balances || balances.length === 0) return null;

  return (
    <div className="w-full max-w-md mb-5">
        <label className="block text-gray-700 text-sm font-bold mb-1">
          Your {tokenSymbol}
        </label>
        <div className="mt-1 max-h-96 overflow-auto bg-zinc-50 rounded-md border border-zinc-200">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.includes("chain") && <TableHead className="text-left">Chain</TableHead>}
              {columns.includes("holding") && <TableHead className="text-right">Holding</TableHead>}
              {columns.includes("borrowable") && <TableHead className="text-right">Borrowable (ETH)</TableHead>}
              {columns.includes("debt") && <TableHead className="text-right">Debt (ETH)</TableHead>}
              {columns.includes("collateral") && <TableHead className="text-right">Collateral</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {balances.map((balance, index) => {
              const chainId = balance.chainId as JBChainId;
              const summary = loanSummary[chainId];

              return (
                <TableRow key={index} className="h-auto">
                  <TokenBalanceRow
                    chainId={chainId}
                    balanceValue={balance.balance.value}
                    projectId={projectId}
                    tokenSymbol={tokenSymbol}
                    summary={summary}
                    showHeader={false}
                    columns={columns}
                  />
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}