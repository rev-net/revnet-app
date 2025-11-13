"use client";

import { PaymentQuotes } from "@/hooks/usePaymentQuote";
import { isUsd } from "@/lib/currency";
import { Quote } from "@/lib/quote";
import { formatTokenSymbol } from "@/lib/utils";
import { JB_CHAINS, TokenAmountType } from "juice-sdk-core";
import { useEtherPrice, useJBTokenContext } from "juice-sdk-react";
import { useState } from "react";

interface Props {
  quotes: PaymentQuotes;
  amountIn: TokenAmountType;
}

export function PayFormQuoteDetails(props: Props) {
  const { quotes, amountIn } = props;
  const { bestOnSelectedChain: quote, bestOnOtherChain, all } = quotes;
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: ethPrice = 1 } = useEtherPrice();
  const tokenB = useJBTokenContext().token.data;

  if (!quote || all.length === 0 || amountIn.amount._value === 0n) return null;

  const liquidity = liquidityInUsd(quote.pool?.liquidity, amountIn.symbol, ethPrice);

  const suggestAnotherChain =
    !!bestOnOtherChain && (bestOnOtherChain?.payerTokens || 0) > quote.payerTokens;

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-2 py-1 text-xs bg-zinc-200 hover:bg-zinc-300 rounded-sm"
      >
        {quote.type === "amm" ? "AMM" : "Issuance"}
      </button>

      {isExpanded && (
        <div className="space-y-2  mt-4 text-xs">
          {all
            .sort((a, b) => (a.type === "issuance" ? -1 : 1))
            .map((quote) => (
              <div key={`${quote.chainId}-${quote.type}`}>
                <strong className="font-medium">
                  {quote.type === "issuance" ? "Issuance" : "AMM"}:{" "}
                </strong>
                <span>
                  {pricePerToken(quote, amountIn).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {formatTokenSymbol(tokenB?.symbol)} / {amountIn.symbol}
                </span>
                {quote.type === "amm" && liquidity && (
                  <span>
                    , ${liquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })} liquidity
                  </span>
                )}
              </div>
            ))}
          {suggestAnotherChain && (
            <div className="font-medium text-orange-500">
              Better AMM price found on {JB_CHAINS[bestOnOtherChain.chainId].name}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function pricePerToken(quote: Quote, amountIn: TokenAmountType) {
  return quote.payerTokens.toFloat() / amountIn.amount.toFloat();
}

function liquidityInUsd(
  liquidity: string | undefined,
  symbol: string | undefined,
  ethPrice: number | undefined,
) {
  if (!liquidity || !symbol) return undefined;
  if (isUsd(symbol)) return Number(liquidity);
  if (symbol === "ETH" && ethPrice) return Number(liquidity) * ethPrice;
  return undefined;
}
