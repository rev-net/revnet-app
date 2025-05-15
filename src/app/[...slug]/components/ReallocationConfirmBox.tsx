"use client";
import { JBChainId } from "juice-sdk-react";
import { useWriteRevLoansReallocateCollateralFromLoan } from "revnet-sdk";

export function ReallocationConfirmBox({
  pendingReallocation,
  primaryNativeTerminal,
  address,
  cashOutChainId,
  tokenSymbol,
  onComplete,
}: {
  pendingReallocation: {
    loanId: bigint;
    collateralCountToTransfer: bigint;
    collateralCountToAdd: bigint;
    minBorrowAmount: bigint;
    feePercent: bigint;
  };
  primaryNativeTerminal: `0x${string}`;
  address: `0x${string}`;
  cashOutChainId: number;
  tokenSymbol: string;
  onComplete: () => void;
}) {
  const {
    writeContractAsync: reallocateCollateralAsync,
    isPending: isReallocating,
  } = useWriteRevLoansReallocateCollateralFromLoan();

  return (
    <div className="mt-4 border p-4 rounded bg-yellow-50 text-sm text-yellow-900">
      <p className="mb-2">
        You are reallocating {Number(pendingReallocation.collateralCountToTransfer) / 1e18} {tokenSymbol} and adding{" "}
        {Number(pendingReallocation.collateralCountToAdd) / 1e18} {tokenSymbol} to borrow again.
      </p>
      <button
        onClick={async () => {
          try {
            await reallocateCollateralAsync({
              chainId: cashOutChainId as JBChainId,
              args: [
                pendingReallocation.loanId,
                pendingReallocation.collateralCountToTransfer,
                {
                  token: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                  terminal: primaryNativeTerminal,
                },
                pendingReallocation.minBorrowAmount,
                pendingReallocation.collateralCountToAdd,
                address,
                pendingReallocation.feePercent,
              ],
            });
          } catch (e) {
            console.error("Reallocation failed", e);
          } finally {
            onComplete();
          }
        }}
        disabled={isReallocating}
        className="mt-2 inline-flex items-center justify-center px-4 py-2 text-white bg-black hover:bg-gray-800 disabled:opacity-50 rounded"
      >
        {isReallocating ? "Reallocating..." : "Confirm Reallocation"}
      </button>
    </div>
  );
}
