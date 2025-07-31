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
} from "juice-sdk-react";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { useAvailableCurrencies } from "@/hooks/useAvailableCurrencies";
import { useUserTokenBalancesBendy } from "@/hooks/useUserTokenBalancesBendy";
import { useAccount } from "wagmi";
import { useMemo } from "react";

export function UserTokenBalanceDatum({ className }: { className?: string }) {
  const { address: userAddress } = useAccount();
  const { suckerGroupId } = useCurrentProject();
  const { surpluses } = useAvailableCurrencies(suckerGroupId);
  const { balances, isLoading } = useUserTokenBalancesBendy(suckerGroupId, userAddress);
  
  const totalBalance = new JBProjectToken(
    balances?.reduce((acc: bigint, curr: any) => {
      return acc + BigInt(curr.userBalance);
    }, 0n) ?? 0n
  );
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);

  // Sort balances to match the order from useAvailableCurrencies
  const sortedBalances = useMemo(() => {
    if (!balances || !surpluses) return balances;
    
    // Create a map of chainId to balance for quick lookup
    const balanceMap = new Map(balances.map((b: any) => [b.chainId, b]));
    
    // Return balances in the same order as surpluses
    return surpluses
      .map(surplus => balanceMap.get(surplus.chainId))
      .filter(Boolean); // Remove any undefined entries
  }, [balances, surpluses]);

  if (isLoading) return <>...</>;

  return (
    <Tooltip>
      <TooltipTrigger className={className}>
        {totalBalance?.format(6) ?? 0} {tokenSymbol}
      </TooltipTrigger>
      <TooltipContent className="w-64">
        {sortedBalances?.map((balance: any, index: number) => (
          <div key={index} className="flex justify-between gap-2">
            {JB_CHAINS[balance?.chainId as JBChainId].name}
            <span className="font-medium">
              {new JBProjectToken(BigInt(balance?.userBalance || 0)).format(6)} {tokenSymbol}
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
