import { DEFAULT_MEMO, DEFAULT_METADATA } from "@/lib/juicebox/constants";
import { usePrepareJbethPaymentTerminal3_1_2Pay } from "juice-hooks";
import { Hash } from "viem";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";

interface PayParams {
  projectId: bigint;
  amountWei: bigint;
  token: Hash;
  minReturnedTokens: bigint;
  preferClaimedTokens: boolean;
  memo: string;
}

interface PayCallbacks {
  onSuccess?: () => void;
}

export function usePayEthPaymentTerminal(
  {
    projectId,
    amountWei,
    token,
    minReturnedTokens,
    preferClaimedTokens,
    memo,
  }: PayParams,
  { onSuccess }: PayCallbacks
) {
  const { address } = useAccount();

  const args = [
    projectId,
    amountWei,
    token,
    address as Hash,
    minReturnedTokens,
    preferClaimedTokens,
    memo ?? DEFAULT_MEMO,
    "0x00",
  ] as const;

  const { config } = usePrepareJbethPaymentTerminal3_1_2Pay({
    args,
    value: amountWei,
    enabled: Boolean(address && amountWei > 0n),
  });

  const { data, write, isError, error } = useContractWrite(config);
  if (isError) {
    console.error("usePay::usePrepareContractWrite::error", error);
  }

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      onSuccess?.();
    },
  });

  return {
    data,
    write,
    isLoading,
    isSuccess,
    error,
    isError,
  };
}
