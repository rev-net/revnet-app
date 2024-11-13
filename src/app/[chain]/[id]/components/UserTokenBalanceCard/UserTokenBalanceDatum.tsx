import { chainNames } from "@/app/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTokenSymbol } from "@/lib/utils";
import { JBProjectToken } from "juice-sdk-core";
import { JBChainId, useJBTokenContext } from "juice-sdk-react";
import { useSuckersUserTokenBalance } from "./useSuckersUserTokenBalance";

export function UserTokenBalanceDatum({ className }: { className?: string }) {
  const balanceQuery = useSuckersUserTokenBalance();
  const loading = balanceQuery.isLoading;
  const balances = balanceQuery?.data;
  const totalBalance = new JBProjectToken(
    balances?.reduce((acc, curr) => {
      return acc + curr.balance.value;
    }, 0n) ?? 0n
  );
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);

  if (loading) return <>...</>;

  return (
    <Tooltip>
      <TooltipTrigger className={className}>
        {totalBalance?.format(6) ?? 0} {tokenSymbol}
      </TooltipTrigger>
      <TooltipContent className="w-64">
        {balances?.map((balance, index) => (
          <div key={index} className="flex justify-between gap-2">
            {chainNames[balance.chainId as JBChainId]}
            <span className="font-medium">
              {balance.balance?.format(6)} {tokenSymbol}
            </span>
          </div>
        ))}
        <hr className="py-1" />
        <div className="flex justify-between gap-2">
          <span>[All chains]</span>
          <span className="font-medium">
            {totalBalance?.format(6) ?? 0} {tokenSymbol}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
