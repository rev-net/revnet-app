import { useCallback } from "react";
import { useChainId, useSwitchChain, useSendTransaction } from "wagmi";
import { ChainPayment } from "../types";

export function usePayRelayr() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const {
    sendTransaction
  } = useSendTransaction();

  const pay = useCallback(async (chainPayment: ChainPayment) => {
    // this doesn't work if user changes chains after page loads, how do we fix?
    if (chainId !== chainPayment.chain) {
      switchChain({ chainId: chainPayment.chain})
    }

    sendTransaction({
      to: chainPayment.target,
      value: BigInt(chainPayment.amount),
      data: chainPayment.calldata
    });
  }, [sendTransaction, chainId, switchChain]);

  return { pay };
}
