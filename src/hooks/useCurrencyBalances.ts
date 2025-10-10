"use client";

import { Currency } from "@/lib/currency";
import { useMemo } from "react";
import { erc20Abi } from "viem";
import { useAccount, useBalance, useReadContracts } from "wagmi";

export function useCurrencyBalances(currencies: Currency[], chainId: number) {
  const { address } = useAccount();

  const erc20Currencies = useMemo(() => currencies.filter((c) => !c.isNative), [currencies]);

  const erc20Contracts = useMemo(
    () =>
      erc20Currencies.map((c) => ({
        chainId,
        abi: erc20Abi,
        address: c.address,
        functionName: "balanceOf",
        args: [address],
      })),
    [erc20Currencies, address, chainId],
  );

  const { data: erc20Data, isLoading: isErc20Loading } = useReadContracts({
    contracts: erc20Contracts,
    query: { refetchOnMount: false },
  });

  const { data: nativeData, isLoading: isNativeLoading } = useBalance({
    address,
    chainId,
    query: { refetchOnMount: false },
  });

  const balances = useMemo(() => {
    const map = new Map<string, bigint>();
    erc20Currencies.forEach((c, idx) => {
      const r = erc20Data?.[idx]?.result;
      if (typeof r === "bigint") map.set(c.address, r);
    });

    const nativeCurrency = currencies.find((c) => c.isNative);
    if (nativeCurrency && nativeData?.value != null) {
      map.set(nativeCurrency.address, nativeData.value);
    }
    return map;
  }, [currencies, erc20Currencies, erc20Data, nativeData]);

  return { balances, isLoading: isErc20Loading || isNativeLoading };
}
