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
import { formatUnits, JB_CHAINS, JBChainId } from "juice-sdk-core";
import { ClaimButton } from "./ClaimButton";
import { ToRemoteButton } from "./ToRemoteButton";

interface Props {
  transactions: Pick<
    SuckerTransaction,
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
  if (!transactions || transactions.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-medium">Bridge Transactions</h2>
      <Table className="bg-zinc-50 border-zinc-200 border mt-2.5">
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Beneficiary</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <div className="flex items-center gap-2 shrink-0">
                  <ChainLogo chainId={tx.chainId as JBChainId} width={15} height={15} />
                  <span>{JB_CHAINS[tx.chainId as JBChainId]?.name ?? tx.chainId}</span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2 shrink-0">
                  <ChainLogo chainId={tx.peerChainId as JBChainId} width={15} height={15} />
                  <span>{JB_CHAINS[tx.peerChainId as JBChainId]?.name ?? tx.peerChainId}</span>
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
                {formatUnits(tx.projectTokenCount, tokenDecimals, { fractionDigits: 2 })}{" "}
              </TableCell>

              <TableCell className="text-right tabular-nums">
                {formatUnits(tx.terminalTokenAmount, 18, { fractionDigits: 4 })}{" "}
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
