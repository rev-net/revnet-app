"use client";

import { CardSkeleton } from "@/components/loading/LoadingSkeletons";
import { PaymentQuotes, usePaymentQuote } from "@/hooks/usePaymentQuote";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { getTokensForChain, Token } from "@/lib/token";
import { formatTokenSymbol } from "@/lib/utils";
import { Field, Formik } from "formik";
import { FixedInt } from "fpnum";
import { useJBContractContext, useJBTokenContext } from "@bananapus/nana-sdk-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";
import { PayDialog } from "./PayDialog";
import { PayFormQuoteDetails } from "./PayFormQuoteDetails";
import { PayInput } from "./PayInput";
import { useSelectedSucker } from "./SelectedSuckerContext";

export function PayForm() {
  const { version } = useJBContractContext();
  const tokenB = useJBTokenContext().token.data;
  const { peerChainId: chainId, projectId } = useSelectedSucker().selectedSucker;
  const { tokenAToBQuote, isPriceLoading } = usePaymentQuote(chainId, projectId);
  const baseToken = useProjectBaseToken();

  const [memo, setMemo] = useState<string>();
  const [resetKey, setResetKey] = useState(0);
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [amountC, setAmountC] = useState<string>("");
  const [quotes, setQuotes] = useState<PaymentQuotes>({ all: [] });

  const tokens = useMemo(() => getTokensForChain(chainId, version), [chainId, version]);
  const [tokenIn, setTokenIn] = useState<Token | undefined>();

  const deferredAmountA = useDeferredValue(amountA);
  const deferredTokenIn = useDeferredValue(tokenIn);

  useEffect(() => {
    if (!baseToken) return;

    setTokenIn((prev) => {
      const next =
        (prev &&
          (tokens.find(
            (t) =>
              t.address.toLowerCase() === prev.address.toLowerCase() || t.symbol === prev.symbol,
          ) ||
            // Keep prev if it is still the project base token (e.g. USDC-base on v5,
            // where cross-token USDC is not in the list).
            (prev.address.toLowerCase() === baseToken.address.toLowerCase()
              ? prev
              : undefined))) ||
        tokens.find((t) => t.address.toLowerCase() === baseToken.address.toLowerCase()) ||
        tokens.find((t) => t.symbol === baseToken.symbol) ||
        baseToken;

      // Only swap the object when the selection actually changes, so effects keyed on
      // tokenIn don't re-fire every render.
      if (
        prev &&
        prev.address.toLowerCase() === next.address.toLowerCase() &&
        prev.decimals === next.decimals &&
        prev.symbol === next.symbol
      ) {
        return prev;
      }
      return next;
    });
  }, [tokens, baseToken]);

  useEffect(() => {
    if (isPriceLoading) return;

    if (!deferredAmountA || !deferredTokenIn) {
      setQuotes({ all: [] });
      setAmountB("");
      setAmountC("");
      return;
    }

    tokenAToBQuote(deferredAmountA, deferredTokenIn).then((quotes) => {
      setQuotes(quotes);
      if (quotes.bestOnSelectedChain) {
        setAmountB(quotes.bestOnSelectedChain.payerTokens.format(3));
        setAmountC(quotes.bestOnSelectedChain.reservedTokens.format(3));
      } else {
        setAmountB("");
        setAmountC("");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredAmountA, deferredTokenIn, isPriceLoading, chainId, projectId]);

  if (!tokenB) return <CardSkeleton rows={4} />;

  const _amountA = {
    amount: new FixedInt(
      parseUnits(amountA || "0", tokenIn?.decimals || tokens[0].decimals),
      tokenIn?.decimals || tokens[0].decimals,
    ),
    symbol: tokenIn?.symbol,
  };

  // Prefer the raw quoted bigint so minReturnedTokens isn't corrupted by
  // format(3) → parseUnits round-trips.
  const _amountB = {
    amount:
      quotes.bestOnSelectedChain?.payerTokens ??
      new FixedInt(parseUnits(amountB || "0", tokenB.decimals), tokenB.decimals),
    symbol: tokenB.symbol,
  };

  function resetForm() {
    setAmountA("");
    setAmountB("");
    setAmountC("");
    setQuotes({ all: [] });
    setResetKey((prev) => prev + 1); // Force PayDialog to remount
  }

  return (
    <div>
      <div className="flex justify-center items-center flex-col">
        <PayInput
          withPayOnSelect
          label="Pay"
          type="number"
          className="border-b border-zinc-200 border-t border-l border-r"
          onChange={(e) => {
            const valueRaw = e.target.value;
            setAmountA(valueRaw);
            if (!valueRaw) resetForm();
          }}
          value={amountA}
          tokens={tokens}
          selectedToken={tokenIn}
          onSelectToken={(token) => {
            setTokenIn(token);
          }}
        />
        <div className="w-full border-r border-l border-zinc-200 bg-zinc-100 p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col flex-1">
              <label className="text-md text-black-700">You get</label>
              <div className="text-2xl text-zinc-900">
                {_amountA.amount._value > 0n ? amountB || "0.00" : "0.00"}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-right select-none text-lg">
                {formatTokenSymbol(tokenB.symbol)}
              </span>
            </div>
          </div>

          <PayFormQuoteDetails quotes={quotes} amountIn={_amountA} />
        </div>
        <div className="flex gap-1 p-3 bg-zinc-200 border-r border-l border-zinc-300 w-full text-md text-zinc-700 overflow-x-auto whitespace-nowrap">
          Splits get {amountC || 0} {formatTokenSymbol(tokenB.symbol)}
        </div>
      </div>

      <div className="flex flex-row">
        <Formik initialValues={{}} onSubmit={() => {}}>
          <Field
            component="textarea"
            id="memo"
            name="memo"
            rows={1}
            className={
              "z-10 flex min-h-14 w-full border border-zinc-200 bg-white px-3 py-1.5 text-md ring-offset-white file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-zinc-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
            }
            onChange={(e: any) => setMemo?.(e.target.value)}
            placeholder="Add a note"
          />
        </Formik>
        <div className="flex w-[150px] shrink-0 items-start">
          {tokenIn ? (
            <PayDialog
              key={resetKey}
              amountA={_amountA}
              amountB={_amountB}
              memo={memo}
              tokenIn={tokenIn}
              tokenOut={tokenB}
              pool={quotes.bestOnSelectedChain?.pool}
              disabled={!amountA}
              onSuccess={() => {
                resetForm();
                setMemo("");
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
