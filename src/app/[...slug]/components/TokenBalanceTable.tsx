import { JBChainId, JB_CHAINS } from "juice-sdk-core";
import {
  useReadRevLoansBorrowableAmountFrom,
} from "revnet-sdk";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { LoansByAccountDocument } from "@/generated/graphql";
import { useEffect, useRef } from "react";
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
        <TableCell className="text-left">
          {JB_CHAINS[chainId]?.name || chainId}
        </TableCell>
      )}
      {columns.includes("holding") && (
        <TableCell className="text-right">{formatAmount(balanceValue)} {tokenSymbol}</TableCell>
      )}
      {columns.includes("borrowable") && (
        <TableCell className="text-right">{formatAmount(borrowableAmount)} ETH</TableCell>
      )}
      {columns.includes("debt") && (
        <TableCell className="text-right">{formatAmount(summary?.borrowAmount)} ETH</TableCell>
      )}
      {columns.includes("collateral") && (
        <TableCell className="text-right">{formatAmount(summary?.collateral)} {tokenSymbol}</TableCell>
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
  selectedChainId,
  onCheckRow,
  onAutoselectRow,
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
  selectedChainId?: number;
  onCheckRow?: (chainId: number, checked: boolean) => void;
  onAutoselectRow?: (chainId: number) => void;
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

  // Auto-select the first selectable row if more than one row and no selection exists
  const firstSelectable = balances?.find(({ chainId, balance }) => {
    const summary = loanSummary[chainId];
    return (
      balance.value > 0n ||
      (summary?.borrowAmount && summary.borrowAmount > 0n) ||
      (summary?.collateral && summary.collateral > 0n)
    );
  });

  const hasAutoselected = useRef(false);

  useEffect(() => {
    // Only auto-select if there's a selectable row, no selection, and we haven't yet auto-selected
    if (
      firstSelectable &&
      (typeof selectedChainId === "undefined" || selectedChainId === null) &&
      !hasAutoselected.current
    ) {
      hasAutoselected.current = true;
      // Only call onAutoselectRow, which should be responsible for syncing all related state
      onAutoselectRow?.(firstSelectable.chainId);
    }
  }, [firstSelectable, selectedChainId, onAutoselectRow]);

  if (!balances || balances.length === 0) return null;

  return (
    <div className="w-full max-w-md mb-5">
        <label className="block text-gray-700 text-sm font-bold mb-1">
          On which chain?
        </label>
        <div className="max-h-96 overflow-auto bg-zinc-50 border border-zinc-200">
          <div className="flex flex-col p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-4" />
                  {columns.includes("chain") && <TableHead className="text-left">Chain</TableHead>}
                  {columns.includes("holding") && <TableHead className="text-right">Balance</TableHead>}
                  {columns.includes("borrowable") && <TableHead className="text-right">Borrowable</TableHead>}
                  {columns.includes("debt") && <TableHead className="text-right">Debt</TableHead>}
                  {columns.includes("collateral") && <TableHead className="text-right">Collateral</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((balance, index) => {
                  const chainId = balance.chainId as JBChainId;
                  const summary = loanSummary[chainId];

                  const hasAnyBalance =
                    balance.balance.value > 0n ||
                    (summary?.borrowAmount && summary.borrowAmount > 0n) ||
                    (summary?.collateral && summary.collateral > 0n);

                  if (!hasAnyBalance) return null;

                  const checked = selectedChainId === chainId;

                  return (
                    <TableRow
                      key={index}
                      className={`cursor-pointer hover:bg-zinc-100 ${checked ? "bg-zinc-100" : ""}`}
                      onClick={() => onCheckRow?.(chainId, true)}
                    >
                      <TableCell className="text-center">
                        <input
                          type="radio"
                          name="chain"
                          checked={checked}
                          onChange={() => onCheckRow?.(chainId, true)}
                        />
                      </TableCell>
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
    </div>
  );
}