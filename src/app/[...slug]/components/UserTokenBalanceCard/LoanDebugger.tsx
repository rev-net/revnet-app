// src/app/[...slug]/components/UserTokenBalanceCard/LoanDebugger.tsx
import { useEffect } from "react";
import LoanStatsDisplay from "./Testing";
import {
  useReadRevLoansTotalBorrowedFrom,
  useReadRevLoansTotalCollateralOf,
  useReadRevLoansNumberOfLoansFor,
  useReadRevLoansBorrowableAmountFrom,
} from "revnet-sdk";

type Props = {
  revnetId: bigint;
  chainId: 1 | 10 | 8453 | 42161 | 84532 | 421614 | 11155111 | 11155420;
  decimals: number;
  currency: bigint;
  collateralCount: bigint;
  terminalAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
};

export default function LoanDebugger({
  revnetId,
  chainId,
  decimals,
  currency,
  collateralCount,
  terminalAddress,
  tokenAddress,
}: Props) {
  const isValid = Boolean(
    revnetId &&
    decimals !== undefined &&
    currency &&
    collateralCount
  );

  const {
    data: totalBorrowed,
    error: borrowedError,
    status: borrowedStatus,
  } = useReadRevLoansTotalBorrowedFrom({
    chainId,
    args: [revnetId, terminalAddress, tokenAddress],
  });

  const { data: totalCollateral } = useReadRevLoansTotalCollateralOf({
    chainId,
    args: [revnetId],
  });

  const { data: loanCount } = useReadRevLoansNumberOfLoansFor({
    chainId,
    args: [revnetId],
  });

  const { data: borrowableAmount } = useReadRevLoansBorrowableAmountFrom({
    chainId,
    args: [revnetId, collateralCount, BigInt(decimals), currency],
  });

  console.log("LoanDebugger props:", isValid, { revnetId, decimals, currency, collateralCount });
  console.log("Loan data fetched:", { loanCount, totalBorrowed, totalCollateral, borrowableAmount });

  useEffect(() => {
    if (!isValid) {
      console.warn("⚠️ Missing loan data: not rendering <LoanStatsDisplay />");
    }
  }, [isValid]);

  if (!isValid) {
    return (
      <div className="text-red-500 text-sm mt-2">
        ⚠️ Missing loan data – loan preview not available.
      </div>
    );
  }

  return (
    <LoanStatsDisplay
      loanCount={loanCount}
      totalBorrowed={totalBorrowed}
      totalCollateral={totalCollateral}
      borrowableAmount={borrowableAmount}
    />
  );
}