import { NATIVE_TOKEN, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
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
  const chainId = useJBChainId();

  return useReadJbMultiTerminalCurrentSurplusOf({
    chainId,
    address: primaryNativeTerminal.data ?? undefined,
    args: [
      projectId,
      [
        {
          token: NATIVE_TOKEN,
          decimals: NATIVE_TOKEN_DECIMALS,
          currency: 61166,
        },
      ],
      BigInt(NATIVE_TOKEN_DECIMALS),
      BigInt(61166),
    ],
  });
}
