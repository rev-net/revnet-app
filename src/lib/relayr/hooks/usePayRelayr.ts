import { useCallback } from "react";
import { useChainId, useSwitchChain, useSendTransaction } from "wagmi";
import { ChainPayment } from "./useDeployRevnetRelay";
import { getChainId } from "viem/actions";

export function usePayRelayr() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const {
    sendTransaction
  } = useSendTransaction();

  const pay = useCallback(async (chainPayment: ChainPayment) => {
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
