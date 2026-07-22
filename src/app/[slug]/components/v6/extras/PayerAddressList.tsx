"use client";

import { ChainLogo } from "@/components/ChainLogo";
import { TableSkeleton } from "@/components/loading/LoadingSkeletons";
import { EthereumAddress } from "@/components/EthereumAddress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JB_CHAINS, JBChainId } from "@bananapus/nana-sdk-core";
import { formatDistanceToNow } from "date-fns";
import { Address, isAddress, zeroAddress } from "viem";
import { formatUsd, PayerRow, usdFromScaled } from "./projectPayers";

function timeAgo(ts?: number | null): string | null {
  if (!ts) return null;
  try {
    return formatDistanceToNow(new Date(Number(ts) * 1000), { addSuffix: true });
  } catch {
    return null;
  }
}

function countsText(row: PayerRow): string {
  const parts: string[] = [];
  if (row.paymentsCount) parts.push(`${row.paymentsCount} pay`);
  if (row.addToBalanceCount) parts.push(`${row.addToBalanceCount} balance`);
  return parts.length ? parts.join(" | ") : "No payments yet";
}

function facilitatedText(row: PayerRow): string {
  const usd = usdFromScaled(row.totalFacilitatedUsd);
  if (usd && usd > 0) return formatUsd(usd);
  // The raw aggregate adds payment-token base units across tokens with
  // different decimals; only the indexed USD figure has an honest denomination.
  try {
    return BigInt(String(row.totalFacilitated)) > 0n ? "Unpriced" : "$0";
  } catch {
    return "$0";
  }
}

/**
 * website/-parity renderProjectPayerAddresses: the sucker group's indexed
 * payer addresses from bendystraw, ordered by facilitated USD volume.
 */
export function PayerAddressList({
  rows,
  isLoading,
  isError,
}: {
  rows: PayerRow[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <section className="mt-8 bg-melon-50">
      <div className="bg-melon-100 px-4 py-3">
        <h4 className="text-sm font-semibold text-melon-800">Deployed payer addresses</h4>
        <p className="mt-1 text-xs text-zinc-500">
          Reuse an existing address or review how much each one has facilitated.
        </p>
      </div>
      <div className="p-4">
        {isLoading ? (
          <TableSkeleton rows={4} columns={4} />
        ) : isError ? (
          <div className="text-sm text-zinc-500">
            Could not load payer addresses from Bendystraw.
          </div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-zinc-500">No deployed payer addresses indexed yet.</div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                  <TableHead className="whitespace-nowrap font-medium px-3">Chain</TableHead>
                  <TableHead className="whitespace-nowrap font-medium px-3">Address</TableHead>
                  <TableHead className="whitespace-nowrap font-medium px-3">Behavior</TableHead>
                  <TableHead className="whitespace-nowrap font-medium px-3">Facilitated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const chainId = row.chainId as JBChainId;
                  const chain = JB_CHAINS[chainId];
                  const beneficiary =
                    row.defaultBeneficiary &&
                    isAddress(row.defaultBeneficiary) &&
                    row.defaultBeneficiary.toLowerCase() !== zeroAddress
                      ? (row.defaultBeneficiary as Address)
                      : null;
                  const created = timeAgo(row.createdAt);
                  const lastUsed = timeAgo(row.lastUsedAt);
                  return (
                    <TableRow key={`${row.chainId}-${row.address}`}>
                      <TableCell className="whitespace-nowrap px-3 py-3 align-top">
                        <span className="flex items-center gap-2">
                          <ChainLogo chainId={chainId} width={16} height={16} />
                          {chain?.name ?? row.chainId}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-3 align-top">
                        {isAddress(row.address) ? (
                          <EthereumAddress
                            address={row.address as Address}
                            short
                            chain={chain?.chain}
                          />
                        ) : (
                          <span className="font-mono text-xs">{row.address}</span>
                        )}
                        {created ? (
                          <div className="text-xs text-zinc-500">Created {created}</div>
                        ) : null}
                      </TableCell>
                      <TableCell className="px-3 py-3 align-top">
                        <div>{row.defaultAddToBalance ? "Add to balance" : "Pay"}</div>
                        <div className="text-xs text-zinc-500">
                          {row.defaultAddToBalance ? (
                            "No tokens minted"
                          ) : beneficiary ? (
                            <span className="inline-flex items-center gap-1">
                              Tokens mint to{" "}
                              <EthereumAddress
                                address={beneficiary}
                                short
                                withEnsName
                                chain={chain?.chain}
                                className="text-xs"
                              />
                            </span>
                          ) : (
                            "Tokens mint to the sender"
                          )}
                        </div>
                        <div className="text-xs text-zinc-500">{countsText(row)}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-3 align-top">
                        <div>{facilitatedText(row)}</div>
                        <div className="text-xs text-zinc-500">
                          {lastUsed ? `Last used ${lastUsed}` : "Never used"}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </section>
  );
}
