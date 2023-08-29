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
          <TableHead className="w-[100px]">Account</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Tokens</TableHead>
          <TableHead>% ownership</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participantsData?.participants.map((participant) => (
          <TableRow key={participant.id}>
            <TableCell>
              <EthereumAddress address={participant.wallet.id} short withEns />
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
