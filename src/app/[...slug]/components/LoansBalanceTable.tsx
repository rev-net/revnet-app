import {
    useReadRevLoansTotalBorrowedFrom,
    useReadRevLoansNumberOfLoansFor,
    useReadRevLoansBorrowableAmountFrom,
  } from "revnet-sdk";
  import { JB_CHAINS, JBChainId } from "juice-sdk-core";
  import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
  import { LoansByAccountDocument } from "@/generated/graphql";

  export function LoanTableRow({
    index,
    revnetId,
    chainId,
    terminalAddress,
    tokenAddress,
    decimals,
    currency,
    collateralCount,
    tokenSymbol,
    address,
  }: {
    index: number;
    revnetId: bigint;
    chainId: JBChainId;
    terminalAddress: `0x${string}`;
    tokenAddress: `0x${string}`;
    decimals: number;
    currency: bigint;
    collateralCount: bigint;
    tokenSymbol: string;
    address: string;
  }) {
    const { data } = useBendystrawQuery(LoansByAccountDocument, {
      owner: address,
    });
    console.log("loansByAccount", data);

    const { data: borrowableAmount } = useReadRevLoansBorrowableAmountFrom({
      chainId,
      args: [revnetId, collateralCount, BigInt(decimals), currency],
    });

    function summarizeLoansByChain(
      loans?: Array<{ chainId: number; collateral: string; borrowAmount: string }>
    ) {
      if (!loans) return {};
      return loans.reduce<Record<number, { collateral: bigint; borrowAmount: bigint }>>((acc, loan) => {
        const { chainId, collateral, borrowAmount } = loan;
        if (!acc[chainId]) {
          acc[chainId] = { collateral: 0n, borrowAmount: 0n };
        }
        acc[chainId].collateral += BigInt(collateral);
        acc[chainId].borrowAmount += BigInt(borrowAmount);
        return acc;
      }, {});
    }

    const loanSummary = summarizeLoansByChain(data?.loans?.items);
    console.log("loanSummaryByChain", loanSummary);

    const summary = loanSummary[chainId];

    const hasAnyBalance =
      collateralCount > 0n ||
      (borrowableAmount && borrowableAmount > 0n) ||
      (summary?.borrowAmount && summary.borrowAmount > 0n) ||
      (summary?.collateral && summary.collateral > 0n);

    if (!hasAnyBalance) return null;

    return {
      chainName: JB_CHAINS[chainId]?.name || String(chainId),
      holding: collateralCount,
      borrowable: borrowableAmount,
      debt: summary?.borrowAmount,
      collateral: summary?.collateral,
    };
  }