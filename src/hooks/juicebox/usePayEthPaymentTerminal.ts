import { DEFAULT_MEMO, DEFAULT_METADATA } from "@/lib/juicebox/constants";
import {
  jbethPaymentTerminal3_1_2ABI,
  usePrepareJbethPaymentTerminal3_1_2Pay,
} from "juice-hooks";
import { Hash } from "viem";
import {
  UsePrepareContractWriteConfig,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

interface PayParams {
  projectId: bigint;
  terminalAddress: Hash | undefined;
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
    address as Hash,
    minReturnedTokens,
    preferClaimedTokens,
    memo ?? DEFAULT_MEMO,
    "0x00",
  ] as const;

  const { config } = usePrepareContractWrite({
    abi: jbethPaymentTerminal3_1_2ABI,
    address: terminalAddress,
    functionName: "pay",
    args,
    value: amountWei,
    enabled: Boolean(address && terminalAddress && amountWei > 0n),
  } as UsePrepareContractWriteConfig<typeof jbethPaymentTerminal3_1_2ABI, "pay">);

  const { data, write, isError, error } = useContractWrite(config);
  if (isError) {
    console.error("usePay::usePrepareContractWrite::error", error);
  }

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash
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
