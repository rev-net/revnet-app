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
import { ReallocateDialog } from "./ReallocateDialog";
import { RepayDialog } from "./RepayDialog";
import { LoanDetailsTable } from "../LoansDetailsTable";
import { useAccount } from "wagmi";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { SuckerGroupDocument } from "@/generated/graphql";
import { NATIVE_TOKEN } from "juice-sdk-core";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { useUserTokenBalancesBendy } from "@/hooks/useUserTokenBalancesBendy";

export function UserTokenBalanceCard() {
  const {
    projectId,
    //contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const primaryNativeTerminal = {data: "0xdb9644369c79c3633cde70d2df50d827d7dc7dbc"};
  const tokenA = useTokenA();
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);
  const chainId = useJBChainId();
  const { address } = useAccount();
  const { suckerGroupId } = useCurrentProject();
  const { balances } = useUserTokenBalancesBendy(suckerGroupId, address);
  
  const creditBalance = new JBProjectToken(
    balances?.reduce((acc: bigint, balance: any) => acc + BigInt(balance.userBalance || 0), 0n) ?? 0n
  );

  // Get sucker group data to determine if it's ETH-based
  const { data: suckerGroupData } = useBendystrawQuery(SuckerGroupDocument, {
    id: suckerGroupId ?? "",
  }, {
    enabled: !!suckerGroupId,
  });

  // Determine if the project is ETH-based by checking the token configuration
  const isEthBasedProject = (() => {
    if (!suckerGroupData?.suckerGroup?.projects?.items) {
      return true; // Default to ETH if no data
    }
    
    // Check if all projects in the sucker group use ETH
    const allProjects = suckerGroupData.suckerGroup.projects.items;
    return allProjects.every(project => 
      project.token?.toLowerCase() === "0x000000000000000000000000000000000000eeee"
    );
  })();

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [showRepayDialog, setShowRepayDialog] = useState(false);
  const borrowDialogTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [reallocateLoan, setReallocateLoan] = useState<any>(null);
  const [showReallocateDialog, setShowReallocateDialog] = useState(false);

  return (
    <>
      <div className="flex flex-row gap-2 mt-2">
        {token?.data?.symbol && creditBalance && primaryNativeTerminal.data ? (
          <RedeemDialog
            projectId={projectId}
            tokenSymbol={tokenSymbol}
          >
            <Button variant="outline" disabled={creditBalance.value === 0n}>
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
              disabled={creditBalance.value === 0n}
            >
              Get a loan
            </Button>
          </BorrowDialog>
        ) : null}
        {selectedLoanId && selectedChainId && (
          <RepayDialog
            loanId={selectedLoanId}
            chainId={selectedChainId}
            projectId={projectId}
            open={showRepayDialog}
            onOpenChange={setShowRepayDialog}
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
          onReallocateLoan={(loan) => {
            setReallocateLoan(loan);
            setShowReallocateDialog(true);
          }}
        />
      </>
    ) : null}

      {/* Reallocate Dialog - Only render when we have a loan */}
      {reallocateLoan && (
        <ReallocateDialog
          projectId={BigInt(projectId)}
          tokenSymbol={tokenSymbol}
          selectedLoan={reallocateLoan}
          open={showReallocateDialog}
          onOpenChange={(open) => {
            setShowReallocateDialog(open);
            if (!open) {
              setReallocateLoan(null);
            }
          }}
        >
          <div style={{ display: 'none' }} />
        </ReallocateDialog>
      )}
    </>
  );
}
