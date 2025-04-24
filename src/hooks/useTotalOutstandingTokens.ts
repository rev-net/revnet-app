// import {
//   OrderDirection,
//   Participant,
//   Participant_OrderBy,
//   ParticipantsDocument,
// } from "@/generated/graphql";
// import { useOmnichainSubgraphQuery } from "@/graphql/useOmnichainSubgraphQuery";
// import {
//   useJBChainId,
//   useJBContractContext,
//   useReadJbControllerPendingReservedTokenBalanceOf,
// } from "juice-sdk-react";
// import { zeroAddress } from "viem";

// // TODO use contract call JBTokens.totalSupplyOf()
// export function useTotalOutstandingTokens() {
//   const { projectId, contracts } = useJBContractContext();
//   const chainId = useJBChainId();
//   const { data } = useOmnichainSubgraphQuery(ParticipantsDocument, {
//     orderBy: Participant_OrderBy.balance,
//     orderDirection: OrderDirection.desc,
//     where: {
//       projectId: Number(projectId),
//       wallet_not: zeroAddress,
//     },
//   });

//   const omnichainTotalSupply = data?.reduce((acc, contribution) => {
//     const participants = contribution.value?.response?.participants || [];
//     const chainTotal = participants.reduce(
//       (chainAcc, participant) => chainAcc + BigInt(participant?.balance || 0),
//       0n
//     );
//     return acc + chainTotal;
//   }, 0n) || 0n;

//   const { data: tokensReserved } =
//     useReadJbControllerPendingReservedTokenBalanceOf({
//       chainId,
//       address: contracts.controller.data ?? undefined,
//       args: [projectId],
//     });

//   // Add the reserved tokens to the total outstanding tokens
//   const totalOutstandingTokens = omnichainTotalSupply + (tokensReserved || 0n);

//   return totalOutstandingTokens;
// }
