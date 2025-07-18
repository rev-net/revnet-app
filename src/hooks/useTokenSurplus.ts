import {
    JBChainId,
    NATIVE_TOKEN,
    NATIVE_TOKEN_DECIMALS
} from "juice-sdk-core";
import {
    useJBChainId,
    useJBContractContext,
    useReadJbMultiTerminalCurrentSurplusOf
} from "juice-sdk-react";

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

  const _chainId = chainId ?? useJBChainId();
  const _token = token ?? (primaryNativeTerminal?.data as `0x${string}`) ?? NATIVE_TOKEN as `0x${string}`;
  const _currency = currency ?? 61166; // ETH currency ID
  const _decimals = decimals ?? NATIVE_TOKEN_DECIMALS;
  const _inTermsOfCurrency = inTermsOfCurrency ?? 61166;
  const _inTermsOfDecimals = inTermsOfDecimals ?? NATIVE_TOKEN_DECIMALS;

  return useReadJbMultiTerminalCurrentSurplusOf({
    chainId: _chainId,
    address: primaryNativeTerminal.data ?? undefined,
    args: [
      projectId,
      [
        {
          token: _token,
          decimals: _decimals,
          currency: _currency,
        },
      ],
      BigInt(_inTermsOfDecimals),
      BigInt(_inTermsOfCurrency),
    ],
  });
}