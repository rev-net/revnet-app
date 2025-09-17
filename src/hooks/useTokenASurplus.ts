import { jbMultiTerminalAbi, NATIVE_TOKEN, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { useJBChainId, useJBContractContext } from "juice-sdk-react";
import { useReadContract } from "wagmi";

export function useNativeTokenSurplus() {
  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();

  const chainId = useJBChainId();

  return useReadContract({
    abi: jbMultiTerminalAbi,
    functionName: "currentSurplusOf",
    chainId,
    address: primaryNativeTerminal.data ?? undefined,
    args: [
      projectId,
      [{ token: NATIVE_TOKEN, decimals: NATIVE_TOKEN_DECIMALS, currency: 1 }],
      BigInt(NATIVE_TOKEN_DECIMALS),
      BigInt(1),
    ],
  });
}
