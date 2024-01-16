import { EthereumAddress } from "@/components/EthereumAddress";
import { Button } from "@/components/ui/button";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ForwardIcon,
} from "@heroicons/react/24/solid";
import { FixedInt } from "fpnum";
import { JBToken, getTokenAToBQuote, getTokenBtoAQuote } from "juice-sdk-core";
import { useState } from "react";
import { Address, formatUnits, parseEther, parseUnits } from "viem";
import { useJBContractContext } from "../../contexts/JBContractContext/JBContractContext";
import { useJBRulesetContext } from "../../contexts/JBRulesetContext/JBRulesetContext";
import { PayDialog } from "./PayDialog";
import { PayInput } from "./PayInput";

export function PayForm({
  tokenA,
  tokenB,
  boostRecipient,
}: {
  tokenA: { symbol: string; decimals: number };
  tokenB: { symbol: string; decimals: number };
  boostRecipient: Address;
}) {
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");

  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const devTax = rulesetMetadata?.data?.reservedRate;

  const _amountA = {
    amount: new FixedInt(parseEther(amountA), tokenA.decimals),
    symbol: tokenA.symbol,
  };
  const _amountB = {
    amount: new FixedInt(parseEther(amountB), tokenB.decimals),
    symbol: tokenB.symbol,
  };

  function resetForm() {
    setAmountA("");
    setAmountB("");
  }

  if (!ruleset?.data || !rulesetMetadata?.data) return null;

  return (
    <div className="flex flex-col p-5 rounded-xl bg-zinc-50 border border-zinc-200 w-full shadow-lg">
      <h2 className="font-medium mb-4">Join network</h2>
      <div className="flex justify-center items-center flex-col gap-2 mb-5">
        <PayInput
          label="You pay"
          onChange={(e) => {
            const valueRaw = e.target.value;
            setAmountA(valueRaw);

            if (!valueRaw) {
              resetForm();
              return;
            }

            if (!ruleset?.data || !rulesetMetadata?.data) return;

            const value = parseUnits(
              `${parseFloat(valueRaw)}` as `${number}`,
              tokenA.decimals
            );
            const amountBQuote = getTokenAToBQuote(
              new FixedInt(value, tokenA.decimals),
              {
                weight: ruleset.data.weight,
                reservedRate: rulesetMetadata.data.reservedRate,
              }
            );

            setAmountB(formatUnits(amountBQuote.payerTokens, tokenB.decimals));
          }}
          value={amountA}
          currency={tokenA?.symbol}
        />
        <ArrowDownIcon className="h-6 w-6" />
        <PayInput
          label="You receive"
          onChange={(e) => {
            const valueRaw = e.target.value;
            setAmountB(valueRaw);

            if (!valueRaw) {
              resetForm();
              return;
            }

            const value = new JBToken(
              parseUnits(
                `${parseFloat(valueRaw)}` as `${number}`,
                tokenB.decimals
              )
            );

            if (!ruleset?.data || !rulesetMetadata?.data) return;

            const amountAQuote = getTokenBtoAQuote(value, tokenA.decimals, {
              weight: ruleset.data.weight,
              reservedRate: rulesetMetadata.data.reservedRate,
            });

            setAmountA(amountAQuote.format());
          }}
          value={amountB}
          currency={tokenB?.symbol}
        />
      </div>
      {/* <div className="flex justify-between gap-3 items-center md:items-start flex-col md:flex-row">
          <div className="flex flex-col gap-2 text-sm items-center md:items-start">
            <div>
              1 {token?.symbol} = <Ether wei={ethQuote} />
            </div>

            {secondsUntilNextCycle ? (
              <div className="gap-1 text-orange-600 text-xs flex items-center font-medium">
                <ClockIcon className="w-4 h-4" />
                {entryTax.toPercentage()}% increase scheduled in{" "}
                {formatSeconds(secondsUntilNextCycle)}
              </div>
            ) : null}
          </div>
 
        </div> */}

      {primaryNativeTerminal?.data ? (
        <PayDialog
          amountA={_amountA}
          amountB={_amountB}
          projectId={projectId}
          primaryTerminalEth={primaryNativeTerminal?.data}
          disabled={!amountA}
        >
          <Button
            size="lg"
            className="w-full mb-5 min-w-[20%] flex items-center gap-2 hover:gap-[10px] whitespace-nowrap transition-all"
          >
            Join now <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </PayDialog>
      ) : null}

      {devTax && boostRecipient ? (
        <div className="text-sm flex items-center justify-between gap-1 mb-3">
          <span className="flex items-center gap-1">
            <ForwardIcon className="h-4 w-4 inline-block" />
            <span className="font-medium">
              {devTax.formatPercentage().toFixed(2)}%
            </span>{" "}
            boost to{" "}
          </span>
          <EthereumAddress
            address={boostRecipient}
            short
            withEnsName
            className="font-medium"
          />
        </div>
      ) : null}
    </div>
  );
}
