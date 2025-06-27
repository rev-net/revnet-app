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
  useJBContractContext,
} from "juice-sdk-react";
import { ParticipantsQuery, ParticipantsDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { useAccount } from "wagmi";
import { useMemo } from "react";

export function UserTokenBalanceDatum({ className }: { className?: string }) {
  const { address } = useAccount();
  const { projectId } = useJBContractContext();
  const { token } = useJBTokenContext();

  // Query for all participant data for the user (across all projects and chains)
  const projectParticipantsQuery = useBendystrawQuery(ParticipantsDocument, {
    where: {
      address: address || "",
      balance_gt: 0,
      projectId: Number(projectId),
    },
    orderBy: "balance",
    orderDirection: "desc",
    limit: 1000, // Ensure we get all records
  }, {
    enabled: !!address && !!projectId,
  });

  const loading = projectParticipantsQuery?.isLoading;
  const participantsData = (projectParticipantsQuery?.data as ParticipantsQuery | undefined)?.participants?.items ?? [];
  
  // Aggregate balances by chain (GraphQL query is already filtered by project context)
  const aggregatedBalances = useMemo(() => {
    const chainBalances: Record<number, bigint> = {};
    
    participantsData.forEach((participant: any) => {
      const chainId = participant.chainId;
      const balance = BigInt(participant.balance || 0);
      chainBalances[chainId] = (chainBalances[chainId] || 0n) + balance;
    });
    
    return Object.entries(chainBalances)
      .map(([chainId, balance]) => ({
        chainId: Number(chainId),
        balance,
        chainName: JB_CHAINS[Number(chainId) as JBChainId]?.name || `Chain ${chainId}`
      }))
      .sort((a, b) => Number(b.balance - a.balance)); // Sort by balance descending
  }, [participantsData]);

  const totalBalance = new JBProjectToken(
    aggregatedBalances.reduce((acc, chainBalance) => {
      return acc + chainBalance.balance;
    }, 0n)
  );
  const tokenSymbol = formatTokenSymbol(token);

  // Debug logging
  console.log('UserTokenBalanceDatum debug:', {
    participantsData: participantsData.length,
    aggregatedBalances,
    totalBalanceValue: totalBalance.value.toString(),
    totalBalanceFormatted: totalBalance?.format(6),
  });

  if (loading) return <>...</>;

  // Debug logging for render
  console.log('UserTokenBalanceDatum render:', {
    loading,
    totalBalanceFormatted: totalBalance?.format(6),
    totalBalanceValue: totalBalance.value.toString(),
    tokenSymbol,
    finalDisplay: `${totalBalance?.format(6) ?? 0} ${tokenSymbol}`,
  });

  return (
    <Tooltip>
      <TooltipTrigger className={className}>
        {totalBalance?.format(6) ?? 0} {tokenSymbol}
      </TooltipTrigger>
      <TooltipContent className="w-64">
        {aggregatedBalances.map((chainBalance, index) => (
          <div key={index} className="flex justify-between gap-2">
            {chainBalance.chainName}
            <span className="font-medium">
              {new JBProjectToken(chainBalance.balance).format(6)} {tokenSymbol}
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
