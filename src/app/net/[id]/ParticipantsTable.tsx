import { EthereumAddress } from "@/components/EthereumAddress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ParticipantsQuery } from "@/generated/graphql";
import { formatEther, formatUnits } from "@/lib/juicebox/utils";
import { ForwardIcon } from "@heroicons/react/24/solid";
import { Address, isAddressEqual } from "viem";
import { FetchTokenResult } from "wagmi/dist/actions";

export function ParticipantsTable({
  participants,
  token,
  totalSupply,
  boostRecipient,
}: {
  participants: ParticipantsQuery;
  token: FetchTokenResult;
  totalSupply: bigint;
  boostRecipient?: Address;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-auto md:w-1/2">Account</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Tokens</TableHead>
          <TableHead>Ownership %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants?.participants.map((participant) => (
          <TableRow key={participant.id}>
            <TableCell>
              <div className="flex items-center">
              <EthereumAddress
                address={participant.wallet.id}
                short
                withEnsAvatar
                withEnsName
              />
              {boostRecipient &&
              isAddressEqual(
                boostRecipient,
                participant.wallet.id as Address
              ) ? (
                <Badge variant="secondary" className="ml-2 font-normal">
                  <ForwardIcon className="w-4 h-4 mr-1 inline-block" />
                  Boost
                </Badge>
              ) : null}
              </div>
            </TableCell>
            <TableCell>{formatEther(participant.volume)} ETH</TableCell>
            <TableCell>
              {formatUnits(participant.balance, token.decimals)} {token.symbol}
            </TableCell>
            <TableCell>
              {participant.balance
                ? parseFloat(
                    (
                      (BigInt(participant.balance) * 1000n) /
                      totalSupply
                    ).toString()
                  ) / 10
                : 0}
              %
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
