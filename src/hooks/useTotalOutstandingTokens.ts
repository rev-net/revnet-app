import {
  useJBContractContext,
  useReadJbControllerPendingReservedTokenBalanceOf,
  useReadJbTokensTotalSupplyOf,
} from "juice-sdk-react";

export function useTotalOutstandingTokens() {
  const { projectId, contracts } = useJBContractContext();

  const { data: tokensReserved } =
    useReadJbControllerPendingReservedTokenBalanceOf({
      address: contracts.controller.data ?? undefined,
      args: [projectId],
    });
  const { data: totalTokenSupply } = useReadJbTokensTotalSupplyOf({
    args: [projectId],
  });
  const totalOutstandingTokens =
    (totalTokenSupply ?? 0n) + (tokensReserved ?? 0n);

  return totalOutstandingTokens;
}
