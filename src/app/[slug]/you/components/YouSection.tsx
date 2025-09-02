"use client";

import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useSuckersTokenSurplus } from "@/hooks/useSuckersTokenSurplus";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { formatPortion } from "@/lib/utils";
import { formatUnits } from "juice-sdk-core";
import { useSuckersUserTokenBalance } from "juice-sdk-react";
import { useMemo } from "react";
import { UserTokenBalanceDatum } from "./UserTokenBalanceDatum";

export function YouSection() {
  const totalSupply = useTotalOutstandingTokens();
  const { data: balances } = useSuckersUserTokenBalance();
  const baseToken = useProjectBaseToken();

  const totalBalance = useMemo(
    () => balances?.reduce((acc, curr) => acc + curr.balance.value, 0n) || 0n,
    [balances],
  );

  // Use the sucker token surplus hook with our token map
  const { data: surpluses, isLoading: surplusLoading } = useSuckersTokenSurplus(baseToken.tokenMap);

  // Calculate user's cashout value for each chain based on their token balance
  const userCashoutValues = useMemo(() => {
    if (!surpluses || !balances) return [];

    return surpluses.map((surplus) => {
      // Find the user's balance for this chain
      const userBalance = balances.find((b) => b.chainId === surplus.chainId);
      if (!userBalance || !surplus.surplus) return { chainId: surplus.chainId, cashoutValue: 0n };

      // Calculate user's proportional share of the surplus
      // This assumes the surplus is proportional to token holdings
      const userCashoutValue =
        totalSupply > 0n ? (surplus.surplus * userBalance.balance.value) / totalSupply : 0n;

      return { chainId: surplus.chainId, cashoutValue: userCashoutValue };
    });
  }, [surpluses, balances, totalSupply]);

  // Calculate total user cashout value across all chains
  const totalUserCashoutValue = userCashoutValues.reduce(
    (acc, value) => acc + value.cashoutValue,
    0n,
  );

  const displayQuoteValue = totalUserCashoutValue;
  const isLoadingDisplayQuote = surplusLoading;

  const adjustedDisplayValue =
    displayQuoteValue !== undefined ? (displayQuoteValue * 975n) / 1000n : undefined;

  const formattedValueString =
    adjustedDisplayValue !== undefined
      ? Number(formatUnits(adjustedDisplayValue, baseToken.decimals)).toFixed(5)
      : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 overflow-x-scrolltext-md gap-1">
        {/* Left Column */}
        <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
          <dt className="text-md font-medium leading-6 text-zinc-900">Balance</dt>
          <dd className="text-zinc-600">
            <UserTokenBalanceDatum />
          </dd>
        </div>
        <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
          <dt className="text-md font-medium leading-6 text-zinc-900">Ownership</dt>
          <dd className="text-zinc-600">{formatPortion(totalBalance, totalSupply)}%</dd>
        </div>
        {/* comment out for now until fixed
        <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
          <dt className="text-md font-medium leading-6 text-zinc-900">
            Value Across Chains
          </dt>
          <dd className="text-zinc-600">
            <Tooltip>
              <TooltipTrigger>
                {isLoadingDisplayQuote && <Loader2 className="animate-spin" size={16} />}
                {!isLoadingDisplayQuote && formattedValueString
                  ? `~${formattedValueString} ${baseToken.symbol}`
                  : !isLoadingDisplayQuote // Loaded, but no value
                  ? "N/A"
                  : ""}
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-col space-y-2">
                  {isLoadingDisplayQuote && "Loading.."}
                  {!isLoadingDisplayQuote && userCashoutValues ? (
                    <>
                      {userCashoutValues.map((cashoutValue, index) => {
                        const chainName = JB_CHAINS[cashoutValue.chainId as JBChainId]?.name || `Chain ${cashoutValue.chainId}`;
                        
                        if (cashoutValue.cashoutValue > 0n) {
                          const adjustedCashoutValue = (cashoutValue.cashoutValue * 975n) / 1000n;
                          const formattedCashoutValue = Number(formatUnits(adjustedCashoutValue, baseToken.decimals)).toFixed(5);
                          return (
                            <div key={index} className="flex justify-between gap-2">
                              <span>{chainName}</span>
                              <span className="font-medium">~{formattedCashoutValue} {baseToken.symbol}</span>
                            </div>
                          );
                        }
                        
                        return (
                          <div key={index} className="flex justify-between gap-2">
                            <span>{chainName}</span>
                            <span className="font-medium">N/A</span>
                          </div>
                        );
                      })}
                      <hr className="py-1" />
                      <div className="flex justify-between gap-2">
                        <span>[All chains]</span>
                        <span className="font-medium">
                          {adjustedDisplayValue !== undefined ? (
                            `~${Number(formatUnits(adjustedDisplayValue, baseToken.decimals)).toFixed(5)} ${baseToken.symbol}`
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                    </>
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
        */}
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
