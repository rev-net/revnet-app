import { NativeTokenValue } from "@/components/NativeTokenValue";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPortion } from "@/lib/utils";
import { formatEther } from "juice-sdk-core";
import { UserTokenBalanceDatum } from "../../../UserTokenBalanceCard/UserTokenBalanceDatum";
import { useSumQuotes, IndividualBalanceEntry } from '../../../../components/useSumQuotes';
import { useMemo, Fragment } from "react";
import { Loader2 } from 'lucide-react';
import { useAppData } from "@/contexts/AppDataContext";
import { useJBContractContext, useJBChainId } from "juice-sdk-react";
import { ParticipantsQuery, ParticipantsDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { useAccount } from "wagmi";

export function YouSection({ totalSupply }: { totalSupply: bigint }) {
  const { address } = useAccount();
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();

  // Query for all participant data for the user (across all projects and chains)
  const projectParticipantsQuery = useBendystrawQuery(ParticipantsDocument, {
    where: {
      address: address || "",
      balance_gt: 0,
    },
    orderBy: "balance",
    orderDirection: "desc",
  }, {
    enabled: !!address,
  });

  const participantsData = (projectParticipantsQuery?.data as ParticipantsQuery | undefined)?.participants?.items ?? [];
  
  // Use all participants data without filtering by projectId
  const memoizedParticipantsData = useMemo(() => participantsData, [
    participantsData.length,
    participantsData.map(p => `${p.address}-${p.chainId}-${p.balance}`).join(',')
  ]);
  
  // Filter to only show balances for the current project
  const currentProjectParticipants = useMemo(() => {
    return memoizedParticipantsData; // Show all participants, not just current chain
  }, [memoizedParticipantsData]);
  
  // Convert participants data to the format expected by useSumQuotes
  const convertedBalances = useMemo(() => 
    currentProjectParticipants.map((participant: any) => ({
      balance: { value: BigInt(participant.balance || 0) },
      chainId: participant.chainId,
      projectId: BigInt(0), // Use 0 as placeholder since we're not filtering by project
    })),
    [currentProjectParticipants]
  );

  const totalBalance = useMemo(
    () => currentProjectParticipants.reduce((acc: bigint, participant: any) => 
      acc + BigInt(participant.balance || 0), 0n
    ),
    [currentProjectParticipants]
  );

  // Temporarily disable useSumQuotes to prevent infinite loop
  // const {
  //   totalCashQuoteSum,
  //   isLoadingSum,
  //   fetcherElements, 
  // } = useSumQuotes(convertedBalances);

  // Use simple values for now
  const displayQuoteValue = 0n;
  const isLoadingDisplayQuote = false;

  // Debug logging
  console.log('YouSection debug:', {
    participantsData,
    participantsDataLength: participantsData.length,
    convertedBalances,
    convertedBalancesLength: convertedBalances.length,
    projectId: projectId.toString(),
    chainId: chainId?.toString() || 'undefined',
    totalBalance: totalBalance.toString(),
    totalSupply: totalSupply.toString(),
    ownershipPercentage: formatPortion(totalBalance, totalSupply),
    ownershipPercentageCapped: Math.min(formatPortion(totalBalance, totalSupply), 100),
    queryLoading: projectParticipantsQuery?.isLoading,
    queryError: projectParticipantsQuery?.error,
  });

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
      {/* {fetcherElements} */}
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
            {Math.min(formatPortion(totalBalance, totalSupply), 100)}%
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