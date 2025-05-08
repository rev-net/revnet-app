import {
    useReadRevLoansTotalBorrowedFrom,
    useReadRevLoansNumberOfLoansFor,
    useReadRevLoansBorrowableAmountFrom,
  } from "revnet-sdk";
  import { JB_CHAINS, JBChainId } from "juice-sdk-core";

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
  }) {
    const { data: borrowableAmount } = useReadRevLoansBorrowableAmountFrom({
      chainId,
      args: [revnetId, collateralCount, BigInt(decimals), currency],
    });

    return (
      <div key={index} className="grid grid-cols-3 gap-3 text-sm py-1 border-t border-zinc-100">
        <div className="text-sm text-left font-medium text-zinc-600">{JB_CHAINS[chainId].name}</div>
        <div className="text-right">{(Number(collateralCount) / 1e18).toFixed(5)}</div>
        <div className="text-right">{borrowableAmount !== undefined ? `${(Number(borrowableAmount) / 1e18).toFixed(5)}` : "—"}</div>
       </div>
    );
  }