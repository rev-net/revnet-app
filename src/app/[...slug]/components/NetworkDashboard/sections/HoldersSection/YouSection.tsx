import { NativeTokenValue } from "@/components/NativeTokenValue";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPortion } from "@/lib/utils";
import { formatEther } from "juice-sdk-core";
import { useSuckersUserTokenBalance } from "juice-sdk-react";
import { UserTokenBalanceDatum } from "../../../UserTokenBalanceCard/UserTokenBalanceDatum";
import { useSumQuotes, IndividualBalanceEntry } from '../../../../components/useSumQuotes';
import { useMemo, Fragment } from "react";
import { Loader2 } from 'lucide-react';

export function YouSection({ totalSupply }: { totalSupply: bigint }) {
  const balanceQuery = useSuckersUserTokenBalance();

  const balances = balanceQuery?.data as IndividualBalanceEntry[] | undefined;

  const totalBalance = useMemo(
    () => balances?.reduce((acc, curr) => acc + curr.balance.value, 0n) || 0n,
    [balances]
  );

  const {
    totalCashQuoteSum,
    isLoadingSum,
    fetcherElements, 
  } = useSumQuotes(balances);

  const displayQuoteValue = totalCashQuoteSum;
  const isLoadingDisplayQuote = isLoadingSum;

  const adjustedDisplayValue =
    displayQuoteValue !== undefined
      ? (displayQuoteValue * 975n) / 1000n
      : undefined;

  const formattedEthString =
    adjustedDisplayValue !== undefined
      ? Number(formatEther(adjustedDisplayValue)).toFixed(5)
      : null;


  return (
    <>
      {fetcherElements}
      <div className="grid grid-cols-1 gap-x-8 overflow-x-scrolltext-md gap-1">
        {/* Left Column */}
        <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
          <dt className="text-md font-medium leading-6 text-zinc-900">Balance</dt>
          <dd className="text-zinc-600">
            <UserTokenBalanceDatum />
          </dd>
        </div>
        <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
          <dt className="text-md font-medium leading-6 text-zinc-900">
            Ownership
          </dt>
          <dd className="text-zinc-600">
            {formatPortion(totalBalance, totalSupply)}%
          </dd>
        </div>
        <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
          <dt className="text-md font-medium leading-6 text-zinc-900">
            Value Across Chains
          </dt>
          <dd className="text-zinc-600">
            <Tooltip>
              <TooltipTrigger>
                {isLoadingDisplayQuote && <Loader2 className="animate-spin" size={16} />}
                {!isLoadingDisplayQuote && formattedEthString
                  ? `~${formattedEthString} ETH`
                  : !isLoadingDisplayQuote // Loaded, but no value
                  ? "N/A"
                  : ""}
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-col space-y-2">
                  {isLoadingDisplayQuote && "Loading.."}
                  {!isLoadingDisplayQuote && adjustedDisplayValue !== undefined ? (
                    <NativeTokenValue wei={adjustedDisplayValue} decimals={18} />
                  ) : !isLoadingDisplayQuote ? ( // Loaded, but no value
                    "Not available"
                  ) : (
                    ""
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </dd>
        </div>
        {/* comment out for now until sucker of bendystraw
        <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
          <dt className="text-md font-medium leading-6 text-zinc-900">
            Current borrow potential
          </dt>
          <dd className="text-zinc-600">(soon)</dd>
        </div> */}
      </div>
    </>
  );
}