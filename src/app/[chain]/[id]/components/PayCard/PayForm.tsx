import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { EthereumAddress } from "@/components/EthereumAddress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useTokenA } from "@/hooks/useTokenA";
import { PriceSection } from "../NetworkDashboard/sections/PriceSection";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ForwardIcon,
} from "@heroicons/react/24/solid";
import { FixedInt } from "fpnum";
import { getTokenAToBQuote, getTokenBtoAQuote } from "juice-sdk-core";
import {
  useJBContractContext,
  useJBRulesetContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { useState } from "react";
import { formatUnits, parseEther, parseUnits } from "viem";
import { PayDialog } from "./PayDialog";
import { PayInput } from "./PayInput";
import { formatTokenSymbol } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PayForm() {
  const tokenA = useTokenA();
  const { token } = useJBTokenContext();
  const boostRecipient = useBoostRecipient();

  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");

  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();

  const tokenB = token?.data;

  if (!ruleset?.data || !rulesetMetadata?.data || !tokenB) {
    return "Something went wrong";
  }

  const devTax = rulesetMetadata?.data?.reservedPercent;

  const _amountA = {
    amount: new FixedInt(parseEther(amountA), tokenA.decimals),
    symbol: tokenA.symbol,
  };
  const _amountB = {
    amount: new FixedInt(parseEther(amountB), tokenB.decimals),
    symbol: formatTokenSymbol(token),
  };

  function resetForm() {
    setAmountA("");
    setAmountB("");
  }

  return (
    <div>
      <div className="flex justify-center items-center flex-col gap-3 mb-2">
        <PayInput
          label="You contribute"
          type="number"
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
                reservedPercent: rulesetMetadata.data.reservedPercent,
              }
            );

            setAmountB(formatUnits(amountBQuote.payerTokens, tokenB.decimals));
          }}
          value={amountA}
          currency={tokenA?.symbol}
        />
        <PayInput
          label="You receive"
          type="number"
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

      <PriceSection />
      {primaryNativeTerminal?.data ? (
        <PayDialog
          amountA={_amountA}
          amountB={_amountB}
          primaryTerminalEth={primaryNativeTerminal?.data}
          disabled={!amountA}
        />
      ) : null}
    </div>
  );
}
