import { JB_REDEEM_FEE_PERCENT } from "@/app/constants";
import { NATIVE_CURRENCY_ID, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useJBTerminalContext,
  useReadJbTerminalStoreCurrentReclaimableSurplusOf,
} from "juice-sdk-react";

/**
 * Return the amount of ETH (wei) received from redeerming [tokenAmountWei] project tokens.
 */
export function useTokenCashOutQuoteEth(
  tokenAmountWei: bigint | undefined,
  { chainId }: { chainId?: JBChainId }
) {
  const { projectId } = useJBContractContext();
  const { store } = useJBTerminalContext();
  const jbChainId = useJBChainId();
  const _chainId = chainId ?? jbChainId;

  return useReadJbTerminalStoreCurrentReclaimableSurplusOf({
    chainId: _chainId,
    address: store.data ?? undefined,
    args: tokenAmountWei
      ? [
          projectId,
          tokenAmountWei,
          [],
          [],
          BigInt(NATIVE_TOKEN_DECIMALS),
          BigInt(NATIVE_CURRENCY_ID),
        ]
      : undefined,
    query: {
      select(data: bigint) {
        return (data * BigInt((1 - JB_REDEEM_FEE_PERCENT) * 1000)) / 1000n; // account for JB fee on redemption
      },
    },
  });
}
