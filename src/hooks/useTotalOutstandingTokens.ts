import {
  useJBChainId,
  useJBContractContext,
  useReadJbControllerPendingReservedTokenBalanceOf,
  useReadJbTokensTotalSupplyOf,
} from "juice-sdk-react";

export function useTotalOutstandingTokens() {
  const { projectId, contracts } = useJBContractContext();
  const chainId = useJBChainId();

  const { data: tokensReserved } =
    useReadJbControllerPendingReservedTokenBalanceOf({
      chainId,
      address: contracts.controller.data ?? undefined,
      args: [projectId],
    });
  const { data: totalTokenSupply } = useReadJbTokensTotalSupplyOf({
    chainId,
    args: [projectId],
  });
  const totalOutstandingTokens =
    (totalTokenSupply ?? 0n) + (tokensReserved ?? 0n);

  return totalOutstandingTokens;
}
