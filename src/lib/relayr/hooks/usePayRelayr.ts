import { useCallback, useState } from "react";
import { useChainId, useSwitchChain, useSendTransaction } from "wagmi";
import { ChainPayment } from "../types";

export function usePayRelayr() {
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const [isProcessing, setIsProcessing] = useState(false);

  const pay = useCallback(async (chainPayment: ChainPayment) => {
    try {
      setIsProcessing(true);
      if (chainId !== chainPayment.chain) {
        await switchChainAsync({ chainId: chainPayment.chain });

        if (chainId !== chainPayment.chain) {
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
    } finally {
      setIsProcessing(false);
    }
  }, [sendTransactionAsync, chainId, switchChainAsync]);

  return {
    pay,
    isProcessing
  };
}
