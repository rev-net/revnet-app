"use client";

import { LoanDetailsTable } from "../LoansDetailsTable";

export function AdditionalCollateralSection({
  projectId,
  address,
  cashOutChainId,
  setSelectedLoan,
  borrowedEth,
  tokenSymbol,
}: {
  projectId: number;
  address: string;
  cashOutChainId: number;
  setSelectedLoan: (loan: any) => void;
  borrowedEth?: string;
  tokenSymbol: string;
}) {
  return (
    <div className="mt-2 text-sm text-gray-700 space-y-1 ml-2 mb-4">
      <p>
        Use appreciated collateral from existing loans to increase your borrowing power without
        adding new tokens.
      </p>
      <LoanDetailsTable
        revnetId={BigInt(projectId)}
        address={address}
        chainId={cashOutChainId}
        tokenSymbol={tokenSymbol}
        onSelectLoan={(loanId, loanData) => setSelectedLoan(loanData)}
      />
      {borrowedEth && <p>Borrowed (wei): {borrowedEth}</p>}
    </div>
  );
}
