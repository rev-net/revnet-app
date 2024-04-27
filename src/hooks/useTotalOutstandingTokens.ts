import {
  useJBContractContext,
  useJbControllerPendingReservedTokenBalanceOf,
  useJbTokensTotalSupplyOf,
} from "juice-sdk-react";

export function useTotalOutstandingTokens() {
  const { projectId } = useJBContractContext();

  const { data: tokensReserved } = useJbControllerPendingReservedTokenBalanceOf(
    {
      args: [projectId],
    }
  );
  const { data: totalTokenSupply } = useJbTokensTotalSupplyOf({
    args: [projectId],
  });
  const totalOutstandingTokens =
    (totalTokenSupply ?? 0n) + (tokensReserved ?? 0n);

  return totalOutstandingTokens;
}
