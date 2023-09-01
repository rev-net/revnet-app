import { EthereumAddress } from "@/components/EthereumAddress";
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
import { FetchTokenResult } from "wagmi/dist/actions";

export function ParticipantsTable({
  participants,
  token,
  totalSupply,
}: {
  participants: ParticipantsQuery;
  token: FetchTokenResult;
  totalSupply: bigint;
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
              <EthereumAddress
                address={participant.wallet.id}
                short
                withEnsAvatar
                withEnsName
              />
            </TableCell>
            <TableCell>{formatEther(participant.volume)} ETH</TableCell>
            <TableCell>
              {formatUnits(participant.balance, token.decimals)} {token.symbol}
            </TableCell>
            <TableCell>
              {parseFloat(
                ((BigInt(participant.balance) * 1000n) / totalSupply).toString()
              ) / 10}
              %
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
