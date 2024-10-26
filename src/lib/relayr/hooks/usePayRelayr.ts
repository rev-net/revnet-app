import { useCallback } from "react";
import { useChainId, useSwitchChain, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { ChainPayment } from "./useDeployRevnetRelay";

export function usePayRelayr() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const {
    sendTransaction
  } = useSendTransaction();

  const pay = useCallback(async (chainPayment: ChainPayment) => {
    sendTransaction({
      to: chainPayment.target,
      amount: chainPayment.amount,
      data: chainPayment.calldata
    })
  }, [sendTransaction]);
}
