import { useCallback } from "react";
import { useChainId, useSwitchChain, useSendTransaction } from "wagmi";
import { ChainPayment } from "../types";

export function usePayRelayr() {
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();

  const pay = useCallback(async (chainPayment: ChainPayment) => {
    try {
      if (chainId !== chainPayment.chain) {
        try {
          await switchChainAsync({ chainId: chainPayment.chain });
        } catch (e) {
          console.error(e);
          throw new Error("Failed to switch to correct chain");
        }
      }

      const tx = await sendTransactionAsync({
        to: chainPayment.target,
        value: BigInt(chainPayment.amount),
        data: chainPayment.calldata
      });

      return tx;
    } catch (error) {
      throw error;
    }
  }, [sendTransactionAsync, chainId, switchChainAsync]);

  return {
    pay,
  };
}
