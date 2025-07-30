import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTokenSymbol } from "@/lib/utils";
import { JB_CHAINS, JBProjectToken } from "juice-sdk-core";
import {
  JBChainId,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { useAvailableCurrencies } from "@/hooks/useAvailableCurrencies";
import { useMemo } from "react";

export function UserTokenBalanceDatum({ className }: { className?: string }) {
  const balanceQuery = useSuckersUserTokenBalance();
  const { suckerGroupId } = useCurrentProject();
  const { surpluses } = useAvailableCurrencies(suckerGroupId);
  
  const loading = balanceQuery.isLoading;
  const balances = balanceQuery?.data;
  const totalBalance = new JBProjectToken(
    balances?.reduce((acc, curr) => {
      return acc + curr.balance.value;
    }, 0n) ?? 0n
  );
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);

  // Sort balances to match the order from useAvailableCurrencies
  const sortedBalances = useMemo(() => {
    if (!balances || !surpluses) return balances;
    
    // Create a map of chainId to balance for quick lookup
    const balanceMap = new Map(balances.map(b => [b.chainId, b]));
    
    // Return balances in the same order as surpluses
    return surpluses
      .map(surplus => balanceMap.get(surplus.chainId))
      .filter(Boolean); // Remove any undefined entries
  }, [balances, surpluses]);

  if (loading) return <>...</>;

  return (
    <Tooltip>
      <TooltipTrigger className={className}>
        {totalBalance?.format(6) ?? 0} {tokenSymbol}
      </TooltipTrigger>
      <TooltipContent className="w-64">
        {sortedBalances?.map((balance, index) => (
          <div key={index} className="flex justify-between gap-2">
            {JB_CHAINS[balance?.chainId as JBChainId].name}
            <span className="font-medium">
              {balance?.balance?.format(6)} {tokenSymbol}
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
