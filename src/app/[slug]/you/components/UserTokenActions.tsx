"use client";

import { Button } from "@/components/ui/button";
import { Project } from "@/generated/graphql";
import { formatTokenSymbol } from "@/lib/utils";
import { JBChainId, JBProjectToken } from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import { useRef, useState } from "react";
import { useAccount } from "wagmi";
import { BorrowDialog } from "./BorrowDialog";
import { BridgeDialog } from "./BridgeDialog";
import { LoanDetailsTable } from "./LoansDetailsTable";
import { ReallocateDialog } from "./ReallocateDialog";
import { RedeemDialog } from "./RedeemDialog";
import { RepayDialog } from "./RepayDialog";

interface Props {
  projects: Array<Pick<Project, "projectId" | "token" | "chainId">>;
}

export function UserTokenActions(props: Props) {
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

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<JBChainId | null>(null);
  const [showRepayDialog, setShowRepayDialog] = useState(false);
  const borrowDialogTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [reallocateLoan, setReallocateLoan] = useState<any>(null);
  const [showReallocateDialog, setShowReallocateDialog] = useState(false);

  return (
    <div>
      <h3 className="text-lg font-medium">Use your {tokenSymbol}</h3>
      <div className="flex gap-2 mt-2">
        {token?.data?.symbol && creditBalance && primaryNativeTerminal.data ? (
          <RedeemDialog projectId={projectId} tokenSymbol={tokenSymbol}>
            <Button variant="outline" disabled={creditBalance.value === 0n}>
              Cash out
            </Button>
          </RedeemDialog>
        ) : null}

        {token?.data?.symbol && creditBalance && primaryNativeTerminal.data ? (
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

        {projects.length > 1 && (
          <BridgeDialog projects={projects}>
            <Button variant="outline" disabled={creditBalance.value === 0n}>
              Move between chains
            </Button>
          </BridgeDialog>
        )}

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
        <LoanDetailsTable
          title="Your loans"
          revnetId={projectId}
          address={address}
          chainId={0}
          tokenSymbol={tokenSymbol}
          projects={projects}
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
    </div>
  );
}
