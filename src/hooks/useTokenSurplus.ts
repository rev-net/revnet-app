import { JBChainId, jbMultiTerminalAbi, NATIVE_TOKEN, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { useJBContractContext } from "juice-sdk-react";
import { useReadContract } from "wagmi";

/**
 * Return the current surplus of JB Native token, from the project's primary native terminal.
 */
export function useTokenSurplus({
  chainId,
  token,
  currency,
  decimals,
  inTermsOfCurrency,
  inTermsOfDecimals,
}: {
  chainId?: JBChainId;
  token?: `0x${string}`;
  currency?: number;
  decimals?: number;
  inTermsOfCurrency?: number;
  inTermsOfDecimals?: number;
} = {}) {
  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();

  const _chainId = chainId;
  const _token = token ?? primaryNativeTerminal?.data ?? NATIVE_TOKEN;
  const _currency = currency ?? 1; // ETH currency ID
  const _decimals = decimals ?? NATIVE_TOKEN_DECIMALS;
  const _inTermsOfCurrency = inTermsOfCurrency ?? 1;
  const _inTermsOfDecimals = inTermsOfDecimals ?? NATIVE_TOKEN_DECIMALS;

  return useReadContract({
    abi: jbMultiTerminalAbi,
    functionName: "currentSurplusOf",
    chainId: _chainId,
    address: primaryNativeTerminal.data ?? undefined,
    args: [
      projectId,
      [{ token: _token, decimals: _decimals, currency: _currency }],
      BigInt(_inTermsOfDecimals),
      BigInt(_inTermsOfCurrency),
    ],
  });
}
