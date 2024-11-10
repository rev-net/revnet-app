import { getTokenRedemptionQuoteEth } from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useJBRulesetContext,
  useNativeTokenSurplus,
  useReadJbControllerPendingReservedTokenBalanceOf,
  useReadJbTokensTotalSupplyOf,
} from "juice-sdk-react";

/**
 * Return the amount of ETH (wei) received from redeerming [tokenAmountWei] project tokens.
 */
export function useTokenRedemptionQuote(
  tokenAmountWei: bigint | undefined,
  { chainId }: { chainId?: JBChainId }
): bigint | undefined {
  const { projectId, contracts } = useJBContractContext();
  /**
   * note: assumes that redemption rate is the same across all chains
   */
  const { rulesetMetadata } = useJBRulesetContext();
  const jbChainId = useJBChainId();
  const _chainId = chainId ?? jbChainId;
  const { data: totalSupply } = useReadJbTokensTotalSupplyOf({
    chainId: _chainId,
    args: [projectId],
  });
  const { data: nativeTokenSurplus } = useNativeTokenSurplus({
    chainId: _chainId,
  });

  const { data: tokensReserved } =
    useReadJbControllerPendingReservedTokenBalanceOf({
      chainId: _chainId,
      address: contracts.controller.data ?? undefined,
      args: [projectId],
    });
  const redemptionRate = rulesetMetadata.data?.redemptionRate?.value;

  if (
    !redemptionRate ||
    !totalSupply ||
    !tokensReserved ||
    !tokenAmountWei ||
    !nativeTokenSurplus
  ) {
    return;
  }

  return getTokenRedemptionQuoteEth(tokenAmountWei, {
    redemptionRate: Number(redemptionRate),
    totalSupply,
    tokensReserved,
    overflowWei: nativeTokenSurplus,
  });
}
