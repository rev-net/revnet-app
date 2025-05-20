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

  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"borrow" | "repay">("borrow");
  const borrowDialogTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeTab === "repay" && selectedLoan) {
      borrowDialogTriggerRef.current?.click();
    }
  }, [activeTab, selectedLoan]);

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
            creditBalance={creditBalance}
            tokenSymbol={tokenSymbol}
            primaryTerminalEth={primaryNativeTerminal.data}
            selectedLoan={selectedLoan}
            defaultTab={activeTab}
          >
            <Button
              ref={borrowDialogTriggerRef}
              variant="outline"
              disabled={creditBalance.value === 0n}
              onClick={(e) => {
                if (!(e.detail === 0)) {
                  setActiveTab("borrow");
                }
              }}
            >
              Get a loan
            </Button>
          </BorrowDialog>
        ) : null}
      </div>
      {address && projectId && chainId ? (
        <>
        <LoanDetailsTable
          title="Your loans"
          revnetId={projectId}
          address={address}
          chainId={0}
          onSelectLoan={(loanId, loanData) => {
            setSelectedLoan(loanData);
            setActiveTab("repay");
          }}
          title="Your Loans"
        />
      </>
    ) : null}
    </>
  );
}
