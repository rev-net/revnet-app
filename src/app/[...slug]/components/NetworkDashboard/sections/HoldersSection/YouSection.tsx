import { NativeTokenValue } from "@/components/NativeTokenValue";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPortion } from "@/lib/utils";
import { formatEther } from "juice-sdk-core";
import {
  useSuckersCashOutQuote,
  useTokenCashOutQuoteEth,
  useSuckersUserTokenBalance,
  JBChainId,
} from "juice-sdk-react";
import { UserTokenBalanceDatum } from "../../../UserTokenBalanceCard/UserTokenBalanceDatum";

export function YouSection({ totalSupply }: { totalSupply: bigint }) {
  const balanceQuery = useSuckersUserTokenBalance();
  const balances = balanceQuery?.data;
  const totalBalance =
    balances?.reduce((acc, curr) => {
      return acc + curr.balance.value;
    }, 0n) || 0n;
  // console.log("totalBalance", totalBalance)

  const redeemQuoteQuery = useSuckersCashOutQuote(totalBalance);
  const loading =
    balanceQuery.isLoading || redeemQuoteQuery.isLoading;

  const { data: redeemQuote } = useTokenCashOutQuoteEth(totalBalance, {
      chainId: Number(1) as JBChainId,
    });

  return (
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
          Current cash out value
        </dt>
        <dd className="text-zinc-600">
          <Tooltip>
            <TooltipTrigger>
              {/* Lazily putting the approx symbol here */}
                ~
              {!loading
                ? `${(
                    Number(formatEther(redeemQuote ?? 0n))
                  ).toFixed(8)} ETH`
                : "..."}
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col space-y-2">
                {/* Lazily putting the approx symbol here */}
                ~
                {redeemQuote ?
                <NativeTokenValue wei={redeemQuote} decimals={8} /> : "Loading.."}
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
  );
}
