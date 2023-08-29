import { EthereumAddress } from "@/components/EthereumAddress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  OrderDirection,
  Participant_OrderBy,
  ParticipantsDocument,
  ParticipantsQuery,
  QueryParticipantsArgs,
} from "@/generated/graphql";
import { formatEther, formatUnits } from "@/lib/juicebox/utils";
import { useQuery } from "@apollo/client";
import { zeroAddress } from "viem";
import { FetchTokenResult } from "wagmi/dist/actions";
const PV = "2";

export function ParticipantsTable({
  projectId,
  token,
  totalSupply,
}: {
  projectId: bigint;
  token: FetchTokenResult;
  totalSupply: bigint;
}) {
  const { data: participantsData } = useQuery<
    ParticipantsQuery,
    QueryParticipantsArgs
  >(ParticipantsDocument, {
    variables: {
      orderBy: Participant_OrderBy.balance,
      orderDirection: OrderDirection.desc,
      where: {
        projectId: Number(projectId),
        pv: PV,
        balance_gt: "0",
        wallet_not: zeroAddress,
      },
    },
  });

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
        {participantsData?.participants.map((participant) => (
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
