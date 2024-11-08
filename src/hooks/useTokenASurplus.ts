import { NATIVE_TOKEN } from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useReadJbMultiTerminalCurrentSurplusOf,
} from "juice-sdk-react";

export function useNativeTokenSurplus() {
  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const chainId = useJBChainId()

  return useReadJbMultiTerminalCurrentSurplusOf({
    chainId,
    address: primaryNativeTerminal.data ?? undefined,
    args: [projectId, 18n, BigInt(NATIVE_TOKEN)],
  });
}
