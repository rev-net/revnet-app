"use client";

import { ChainLogo } from "@/components/ChainLogo";
import { EthereumAddress } from "@/components/EthereumAddress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Participant } from "@/generated/graphql";
import { prettyNumber } from "@/lib/number";
import { formatPortion, formatTokenSymbol } from "@/lib/utils";
import { formatUnits } from "@bananapus/nana-sdk-core";
import { JBChainId } from "@bananapus/nana-sdk-react";
import { Address } from "viem";
import { UseTokenReturnType } from "wagmi";

export function ParticipantsTable({
  participants,
  token,
  totalSupply,
  baseTokenSymbol = "ETH",
  baseTokenDecimals = 18,
  condensed = false,
  maxRows,
}: {
  participants: (Participant & { chains: JBChainId[] })[];
  token: UseTokenReturnType["data"] | null;
  totalSupply: bigint;
  baseTokenSymbol?: string;
  baseTokenDecimals?: number;
  condensed?: boolean;
  maxRows?: number;
}) {
  if (participants.length === 0) {
    return (
      <div className="text-center text-zinc-400">No owners yet. Pay in to become an owner.</div>
    );
  }

  const visibleParticipants = maxRows ? participants.slice(0, maxRows) : participants;

  return (
    <Table className={condensed ? "min-w-[720px]" : undefined}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-auto md:w-1/2">Account</TableHead>
          <TableHead>{condensed ? "Share" : "Balance"}</TableHead>
          <TableHead>Chains</TableHead>
          <TableHead>Paid</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleParticipants.map((participant) => (
          <TableRow key={participant?.address}>
            <TableCell>
              <div className="flex flex-col sm:flex-row items-center">
                <div className="hidden sm:flex">
                  <EthereumAddress
                    address={participant?.address as Address}
                    short
                    withEnsAvatar
                    withEnsName
                  />
                </div>
                <div className="flex sm:hidden">
                  <EthereumAddress
                    address={participant?.address as Address}
                    short
                    withEnsAvatar
                    withEnsName
                  />
                </div>
              </div>
            </TableCell>
            {token && condensed ? (
              <TableCell className="whitespace-nowrap tabular-nums">
                <span className="font-semibold">
                  {participant.balance
                    ? formatPortion(BigInt(participant.balance), totalSupply)
                    : 0}
                  %
                </span>
              </TableCell>
            ) : token ? (
              <TableCell className="whitespace-nowrap pr-14">
                {prettyNumber(
                  formatUnits(participant.balance, token.decimals, {
                    fractionDigits: 3,
                  }),
                )}{" "}
                {formatTokenSymbol(token.symbol)} {" | "}
                <span className="font-bold">
                  {participant.balance
                    ? formatPortion(BigInt(participant.balance), totalSupply)
                    : 0}
                  %
                </span>
              </TableCell>
            ) : null}
            <TableCell className="whitespace-nowrap pr-20">
              <div className="flex items-center gap-1">
                {participant.chains.map((chain) => (
                  <ChainLogo chainId={chain} key={chain} width={14} height={14} />
                ))}
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {formatUnits(participant.volume, baseTokenDecimals, {
                fractionDigits: 3,
              })}{" "}
              {baseTokenSymbol}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
