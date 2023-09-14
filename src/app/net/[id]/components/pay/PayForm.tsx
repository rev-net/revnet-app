import { Button } from "@/components/ui/button";
import {
  JBTokenValue,
  getTokenAToBQuote,
  getTokenBtoAQuote,
} from "@/lib/juicebox/utils";
import { ArrowDownIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { FixedInt } from "fpnum";
import { useMemo, useState } from "react";
import { formatUnits, parseEther, parseUnits } from "viem";
import { useJBProjectContext } from "../../contexts/JBProjectContext/JBProjectContext";
import { PayDialog } from "./PayDialog";
import { PayInput } from "./PayInput";

export function PayForm({
  tokenA,
  tokenB,
}: {
  tokenA: { symbol: string; decimals: number };
  tokenB: { symbol: string; decimals: number };
}) {
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");

  const { fundingCycle, fundingCycleMetadata, projectId, primaryTerminalEth } =
    useJBProjectContext();

  const amountAValue = useMemo(() => {
    if (!amountA) return 0n;
    try {
      return parseEther(`${parseFloat(amountA)}` as `${number}`);
    } catch {
      return 0n;
    }
  }, [amountA]);

  function resetForm() {
    setAmountA("");
    setAmountB("");
  }

  if (!fundingCycle?.data || !fundingCycleMetadata?.data) return null;

  return (
    <div className="flex flex-col p-5 rounded-md border border-zinc-200 bg-zinc-100 w-full">
      <h2 className="text-lg font-medium mb-5">Join network</h2>
      <div className="flex justify-center items-center flex-col mb-10 gap-2">
        <PayInput
          label="You pay"
          onChange={(e) => {
            const valueRaw = e.target.value;
            setAmountA(valueRaw);

            if (!valueRaw) {
              resetForm();
              return;
            }

            if (!fundingCycle?.data || !fundingCycleMetadata?.data) return;

            const value = parseUnits(
              `${parseFloat(valueRaw)}` as `${number}`,
              tokenA.decimals
            );
            const amountBQuote = getTokenAToBQuote(
              new FixedInt(value, tokenA.decimals),
              {
                weight: fundingCycle.data.weight,
                reservedRate: fundingCycleMetadata.data.reservedRate,
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

            const value = new JBTokenValue(
              parseUnits(
                `${parseFloat(valueRaw)}` as `${number}`,
                tokenB.decimals
              )
            );

            if (!fundingCycle?.data || !fundingCycleMetadata?.data) return;

            const amountAQuote = getTokenBtoAQuote(value, tokenA.decimals, {
              weight: fundingCycle.data.weight,
              reservedRate: fundingCycleMetadata.data.reservedRate,
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
          {devTax && boostRecipient ? (
            <span className="text-sm inline-flex items-center gap-1">
              <ForwardIcon className="h-4 w-4 inline-block" />
              {devTax.toPercentage()}% boost to{" "}
              <EthereumAddress address={boostRecipient} short withEnsName />
            </span>
          ) : null}
        </div> */}

      {primaryTerminalEth?.data ? (
        <PayDialog
          payAmountWei={amountAValue}
          projectId={projectId}
          primaryTerminalEth={primaryTerminalEth?.data}
          disabled={!amountA}
        >
          <Button
            size="lg"
            className="w-full h-16 text-base min-w-[20%] flex items-center gap-2 hover:gap-[10px] whitespace-nowrap transition-all"
          >
            Join now <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </PayDialog>
      ) : null}
    </div>
  );
}
