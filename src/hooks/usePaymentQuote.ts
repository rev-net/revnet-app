"use client";

import { useToast } from "@/components/ui/use-toast";
import { Token } from "@/lib/token";
import { formatWalletError } from "@/lib/utils";
import { FixedInt } from "fpnum";
import {
  ETH_CURRENCY_ID,
  getTokenAToBQuote,
  getTokenBtoAQuote,
  JBChainId,
  USD_CURRENCY_ID,
} from "juice-sdk-core";
import { useJBContractContext, useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";
import { formatUnits, parseUnits } from "viem";
import { useCurrencyPrice } from "./useCurrencyPrice";
import { useProjectBaseToken } from "./useProjectBaseToken";

export function usePaymentQuote(chainId: JBChainId) {
  const { version } = useJBContractContext();
  const baseToken = useProjectBaseToken();
  const tokenB = useJBTokenContext().token.data;
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { toast } = useToast();

  const { price: usdToEthPrice } = useCurrencyPrice(
    USD_CURRENCY_ID(version),
    ETH_CURRENCY_ID,
    chainId,
  );

  function tokenAToBQuote(valueRaw: string, token: Token) {
    try {
      if (!ruleset?.data || !rulesetMetadata?.data || !tokenB) {
        throw new Error("Missing data. Please try again");
      }

      const amountInProjectCurrency = toProjectCurrencyAmount(
        valueRaw,
        determineConversion(baseToken.isNative, token.isNative),
        usdToEthPrice,
        baseToken.decimals,
      );

      const amountBQuote = getTokenAToBQuote(
        new FixedInt(amountInProjectCurrency, baseToken.decimals),
        {
          weight: ruleset.data.weight,
          reservedPercent: rulesetMetadata.data.reservedPercent,
        },
      );

      return {
        payerTokens: formatUnits(amountBQuote.payerTokens, tokenB.decimals),
        reservedTokens: formatUnits(amountBQuote.reservedTokens, tokenB.decimals),
      };
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: formatWalletError(err) });
      return { payerTokens: "0", reservedTokens: "0" };
    }
  }

  function tokenBtoAQuote(valueRaw: string, token: Token) {
    try {
      if (!ruleset?.data || !rulesetMetadata?.data || !tokenB) {
        throw new Error("Missing data. Please try again");
      }

      const value = FixedInt.parse(valueRaw, tokenB.decimals);

      const amountAQuote = getTokenBtoAQuote(value, tokenB.decimals, {
        weight: ruleset.data.weight,
        reservedPercent: rulesetMetadata.data.reservedPercent,
      });

      const conversion = determineConversion(baseToken.isNative, token.isNative);
      if (conversion === "NONE") return amountAQuote.format();

      const converted = fromProjectCurrencyAmount(
        amountAQuote.value,
        determineConversion(baseToken.isNative, token.isNative),
        usdToEthPrice,
      );

      if (!converted) throw new Error("Failed to convert project currency amount");

      return formatUnits(converted.amount, converted.decimals);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: formatWalletError(err) });
      return "0";
    }
  }

  return {
    tokenAToBQuote,
    tokenBtoAQuote,
  };
}

type Conversion = "NONE" | "USD_TO_ETH" | "ETH_TO_USDC";

function determineConversion(baseIsNative: boolean, selectedIsNative: boolean): Conversion {
  if (baseIsNative && !selectedIsNative) return "USD_TO_ETH";
  if (!baseIsNative && selectedIsNative) return "ETH_TO_USDC";
  return "NONE";
}

export function toProjectCurrencyAmount(
  valueRaw: string,
  conversion: Conversion,
  usdToEthPrice: bigint | null | undefined,
  projectDecimals: number,
): bigint {
  if (usdToEthPrice && conversion === "USD_TO_ETH") {
    const usd = parseUnits(valueRaw, 6);
    return (usd * 10n ** 30n) / usdToEthPrice; // 18d
  }
  if (usdToEthPrice && conversion === "ETH_TO_USDC") {
    const eth = parseUnits(valueRaw, 18);
    return (eth * usdToEthPrice) / 10n ** 30n; // 6d
  }
  return parseUnits(valueRaw, projectDecimals);
}

export function fromProjectCurrencyAmount(
  projectAmount: bigint,
  conversion: Conversion,
  usdToEthPrice: bigint | null | undefined,
): { amount: bigint; decimals: 6 | 18 } | null {
  if (!usdToEthPrice || conversion === "NONE") return null;
  if (conversion === "USD_TO_ETH") {
    const usd = (projectAmount * usdToEthPrice) / 10n ** 30n; // 6d
    return { amount: usd, decimals: 6 };
  }
  const eth = (projectAmount * 10n ** 30n) / usdToEthPrice; // 18d
  return { amount: eth, decimals: 18 };
}
