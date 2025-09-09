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
    address: (primaryNativeTerminal.data as `0x${string}`) ?? undefined,
    args: [
      projectId,
      [
        {
          token: NATIVE_TOKEN,
          decimals: NATIVE_TOKEN_DECIMALS,
          currency: 1,
        },
      ],
      BigInt(NATIVE_TOKEN_DECIMALS),
      BigInt(1),
    ],
  });
}
