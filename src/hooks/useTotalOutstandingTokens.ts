import {
  OrderDirection,
  Participant,
  Participant_OrderBy,
  ParticipantsDocument,
} from "@/generated/graphql";
import { useOmnichainSubgraphQuery } from "@/graphql/useOmnichainSubgraphQuery";
import {
  useJBChainId,
  useJBContractContext,
  useReadJbControllerPendingReservedTokenBalanceOf,
} from "juice-sdk-react";
import { zeroAddress } from "viem";

export function useTotalOutstandingTokens() {
  const { projectId, contracts } = useJBContractContext();
  const chainId = useJBChainId();
  const { data } = useOmnichainSubgraphQuery(ParticipantsDocument, {
    orderBy: Participant_OrderBy.balance,
    orderDirection: OrderDirection.desc,
    where: {
      projectId: Number(projectId),
      balance_gt: "0",
      wallet_not: zeroAddress,
    },
  });

  const omnichainTotalSupply = data?.reduce((acc, participant) => {
    return acc + (BigInt(participant.value?.response?.participants?.[0]?.balance ?? 0n));
  }, 0n);

  const { data: tokensReserved } =
    useReadJbControllerPendingReservedTokenBalanceOf({
      chainId,
      address: contracts.controller.data ?? undefined,
      args: [projectId],
    });

  const totalOutstandingTokens = omnichainTotalSupply ?? 0n;

  return totalOutstandingTokens;
}
