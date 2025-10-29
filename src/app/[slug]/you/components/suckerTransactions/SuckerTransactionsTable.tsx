import "server-only";

import { ChainLogo } from "@/components/ChainLogo";
import { Profile } from "@/components/Profile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SuckerTransaction } from "@/generated/graphql";
import { cn, etherscanLink } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { formatUnits, JB_CHAINS, JB_TOKEN_DECIMALS, JBChainId } from "juice-sdk-core";
import { ClaimButton } from "./ClaimButton";
import { ToRemoteButton } from "./ToRemoteButton";
import { TransactionsFilter } from "./TransactionsFilter";

interface Props {
  transactions: Pick<
    SuckerTransaction,
    | "createdAt"
    | "chainId"
    | "peerChainId"
    | "status"
    | "beneficiary"
    | "projectTokenCount"
    | "terminalTokenAmount"
    | "sucker"
    | "token"
    | "index"
    | "peer"
  >[];
  tokenDecimals: number;
  tokenSymbol: string;
}

export async function SuckerTransactionsTable(props: Props) {
  const { transactions, tokenDecimals, tokenSymbol } = props;

  const hasTransactions = transactions.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-lg font-medium">Bridge Transactions</h2>
        <TransactionsFilter />
      </div>
      <Table className="bg-zinc-50 border-zinc-200 border">
        <TableHeader>
          <TableRow>
            <TableHead>Initiated</TableHead>
            <TableHead>Chains</TableHead>
            <TableHead>Beneficiary</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!hasTransactions && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-zinc-500">
                No transactions found
              </TableCell>
            </TableRow>
          )}
          {hasTransactions &&
            transactions.map((tx, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  {formatDistanceToNow(tx.createdAt * 1000, { addSuffix: true })}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ChainLogo chainId={tx.chainId as JBChainId} width={20} height={20} />
                    <span className="text-zinc-500">→</span>
                    <ChainLogo chainId={tx.peerChainId as JBChainId} width={20} height={20} />
                  </div>
                </TableCell>

                <TableCell>
                  <Profile address={tx.beneficiary}>
                    {({ identity, avatar }) => (
                      <a
                        href={etherscanLink(tx.beneficiary, {
                          type: "address",
                          chain: JB_CHAINS[tx.peerChainId as JBChainId].chain,
                        })}
                        className="flex items-center gap-2 hover:underline"
                      >
                        {avatar && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatar}
                            alt={identity ?? ""}
                            width={32}
                            height={32}
                            className="rounded-full size-5"
                          />
                        )}
                        <span className="text-sm">{identity}</span>
                      </a>
                    )}
                  </Profile>
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {formatUnits(tx.projectTokenCount, JB_TOKEN_DECIMALS, { fractionDigits: 2 })}{" "}
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {formatUnits(tx.terminalTokenAmount, tokenDecimals, { fractionDigits: 4 })}{" "}
                  {tokenSymbol || "ETH"}
                </TableCell>

                <TableCell>
                  <StatusBadge status={tx.status} />
                </TableCell>
                <TableCell>
                  {tx.status === "pending" && (
                    <ToRemoteButton
                      chainId={tx.chainId as JBChainId}
                      sucker={tx.sucker as `0x${string}`}
                      token={tx.token as `0x${string}`}
                    />
                  )}
                  {tx.status === "claimable" && <ClaimButton transaction={tx} />}
                  {tx.status === "claimed" && "-"}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: SuckerTransaction["status"] }) {
  return (
    <span
      className={cn("inline-block px-2 py-1 rounded text-xs", {
        "bg-green-100 text-green-800": status === "claimed",
        "bg-yellow-100 text-yellow-800": status === "pending",
        "bg-orange-100 text-orange-800": status === "claimable",
      })}
    >
      {status}
    </span>
  );
}
