import { ChainLogo } from "@/components/ChainLogo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoansByAccountDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { JBChainId, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { useCallback, useEffect, useMemo } from "react";
import { useReadRevLoansBorrowableAmountFrom } from "revnet-sdk";

// ===== TYPES =====
type ColumnType = "chain" | "holding" | "borrowable" | "debt" | "collateral";

interface Balance {
  chainId: number;
  balance: {
    value: bigint;
  };
}

interface LoanSummary {
  borrowAmount: bigint;
  collateral: bigint;
}

interface TokenBalanceRowProps {
  chainId: JBChainId;
  balanceValue: bigint;
  projectId: bigint;
  tokenSymbol: string;
  summary?: LoanSummary;
  showHeader: boolean;
  columns: ColumnType[];
}

interface TokenBalanceTableProps {
  balances: Balance[] | undefined;
  projectId: bigint;
  tokenSymbol: string;
  terminalAddress: `0x${string}`;
  address: string;
  columns?: ColumnType[];
  selectedChainId?: number;
  onCheckRow?: (chainId: number, checked: boolean) => void;
  onAutoselectRow?: (chainId: number) => void;
}

// ===== CONSTANTS =====
const DEFAULT_COLUMNS: ColumnType[] = ["chain", "holding", "borrowable", "debt", "collateral"];
const ETH_CURRENCY_ID = 1n;

// ===== UTILITY FUNCTIONS =====
function formatAmount(value?: bigint): string {
  return value !== undefined ? (Number(value) / 1e18).toFixed(5) : "—";
}

function summarizeLoansByChain(
  loans?: Array<{ chainId: number; collateral: string; borrowAmount: string }>,
): Record<number, LoanSummary> {
  if (!loans) return {};

  return loans.reduce<Record<number, LoanSummary>>((acc, loan) => {
    const { chainId, collateral, borrowAmount } = loan;
    if (!acc[chainId]) {
      acc[chainId] = { collateral: 0n, borrowAmount: 0n };
    }
    acc[chainId].collateral += BigInt(collateral);
    acc[chainId].borrowAmount += BigInt(borrowAmount);
    return acc;
  }, {});
}

// ===== CUSTOM HOOKS =====
function useLoanSummary(address: string) {
  const { data } = useBendystrawQuery(LoansByAccountDocument, {
    owner: address,
  });

  return useMemo(() => summarizeLoansByChain(data?.loans?.items), [data?.loans?.items]);
}

// ===== COMPONENTS =====
function TokenBalanceRow({
  chainId,
  balanceValue,
  projectId,
  tokenSymbol,
  summary,
  showHeader,
  columns,
}: TokenBalanceRowProps) {
  const { data: borrowableAmount } = useReadRevLoansBorrowableAmountFrom({
    chainId,
    args: [projectId, balanceValue, BigInt(NATIVE_TOKEN_DECIMALS), ETH_CURRENCY_ID],
  });

  const renderCell = useCallback(
    (column: ColumnType) => {
      switch (column) {
        case "chain":
          return (
            <TableCell key={column} className="whitespace-nowrap w-32 px-3 py-2">
              <div className="flex items-center">
                <ChainLogo chainId={chainId} width={14} height={14} />
              </div>
            </TableCell>
          );
        case "holding":
          return (
            <TableCell key={column} className="text-left px-3 py-2">
              <span className="whitespace-nowrap">
                {formatAmount(balanceValue)} {tokenSymbol}
              </span>
            </TableCell>
          );
        case "borrowable":
          return (
            <TableCell key={column} className="text-left px-3 py-2">
              <span className="whitespace-nowrap">{formatAmount(borrowableAmount)} ETH</span>
            </TableCell>
          );
        case "debt":
          return (
            <TableCell key={column} className="text-left px-3 py-2">
              <span className="whitespace-nowrap">{formatAmount(summary?.borrowAmount)} ETH</span>
            </TableCell>
          );
        case "collateral":
          return (
            <TableCell key={column} className="text-left px-3 py-2">
              <span className="whitespace-nowrap">
                {formatAmount(summary?.collateral)} {tokenSymbol}
              </span>
            </TableCell>
          );
        default:
          return null;
      }
    },
    [chainId, balanceValue, tokenSymbol, borrowableAmount, summary],
  );

  return <>{columns.map(renderCell)}</>;
}

