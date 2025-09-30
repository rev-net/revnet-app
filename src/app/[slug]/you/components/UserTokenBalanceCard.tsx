"use client";

import { Button } from "@/components/ui/button";
import { Project } from "@/generated/graphql";
import { formatTokenSymbol } from "@/lib/utils";
import { JBChainId, JBProjectToken, NATIVE_TOKEN } from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import { useRef, useState } from "react";
import { useAccount } from "wagmi";
import { BorrowDialog } from "./BorrowDialog";
import { LoanDetailsTable } from "./LoansDetailsTable";
import { ReallocateDialog } from "./ReallocateDialog";
import { RedeemDialog } from "./RedeemDialog";
import { RepayDialog } from "./RepayDialog";

interface Props {
  projects: Array<Pick<Project, "projectId" | "token">>;
}

export function UserTokenBalanceCard(props: Props) {
  const { projects } = props;

  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();

  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);
  const chainId = useJBChainId();
  const { address } = useAccount();

  const { data: balances } = useSuckersUserTokenBalance();

  const creditBalance = new JBProjectToken(
    balances?.reduce((acc, { balance }) => acc + balance.value, 0n) ?? 0n,
  );

  const isEthBasedProject = projects.every(
    (project) => project.token?.toLowerCase() === NATIVE_TOKEN.toLowerCase(),
  );

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<JBChainId | null>(null);
  const [showRepayDialog, setShowRepayDialog] = useState(false);
  const borrowDialogTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [reallocateLoan, setReallocateLoan] = useState<any>(null);
  const [showReallocateDialog, setShowReallocateDialog] = useState(false);

  return (
    <>
      <div className="flex flex-row gap-2 mt-2">
        {token?.data?.symbol && creditBalance && primaryNativeTerminal.data ? (
          <RedeemDialog projectId={projectId} tokenSymbol={tokenSymbol}>
            <Button variant="outline" disabled={creditBalance.value === 0n}>
              Cash out
            </Button>
          </RedeemDialog>
        ) : null}

        {token?.data?.symbol && creditBalance && primaryNativeTerminal.data && isEthBasedProject ? (
          <BorrowDialog projectId={projectId} tokenSymbol={tokenSymbol}>
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
              setSelectedChainId(chainId as JBChainId);
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
          <div style={{ display: "none" }} />
        </ReallocateDialog>
      )}
    </>
  );
}
