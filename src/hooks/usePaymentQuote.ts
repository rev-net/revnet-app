"use client";

import { useToast } from "@/components/ui/use-toast";
import { resolveBestV6PayRoute } from "@/lib/paymentTerminal";
import {
  currenciesMatchForWeight,
  getTokenAToBIssuanceQuoteWithWeightRatio,
  paymentCurrencyId,
  Quote,
} from "@/lib/quote";
import { Token } from "@/lib/token";
import { getUniswapQuotes } from "@/lib/uniswap/quote";
import { formatWalletError } from "@/lib/utils";
import { getViemPublicClient } from "@/lib/wagmiConfig";
import {
  ETH_CURRENCY_ID,
  getJBContractAddress,
  JBChainId,
  JBCoreContracts,
  jbPricesAbi,
  JBProjectToken,
  JBVersion,
  ReservedPercent,
  RulesetWeight,
  USD_CURRENCY_ID,
} from "@bananapus/nana-sdk-core";
import { useJBContractContext, useJBRulesetContext, useJBTokenContext } from "@bananapus/nana-sdk-react";
import { parseUnits, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useCurrencyPrice } from "./useCurrencyPrice";
import { useProjectBaseToken } from "./useProjectBaseToken";

export interface PaymentQuotes {
  all: Quote[];
  bestOnSelectedChain?: Quote;
  bestOnOtherChain?: Quote;
}

export function usePaymentQuote(chainId: JBChainId, projectId: bigint) {
  const { version } = useJBContractContext();
  const baseToken = useProjectBaseToken();
  const tokenB = useJBTokenContext().token.data;
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { toast } = useToast();
  const { address } = useAccount();

  // Gates quoting until the ETH/USD feed is ready (cross-currency paths).
  const { isLoading: isPriceLoading } = useCurrencyPrice(
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

      // v6 quotes come from an on-chain preview of the best pay route (supports
      // multi-token pays like USDC via the router registry); v4/v5 replicate the
      // terminal store's weight-ratio issuance math.
      const issuanceQuote =
        version === 6
          ? await getV6IssuanceQuote({
              chainId,
              projectId,
              token,
              amountIn,
              beneficiary: address ?? zeroAddress,
            })
          : await getLegacyIssuanceQuote({
              chainId,
              projectId,
              token,
              amountIn,
              baseToken,
              baseCurrency: Number(rulesetMetadata.data.baseCurrency),
              weight: ruleset.data.weight,
              reservedPercent: rulesetMetadata.data.reservedPercent,
              version,
            });

      const uniswapQuotes = await getUniswapQuotes(token, tokenB, amountIn, chainIds);

      const all = [...(issuanceQuote ? [issuanceQuote] : []), ...uniswapQuotes].sort(
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

  return { tokenAToBQuote, isPriceLoading };
}

/**
 * v4/v5 issuance quote matching JBTerminalStore.recordPaymentFrom: 1:1 when the payment
 * currency is the ruleset's base currency, else via the live JBPrices feed.
 */
async function getLegacyIssuanceQuote(args: {
  chainId: JBChainId;
  projectId: bigint;
  token: Token;
  amountIn: bigint;
  baseToken: Pick<Token, "address"> & { currency?: number };
  baseCurrency: number;
  weight: RulesetWeight;
  reservedPercent: ReservedPercent;
  version: JBVersion;
}): Promise<Quote | null> {
  const { chainId, projectId, token, amountIn, baseToken, baseCurrency, weight, reservedPercent, version } =
    args;

  try {
    const amountCurrency = paymentCurrencyId(token, baseToken);
    let weightRatio: bigint;

    if (currenciesMatchForWeight(amountCurrency, baseCurrency)) {
      weightRatio = 10n ** BigInt(token.decimals);
    } else {
      weightRatio = await getViemPublicClient(chainId).readContract({
        address: getJBContractAddress(JBCoreContracts.JBPrices, version, chainId),
        abi: jbPricesAbi,
        functionName: "pricePerUnitOf",
        args: [projectId, BigInt(amountCurrency), BigInt(baseCurrency), BigInt(token.decimals)],
      });
    }

    return getTokenAToBIssuanceQuoteWithWeightRatio(
      amountIn,
      weightRatio,
      weight,
      reservedPercent,
      chainId,
    );
  } catch (err) {
    console.error("legacy issuance quote failed:", err);
    return null;
  }
}

async function getV6IssuanceQuote(args: {
  chainId: JBChainId;
  projectId: bigint;
  token: Token;
  amountIn: bigint;
  beneficiary: `0x${string}`;
}): Promise<Quote | null> {
  const { chainId, projectId, token, amountIn, beneficiary } = args;

  try {
    const route = await resolveBestV6PayRoute({
      client: getViemPublicClient(chainId),
      chainId,
      projectId,
      token: token.address,
      amount: amountIn,
      beneficiary,
    });

    if (!route) return null;

    return {
      chainId,
      type: "issuance",
      payerTokens: new JBProjectToken(route.preview.beneficiaryTokenCount),
      reservedTokens: new JBProjectToken(route.preview.reservedTokenCount),
      terminal: { address: route.address, type: route.type },
    };
  } catch (err) {
    console.error("v6 issuance quote failed:", err);
    return null;
  }
}
