"use client";

import { useToast } from "@/components/ui/use-toast";
import { getTokenAToBIssuanceQuote, Quote } from "@/lib/quote";
import { Token } from "@/lib/token";
import { getUniswapQuotes } from "@/lib/uniswap/quote";
import { formatWalletError } from "@/lib/utils";
import { ETH_CURRENCY_ID, JBChainId, USD_CURRENCY_ID } from "juice-sdk-core";
import { useJBContractContext, useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";
import { parseUnits } from "viem";
import { useCurrencyPrice } from "./useCurrencyPrice";
import { useProjectBaseToken } from "./useProjectBaseToken";

export interface PaymentQuotes {
  all: Quote[];
  bestOnSelectedChain?: Quote;
  bestOnOtherChain?: Quote;
}

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

  const chainIds = Object.keys(baseToken?.tokenMap ?? {}).map((id) => Number(id) as JBChainId);

  async function tokenAToBQuote(valueRaw: string, token: Token): Promise<PaymentQuotes> {
    try {
      if (!ruleset?.data || !rulesetMetadata?.data || !tokenB || !baseToken) {
        throw new Error("Missing data. Please try again");
      }
      if (valueRaw === "0") return { all: [] };

      const amountIn = parseUnits(valueRaw, token.decimals);

      const issuanceQuote = getTokenAToBIssuanceQuote(
        amountIn,
        baseToken,
        token,
        usdToEthPrice,
        ruleset.data.weight,
        rulesetMetadata.data.reservedPercent,
        chainId,
      );

      const uniswapQuotes = await getUniswapQuotes(token, tokenB, amountIn, chainIds);

      const all = [issuanceQuote, ...uniswapQuotes].sort(
        (a, b) => b.payerTokens.toFloat() - a.payerTokens.toFloat(),
      );

      return {
        all,
        bestOnSelectedChain: all.find((q) => q.chainId === chainId),
        bestOnOtherChain: all.find((q) => q.chainId !== chainId),
      };
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: formatWalletError(err) });
      return { all: [] };
    }
  }

  return { tokenAToBQuote };
}
