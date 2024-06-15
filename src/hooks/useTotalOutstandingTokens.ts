import {
  useJBContractContext,
  useReadJbControllerPendingReservedTokenBalanceOf,
  useReadJbTokensTotalSupplyOf,
} from "juice-sdk-react";

export function useTotalOutstandingTokens() {
  const { projectId } = useJBContractContext();

  const { data: tokensReserved } = useReadJbControllerPendingReservedTokenBalanceOf(
    {
      args: [projectId],
    }
  );
  const { data: totalTokenSupply } = useReadJbTokensTotalSupplyOf({
    args: [projectId],
  });
  const totalOutstandingTokens =
    (totalTokenSupply ?? 0n) + (tokensReserved ?? 0n);

  return totalOutstandingTokens;
}
