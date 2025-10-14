"use client";

import { usePaymentQuote } from "@/hooks/usePaymentQuote";
import { getTokensForChain, Token } from "@/lib/token";
import { formatTokenSymbol } from "@/lib/utils";
import { Field, Formik } from "formik";
import { FixedInt } from "fpnum";
import { useJBTokenContext } from "juice-sdk-react";
import { useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";
import { PayDialog } from "./PayDialog";
import { PayInput } from "./PayInput";
import { useSelectedSucker } from "./SelectedSuckerContext";

export function PayForm() {
  const tokenB = useJBTokenContext().token.data;
  const chainId = useSelectedSucker().selectedSucker.peerChainId;
  const { tokenAToBQuote, tokenBtoAQuote } = usePaymentQuote(chainId);

  const [memo, setMemo] = useState<string>();
  const [resetKey, setResetKey] = useState(0);
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [amountC, setAmountC] = useState<string>("");

  const tokens = useMemo(() => getTokensForChain(chainId), [chainId]);
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);

  useEffect(() => {
    setSelectedToken((s) => tokens.find((t) => t.symbol === s.symbol) || tokens[0]);
  }, [tokens]);

  if (!tokenB) return "Loading...";

  const _amountA = {
    amount: new FixedInt(parseUnits(amountA, selectedToken.decimals), selectedToken.decimals),
    symbol: selectedToken.symbol,
  };

  const _amountB = {
    amount: new FixedInt(parseUnits(amountB || "0", tokenB.decimals), tokenB.decimals),
    symbol: tokenB.symbol,
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
            if (!valueRaw) return resetForm();

            const { payerTokens, reservedTokens } = tokenAToBQuote(valueRaw, selectedToken);
            setAmountA(valueRaw);
            setAmountB(payerTokens);
            setAmountC(reservedTokens);
          }}
          value={amountA}
          tokens={tokens}
          selectedToken={selectedToken}
          onSelectToken={(token) => {
            setSelectedToken(token);
            if (amountA) {
              const { payerTokens, reservedTokens } = tokenAToBQuote(amountA, selectedToken);
              setAmountA(amountA);
              setAmountB(payerTokens);
              setAmountC(reservedTokens);
            }
          }}
        />
        <PayInput
          label="You get"
          type="number"
          className="border-r border-l border-zinc-200"
          onChange={(e) => {
            const valueRaw = e.target.value;
            if (!valueRaw) return resetForm();
            setAmountB(valueRaw);
            setAmountA(tokenBtoAQuote(valueRaw, selectedToken));
          }}
          value={amountB}
          tokenSymbol={formatTokenSymbol(tokenB.symbol)}
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
          {selectedToken ? (
            <PayDialog
              key={resetKey}
              amountA={_amountA}
              amountB={_amountB}
              memo={memo}
              token={selectedToken}
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
