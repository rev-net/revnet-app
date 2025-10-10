"use client";

import { useCurrencyPrice } from "@/hooks/useCurrencyPrice";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import {
  Currency,
  determineConversion,
  fromProjectCurrencyAmount,
  getCurrenciesForChain,
  toProjectCurrencyAmount,
} from "@/lib/currency";
import { formatTokenSymbol } from "@/lib/utils";
import { Field, Formik } from "formik";
import { FixedInt } from "fpnum";
import {
  ETH_CURRENCY_ID,
  getTokenAToBQuote,
  getTokenBtoAQuote,
  USD_CURRENCY_ID,
} from "juice-sdk-core";
import { useJBContractContext, useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";
import { useCallback, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { PayDialog } from "./PayDialog";
import { PayInput } from "./PayInput";
import { useSelectedSucker } from "./SelectedSuckerContext";

export function PayForm() {
  const { token } = useJBTokenContext();
  const { version } = useJBContractContext();
  const [memo, setMemo] = useState<string>();
  const [resetKey, setResetKey] = useState(0);
  const { selectedSucker } = useSelectedSucker();

  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [amountC, setAmountC] = useState<string>("");

  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const baseToken = useProjectBaseToken();

  const tokenB = token?.data;
  const chainId = selectedSucker.peerChainId;

  const currencies = useMemo(() => getCurrenciesForChain(chainId), [chainId]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);

  const { price: usdToEthPrice } = useCurrencyPrice(
    USD_CURRENCY_ID(version),
    ETH_CURRENCY_ID,
    chainId,
  );

  const updateTokenAToBQuote = useCallback(
    (valueRaw: string, currency: Currency) => {
      if (!ruleset?.data || !rulesetMetadata?.data || !tokenB) return;

      try {
        const amountInProjectCurrency = toProjectCurrencyAmount(
          valueRaw,
          determineConversion(baseToken.isNative, currency.isNative),
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

        setAmountB(formatUnits(amountBQuote.payerTokens, tokenB.decimals));
        setAmountC(formatUnits(amountBQuote.reservedTokens, tokenB.decimals));
      } catch (err) {
        console.error("Failed to calculate quote:", err);
      }
    },
    [ruleset, rulesetMetadata, tokenB, baseToken, usdToEthPrice],
  );

  if (token.isLoading || ruleset.isLoading || rulesetMetadata.isLoading || !tokenB) {
    return "Loading...";
  }

  const _amountA = {
    amount: new FixedInt(
      parseUnits(amountA || "0", selectedCurrency.decimals),
      selectedCurrency.decimals,
    ),
    symbol: selectedCurrency.symbol,
  };

  const _amountB = {
    amount: new FixedInt(parseUnits(amountB || "0", tokenB.decimals), tokenB.decimals),
    symbol: formatTokenSymbol(token),
  };

  function resetForm() {
    setAmountA("");
    setAmountB("");
    setAmountC("");
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

            if (!valueRaw) {
              resetForm();
              return;
            }

            updateTokenAToBQuote(valueRaw, selectedCurrency);
          }}
          value={amountA}
          currency={selectedCurrency.symbol}
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={(currency) => {
            setSelectedCurrency(currency);
            if (amountA) updateTokenAToBQuote(amountA, currency);
          }}
        />
        <PayInput
          label="You get"
          type="number"
          className="border-r border-l border-zinc-200"
          onChange={(e) => {
            const valueRaw = e.target.value;
            setAmountB(valueRaw);

            if (!valueRaw) {
              resetForm();
              return;
            }

            const value = FixedInt.parse(valueRaw, tokenB.decimals);

            if (!ruleset?.data || !rulesetMetadata?.data) return;

            try {
              const amountAQuote = getTokenBtoAQuote(value, baseToken.decimals, {
                weight: ruleset.data.weight,
                reservedPercent: rulesetMetadata.data.reservedPercent,
              });

              const converted = fromProjectCurrencyAmount(
                amountAQuote.value,
                determineConversion(baseToken.isNative, selectedCurrency.isNative),
                usdToEthPrice,
              );

              if (converted) {
                setAmountA(formatUnits(converted.amount, converted.decimals));
              } else {
                setAmountA(amountAQuote.format());
              }
            } catch (err) {
              console.error("Failed to calculate quote:", err);
            }
          }}
          value={amountB}
          currency={formatTokenSymbol(token)}
        />
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
            rows={2}
            className={
              "flex w-full border border-zinc-200 bg-white px-3 py-1.5 text-md ring-offset-white file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-zinc-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300 z-10"
            }
            onChange={(e: any) => setMemo?.(e.target.value)}
            placeholder="Leave a note"
          />
        </Formik>
        <div className="w-[150px] flex">
          {selectedCurrency ? (
            <PayDialog
              key={resetKey}
              amountA={_amountA}
              amountB={_amountB}
              memo={memo}
              currency={selectedCurrency}
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
