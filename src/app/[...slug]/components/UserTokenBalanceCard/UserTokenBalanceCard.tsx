import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useTokenA } from "@/hooks/useTokenA";
import { formatTokenSymbol } from "@/lib/utils";
import { JBProjectToken } from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { RedeemDialog } from "./RedeemDialog";
import { BorrowDialog } from "./BorrowDialog";
import { RepayDialog } from "./RepayDialog";
import { LoanDetailsTable } from "../LoansDetailsTable";
import { UserTokenBalanceDatum } from "./UserTokenBalanceDatum";
import { useAccount } from "wagmi";
import { ParticipantsQuery, ParticipantsDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { useMemo } from "react";

export function UserTokenBalanceCard() {
  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const tokenA = useTokenA();
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);
  const chainId = useJBChainId();
  const { address } = useAccount();

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

  const isLoading = projectParticipantsQuery?.isLoading;
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
      }))
      .sort((a, b) => Number(b.balance - a.balance)); // Sort by balance descending
  }, [participantsData]);

  const creditBalance = new JBProjectToken(
    aggregatedBalances.reduce((acc, chainBalance) => {
      return acc + chainBalance.balance;
    }, 0n)
  );

  // Debug logging
  console.log('UserTokenBalanceCard debug:', {
    isLoading,
    participantsData: participantsData.length,
    aggregatedBalances,
    projectId: projectId.toString(),
    creditBalanceValue: creditBalance.value,
    hasAddress: !!address,
    hasToken: !!token?.data?.symbol,
    hasPrimaryTerminal: !!primaryNativeTerminal.data
  });

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [showRepayDialog, setShowRepayDialog] = useState(false);
  const borrowDialogTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      {/* Balance Display Section */}
      <div className="mb-4">
        <UserTokenBalanceDatum className="text-lg font-medium" />
      </div>
      
      <div className="flex flex-row gap-2 mt-2">
        {token?.data?.symbol && creditBalance && primaryNativeTerminal.data ? (
          <RedeemDialog
            projectId={projectId}
            creditBalance={creditBalance}
            tokenSymbol={tokenSymbol}
            primaryTerminalEth={primaryNativeTerminal.data}
          >
            <Button 
              variant="outline" 
              disabled={creditBalance.value === 0n || isLoading}
            >
              Cash out
            </Button>
          </RedeemDialog>
        ) : null}
        {token?.data?.symbol && creditBalance && primaryNativeTerminal.data ? (
          <BorrowDialog
            projectId={projectId}
            tokenSymbol={tokenSymbol}
          >
            <Button
              ref={borrowDialogTriggerRef}
              variant="outline"
              disabled={creditBalance.value === 0n || isLoading}
            >
              Get a loan
            </Button>
          </BorrowDialog>
        ) : null}
        {selectedLoanId && selectedChainId && (
          <RepayDialog
            projectId={projectId}
            tokenSymbol={tokenSymbol}
            address={address || ""}
            open={showRepayDialog}
            onOpenChange={setShowRepayDialog}
            loanId={selectedLoanId}
            chainId={selectedChainId}
          />
        )}
      </div>
      {address && projectId && chainId ? (
        <>
        <LoanDetailsTable
          title="Your loans"
          revnetId={projectId}
          address={address}
          chainId={0}
          tokenSymbol={tokenSymbol}
          onSelectLoan={(loanId, chainId) => {
            setSelectedLoanId(loanId);
            setSelectedChainId(chainId);
            setShowRepayDialog(true);
          }}
        />
      </>
    ) : null}
    </>
  );
}
