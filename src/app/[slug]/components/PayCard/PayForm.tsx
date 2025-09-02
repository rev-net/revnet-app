"use client";

import { useProjectAccountingContext } from "@/hooks/useProjectAccountingContext";
import { useTokenA } from "@/hooks/useTokenA";
import { formatTokenSymbol } from "@/lib/utils";
import { Field, Formik } from "formik";
import { FixedInt } from "fpnum";
import { getTokenAToBQuote, getTokenBtoAQuote } from "juice-sdk-core";
import { useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";
import { useState } from "react";
import { formatUnits, parseEther, parseUnits } from "viem";
import { PayDialog } from "./PayDialog";
import { PayInput } from "./PayInput";

export function PayForm() {
  const tokenA = useTokenA();
  const { token } = useJBTokenContext();
  const [memo, setMemo] = useState<string>();
  const [resetKey, setResetKey] = useState(0);

  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [amountC, setAmountC] = useState<string>("");

  const primaryNativeTerminal = {
    data: "0xdb9644369c79c3633cde70d2df50d827d7dc7dbc",
  };
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { data: accountingContext } = useProjectAccountingContext();

  const tokenB = token?.data;

  if (token.isLoading || ruleset.isLoading || rulesetMetadata.isLoading || !tokenB) {
    return "Loading...";
  }
  const _amountA = {
    amount: new FixedInt(parseUnits(amountA, tokenA.decimals), tokenA.decimals), // ✅ Use correct decimals
    symbol: tokenA.symbol,
  };
  const _amountB = {
    amount: new FixedInt(parseEther(amountB), tokenB.decimals),
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

            if (!ruleset?.data || !rulesetMetadata?.data) return;

            const value = parseUnits(`${parseFloat(valueRaw)}` as `${number}`, tokenA.decimals);
            const amountBQuote = getTokenAToBQuote(new FixedInt(value, tokenA.decimals), {
              weight: ruleset.data.weight,
              reservedPercent: rulesetMetadata.data.reservedPercent,
            });

            setAmountB(formatUnits(amountBQuote.payerTokens, tokenB.decimals));
            setAmountC(formatUnits(amountBQuote.reservedTokens, tokenB.decimals));
          }}
          value={amountA}
          currency={tokenA?.symbol}
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

            const amountAQuote = getTokenBtoAQuote(value, tokenA.decimals, {
              weight: ruleset.data.weight,
              reservedPercent: rulesetMetadata.data.reservedPercent,
            });

            setAmountA(amountAQuote.format());
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
          {primaryNativeTerminal?.data ? (
            <PayDialog
              key={resetKey}
              amountA={_amountA}
              amountB={_amountB}
              memo={memo}
              paymentToken={
                (accountingContext?.project?.token as `0x${string}`) ||
                "0x000000000000000000000000000000000000eeee"
              }
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
