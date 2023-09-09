import { DEFAULT_MEMO } from "@/lib/juicebox/constants";
import { usePrepareJbethPaymentTerminal3_1_2Pay } from "juice-hooks";
import { Address } from "viem";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";

interface PayParams {
  projectId: bigint;
  terminalAddress: Address | undefined;
  amountWei: bigint;
  token: Address;
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
    terminalAddress,
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
    address as Address,
    minReturnedTokens,
    preferClaimedTokens,
    memo ?? DEFAULT_MEMO,
    "0x0",
  ] as const;

  const { config } = usePrepareJbethPaymentTerminal3_1_2Pay({
    address: terminalAddress,
    args,
    value: amountWei,
    enabled: Boolean(address && terminalAddress && amountWei > 0n),
  });

  const { data, write, isError, error } = useContractWrite(config);
  if (isError) {
    console.error(
      "usePayEthPaymentTerminal::usePrepareContractWrite::error",
      error
    );
  }

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
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
