import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useTokenA } from "@/hooks/useTokenA";
import { formatTokenSymbol } from "@/lib/utils";
import { JBProjectToken } from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import { RedeemDialog } from "./RedeemDialog";
import { BorrowDialog } from "./BorrowDialog";
import { RepayDialog } from "./RepayDialog";
import { LoanDetailsTable } from "../LoansDetailsTable";
import { useAccount } from "wagmi";

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

  const { data: balances } = useSuckersUserTokenBalance();
  const creditBalance = new JBProjectToken(
    balances?.reduce((acc, balance) => acc + balance.balance.value, 0n) ?? 0n
  );

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [showRepayDialog, setShowRepayDialog] = useState(false);
  const borrowDialogTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <div className="flex flex-row gap-2 mt-2">
        {token?.data?.symbol && creditBalance && primaryNativeTerminal.data ? (
          <RedeemDialog
            projectId={projectId}
            creditBalance={creditBalance}
            tokenSymbol={tokenSymbol}
            primaryTerminalEth={primaryNativeTerminal.data}
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
