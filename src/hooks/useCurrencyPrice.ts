"use client";

import { JBChainId, JBCoreContracts, jbPricesAbi } from "juice-sdk-core";
import { useJBContractContext } from "juice-sdk-react";
import { useReadContract } from "wagmi";

export function useCurrencyPrice(
  fromCurrencyId: number,
  toCurrencyId: number,
  chainId: JBChainId | undefined,
  enabled: boolean = true,
) {
  const { projectId, contractAddress } = useJBContractContext();

  const { data, isLoading, error, refetch } = useReadContract({
    address: chainId ? contractAddress(JBCoreContracts.JBPrices, chainId) : undefined,
    abi: jbPricesAbi,
    functionName: "pricePerUnitOf",
    args: [projectId, BigInt(fromCurrencyId), BigInt(toCurrencyId), 18n],
    chainId,
    query: { enabled: enabled && !!chainId },
  });

  return {
    price: data || null,
    isLoading,
    error,
    refetch,
  };
}
