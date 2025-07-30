import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPortion } from "@/lib/utils";
import { formatUnits } from "juice-sdk-core";
import { useSuckersUserTokenBalance } from "juice-sdk-react";
import { UserTokenBalanceDatum } from "../../../UserTokenBalanceCard/UserTokenBalanceDatum";
import { useMemo } from "react";
import { Loader2 } from 'lucide-react';
import { JB_CHAINS } from "juice-sdk-core";
import { JBChainId } from "juice-sdk-react";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { useAvailableCurrencies } from "@/hooks/useAvailableCurrencies";

// Types for better type safety
type CashoutValue = {
  chainId: JBChainId;
  cashoutValue: bigint;
};

type UserBalance = {
  chainId: JBChainId;
  balance: { value: bigint };
};

type Surplus = {
  surplus: bigint;
  chainId: JBChainId;
  projectId: bigint;
};

// Custom hook to calculate user cashout values
function useUserCashoutValues(
  surpluses: Surplus[] | undefined,
  balances: UserBalance[] | undefined,
  totalSupply: bigint
) {
  return useMemo(() => {
    if (!surpluses || !balances) return [];

    return surpluses.map((surplus) => {
      // Find the user's balance for this chain
      const userBalance = balances.find(b => b.chainId === surplus.chainId);
      if (!userBalance || !surplus.surplus) {
        return { chainId: surplus.chainId, cashoutValue: 0n };
      }

      // Calculate user's proportional share of the surplus
      // This assumes the surplus is proportional to token holdings
      const userCashoutValue = totalSupply > 0n
        ? (surplus.surplus * userBalance.balance.value) / totalSupply
        : 0n;

      return { chainId: surplus.chainId, cashoutValue: userCashoutValue };
    });
  }, [surpluses, balances, totalSupply]);
}

// Custom hook to calculate total balance
function useTotalBalance(balances: UserBalance[] | undefined) {
  return useMemo(
    () => balances?.reduce((acc, curr) => acc + curr.balance.value, 0n) || 0n,
    [balances]
  );
}

// Custom hook to format display values
function useDisplayValues(
  totalUserCashoutValue: bigint,
  baseTokenDecimals: number
) {
  return useMemo(() => {
    const adjustedDisplayValue = (totalUserCashoutValue * 975n) / 1000n;
    
    const formattedValueString = adjustedDisplayValue !== 0n
      ? Number(formatUnits(adjustedDisplayValue, baseTokenDecimals)).toFixed(5)
      : null;

    return {
      adjustedDisplayValue,
      formattedValueString,
    };
  }, [totalUserCashoutValue, baseTokenDecimals]);
}

export function YouSection({ totalSupply }: { totalSupply: bigint }) {
  // Core data hooks
  const balanceQuery = useSuckersUserTokenBalance();
  const baseToken = useProjectBaseToken();
  const { suckerGroupId } = useCurrentProject();

  // Derived data
  const balances = balanceQuery?.data;
  const totalBalance = useTotalBalance(balances);
  const { surpluses, isLoading: surplusLoading } = useAvailableCurrencies(suckerGroupId);

  // Calculate cashout values
  const userCashoutValues = useUserCashoutValues(surpluses, balances, totalSupply);
  const totalUserCashoutValue = userCashoutValues.reduce(
    (acc: bigint, value: CashoutValue) => acc + value.cashoutValue,
    0n
  );

  // Format display values
  const { adjustedDisplayValue, formattedValueString } = useDisplayValues(
    totalUserCashoutValue,
    baseToken.decimals
  );

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
          <dt className="text-md font-medium leading-6 text-zinc-900">
            Ownership
          </dt>
          <dd className="text-zinc-600">
            {formatPortion(totalBalance, totalSupply)}%
          </dd>
        </div>
{/*         <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
          <dt className="text-md font-medium leading-6 text-zinc-900">
            Min. Value Across Chains
          </dt>
          <dd className="text-zinc-600">
            <Tooltip>
              <TooltipTrigger>
                {surplusLoading && <Loader2 className="animate-spin" size={16} />}
                {!surplusLoading && formattedValueString
                  ? `~${formattedValueString} ${baseToken.symbol}`
                  : !surplusLoading // Loaded, but no value
                  ? "N/A"
                  : ""}
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-col space-y-2">
                  {surplusLoading && "Loading.."}
                  {!surplusLoading && userCashoutValues ? (
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
                          {adjustedDisplayValue !== 0n ? (
                            `~${Number(formatUnits(adjustedDisplayValue, baseToken.decimals)).toFixed(5)} ${baseToken.symbol}`
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                    </>
                  ) : !surplusLoading ? ( // Loaded, but no value
                    "Not available"
                  ) : (
                    ""
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </dd>
        </div> */}
        
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