function TableHeaderRow({ columns }: { columns: ColumnType[] }) {
  const getHeaderText = useCallback((column: ColumnType) => {
    switch (column) {
      case "chain":
        return "Chain";
      case "holding":
        return "Balance";
      case "borrowable":
        return "Borrowable";
      case "debt":
        return "Debt";
      case "collateral":
        return "Collateral";
      default:
        return "";
    }
  }, []);

  return (
    <TableRow>
      <TableHead className="w-4 px-3 py-2" />
      {columns.map((column) => (
        <TableHead key={column} className="text-left px-3 py-2">
          {getHeaderText(column)}
        </TableHead>
      ))}
    </TableRow>
  );
}

function TableRowItem({
  balance,
  index,
  projectId,
  tokenSymbol,
  columns,
  selectedChainId,
  loanSummary,
  onCheckRow,
}: {
  balance: Balance;
  index: number;
  projectId: bigint;
  tokenSymbol: string;
  columns: ColumnType[];
  selectedChainId?: number;
  loanSummary: Record<number, LoanSummary>;
  onCheckRow?: (chainId: number, checked: boolean) => void;
}) {
  const chainId = balance.chainId as JBChainId;
  const summary = loanSummary[chainId];

  // Get borrowable amount for this chain
  const { data: borrowableAmount } = useReadRevLoansBorrowableAmountFrom({
    chainId,
    args: [projectId, balance.balance.value, BigInt(NATIVE_TOKEN_DECIMALS), ETH_CURRENCY_ID],
  });

  // Check if this chain is selectable (has borrowable amount)
  const isSelectable = borrowableAmount && borrowableAmount > 0n;

  const checked = selectedChainId === chainId;

  const handleRowClick = useCallback(() => {
    if (isSelectable) {
      onCheckRow?.(chainId, true);
    }
  }, [chainId, onCheckRow, isSelectable]);

  const handleRadioChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isSelectable && e.target.checked) {
        onCheckRow?.(chainId, true);
      }
    },
    [chainId, onCheckRow, isSelectable],
  );

  // Only show chains that have token balance
  if (balance.balance.value === 0n) return null;

  return (
    <TableRow
      key={index}
      className={`${isSelectable ? "cursor-pointer hover:bg-zinc-100" : "cursor-not-allowed opacity-60"} ${checked ? "bg-zinc-100" : ""}`}
      onClick={handleRowClick}
    >
      <TableCell className="text-center px-3 py-2">
        <input
          type="radio"
          name="chain"
          checked={checked}
          disabled={!isSelectable}
          onChange={handleRadioChange}
          className={!isSelectable ? "opacity-50" : ""}
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
}

// ===== MAIN COMPONENT =====
export function TokenBalanceTable({
  balances,
  projectId,
  tokenSymbol,
  terminalAddress,
  address,
  columns = DEFAULT_COLUMNS,
  selectedChainId,
  onCheckRow,
  onAutoselectRow,
}: TokenBalanceTableProps) {
  const loanSummary = useLoanSummary(address);

  // Check if selected chain has no borrowable amount, if not auto-select one that does
  useEffect(() => {
    if (selectedChainId && balances && onAutoselectRow) {
      const selectedBalance = balances.find((b) => b.chainId === selectedChainId);
      if (selectedBalance && selectedBalance.balance.value === 0n) {
        // Selected chain has no balance, find first chain with balance
        const firstWithBalance = balances.find((b) => b.balance.value > 0n);
        if (firstWithBalance) {
          onAutoselectRow(firstWithBalance.chainId);
        }
      }
    }
  }, [selectedChainId, balances, onAutoselectRow]);

  // Auto-select first chain with balance if no chain is selected
  useEffect(() => {
    if (
      (selectedChainId === undefined || selectedChainId === null) &&
      balances &&
      onAutoselectRow
    ) {
      const firstWithBalance = balances.find((b) => b.balance.value > 0n);
      if (firstWithBalance) {
        onAutoselectRow(firstWithBalance.chainId);
      }
    }
  }, [selectedChainId, balances, onAutoselectRow]);

  // Early return for empty state
  if (!balances || balances.length === 0) return null;

  return (
    <div className="w-full max-w-md mb-5">
      <label className="block text-gray-700 text-sm font-bold mb-1">On which chain?</label>
      <div className="max-h-96 overflow-auto bg-zinc-50 border border-zinc-200">
        <div className="flex flex-col overflow-x-auto">
          <div className="min-w-full">
            <Table>
              <TableHeader>
                <TableHeaderRow columns={columns} />
              </TableHeader>
              <TableBody>
                {balances.map((balance, index) => (
                  <TableRowItem
                    key={`${balance.chainId}-${index}`}
                    balance={balance}
                    index={index}
                    projectId={projectId}
                    tokenSymbol={tokenSymbol}
                    columns={columns}
                    selectedChainId={selectedChainId}
                    loanSummary={loanSummary}
                    onCheckRow={onCheckRow}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
