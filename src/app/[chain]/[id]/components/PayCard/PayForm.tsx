import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { EthereumAddress } from "@/components/EthereumAddress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useTokenA } from "@/hooks/useTokenA";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ForwardIcon,
} from "@heroicons/react/24/solid";
import { FixedInt } from "fpnum";
import { getTokenAToBQuote, getTokenBtoAQuote } from "juice-sdk-core";
import {
  FieldArray,
  FieldAttributes,
  Form,
  Formik,
  Field,
  useFormikContext,
} from "formik";
import {
  useJBContractContext,
  useJBRulesetContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { memo, useState } from "react";
import { formatUnits, parseEther, parseUnits } from "viem";
import { PayDialog } from "./PayDialog";
import { PayInput } from "./PayInput";
import { formatTokenSymbol } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PayForm() {
  const tokenA = useTokenA();
  const { token } = useJBTokenContext();
  const boostRecipient = useBoostRecipient();
  const [memo, setMemo] = useState<string>();

  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [amountC, setAmountC] = useState<string>("");

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
    setAmountC("");
  }

  return (
    <div>
      <div className="flex justify-center items-center flex-col mb-2">
        <PayInput
          label="Pay"
          type="number"
          className="mb-3"
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
            setAmountC(formatUnits(amountBQuote.reservedTokens, tokenB.decimals));
          }}
          value={amountA}
          currency={tokenA?.symbol}
        />
        <PayInput
          label="You get"
          type="number"
          className="rounded-bl-none"
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
        <div className="flex gap-1 p-3 bg-zinc-200 rounded-b-md w-full text-md text-zinc-700 overflow-x-auto whitespace-nowrap">
          <Badge variant="secondary" className="border border-visible">
            <ForwardIcon className="w-4 h-4 mr-1 inline-block" />
                Operator
          </Badge> gets {amountC || 0} {formatTokenSymbol(tokenB.symbol)}
        </div>
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

      <div className="flex flex-row gap-2 mt-3">
        <Formik
          initialValues={{ }}
          onSubmit={() => {}}
        >
          <Field
            component="textarea"
            id="memo"
            name="memo"
            rows={2}
            className={
              "flex w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-md ring-offset-white file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
            }
            onChange={(e: any) => setMemo?.(e.target.value)}
            placeholder="Optional memo"
          />
        </Formik>
        <div className="w-[100px]">
          {primaryNativeTerminal?.data ? (
            <PayDialog
              amountA={_amountA}
              amountB={_amountB}
              memo={memo}
              primaryTerminalEth={primaryNativeTerminal?.data}
              disabled={!amountA}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
