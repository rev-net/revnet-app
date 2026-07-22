import {
  jbMultiTerminalAbi,
  jbMultiTerminalV5Abi,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
} from "@bananapus/nana-sdk-core";
import { useJBChainId, useJBContractContext } from "@bananapus/nana-sdk-react";
import { useReadContract } from "wagmi";

export function useNativeTokenSurplus() {
  const {
    projectId,
    version,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();

  const chainId = useJBChainId();

  // v6 takes token addresses; v4/v5 take accounting context structs.
  const v6Query = useReadContract({
    abi: jbMultiTerminalAbi,
    functionName: "currentSurplusOf",
    chainId,
    address: primaryNativeTerminal.data ?? undefined,
    args: [projectId, [NATIVE_TOKEN], BigInt(NATIVE_TOKEN_DECIMALS), BigInt(1)],
    query: { enabled: version === 6 },
  });

  const legacyQuery = useReadContract({
    abi: jbMultiTerminalV5Abi,
    functionName: "currentSurplusOf",
    chainId,
    address: primaryNativeTerminal.data ?? undefined,
    args: [
      projectId,
      [{ token: NATIVE_TOKEN, decimals: NATIVE_TOKEN_DECIMALS, currency: 1 }],
      BigInt(NATIVE_TOKEN_DECIMALS),
      BigInt(1),
    ],
    query: { enabled: version !== 6 },
  });

  return version === 6 ? v6Query : legacyQuery;
}
