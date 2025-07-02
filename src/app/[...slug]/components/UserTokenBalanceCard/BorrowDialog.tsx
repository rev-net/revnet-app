import { PropsWithChildren } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatUnits } from "viem";
import { NATIVE_TOKEN_DECIMALS, JBChainId, JB_TOKEN_DECIMALS } from "juice-sdk-core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { SimulatedLoanCard } from "../SimulatedLoanCard";
import { LoanFeeChart } from "../LoanFeeChart";
import { TokenBalanceTable } from "../TokenBalanceTable";
import { LoanDetailsTable } from "../LoansDetailsTable";
import { ImportantInfo } from "./ImportantInfo";
import { useBorrowDialog } from "./hooks/useBorrowDialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useSuckersUserTokenBalance, useJBTokenContext, useJBContractContext } from "juice-sdk-react";

export function BorrowDialog({
  projectId,
  tokenSymbol,
  children,
  selectedLoan,
  defaultTab,
}: PropsWithChildren<{
  projectId: bigint;
  tokenSymbol: string;
  selectedLoan?: any;
  defaultTab?: "borrow" | "repay";
}>) {
  const borrowDialog = useBorrowDialog({
          projectId,
    tokenSymbol,
    selectedLoan,
    defaultTab,
  });

  const {
    isDialogOpen,
    selectedTab,
    showChart,
    showInfo,
    showOtherCollateral,
    showLoanDetailsTable,
    showRefinanceLoanDetailsTable,
    showingWaitingMessage,
    borrowStatus,
    collateralAmount,
    selectedChainId,
    cashOutChainId,
    prepaidPercent,
    nativeToWallet,
    grossBorrowedNative,
    internalSelectedLoan,
    repayStatus,
    repayAmount,
    collateralToReturn,
    repayTxHash,
    loading,
    projectTokenDecimals,
    userProjectTokenBalance,
    selectedBalance,
    totalFixedFees,
    totalReallocationCollateral,
            remainingCollateral,
    netAvailableToBorrow,
    isOvercollateralized,
    extraCollateralBuffer,
    collateralHeadroom,
    collateralCountToTransfer,
    feeData,
    displayYears,
    displayMonths,
    estimatedBorrowFromInputOnly,
    selectedLoanReallocAmount,
    currentBorrowableOnSelectedCollateral,
    estimatedRepayAmountForCollateral,
    isEstimatingRepayment,
    estimatedNewBorrowableAmount,
    handleOpenChange,
    handleChainSelection,
    handleLoanSelection,
    handleBorrow,
    setCollateralAmount,
    setPrepaidPercent,
    setShowChart,
    setShowInfo,
    setShowOtherCollateral,
    setCollateralToReturn,
    setInternalSelectedLoan,
    balances,
    primaryNativeTerminal,
    address,
    setSelectedChainId,
    setCashOutChainId,
  } = borrowDialog;

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New loan</DialogTitle>
          <DialogDescription asChild>
            <section className="my-4">
              {/* Dialog description content here, "Important Info" toggle moved below Fee Structure Over Time */}
            </section>
          </DialogDescription>
        </DialogHeader>
        {/* Main dialog content (inputs, preview, chart, actions) */}
        {selectedTab === "borrow" && (
          <div>
            {/* Network selector and collateral input, new layout */}
            <div className="grid w-full gap-1.5">
              <TokenBalanceTable
                balances={balances}
                projectId={projectId}
                tokenSymbol={tokenSymbol}
                terminalAddress={primaryNativeTerminal.data as `0x${string}`}
                address={address as `0x${string}`}
                columns={["chain", "holding", "borrowable"]}
                selectedChainId={selectedChainId ?? undefined}
                onCheckRow={(chainId, checked) => {
                  if (checked) {
                    const selected = balances?.find((b: any) => b.chainId === chainId);
                    const collateral = selected ? formatUnits(selected.balance.value, projectTokenDecimals) : "0";
                    setSelectedChainId(chainId);
                    setCashOutChainId(chainId.toString());
                    setCollateralAmount(collateral);
                    setInternalSelectedLoan(null);
                  }
                }}
                onAutoselectRow={(chainId) => {
                  const selected = balances?.find((b: any) => b.chainId === chainId);
                  const collateral = selected ? formatUnits(selected.balance.value, projectTokenDecimals) : "0";
                  setSelectedChainId(chainId);
                  setCashOutChainId(chainId.toString());
                  setCollateralAmount(collateral);
                  setInternalSelectedLoan(null);
                }}
              />
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-4">
                  <Label htmlFor="collateral-amount" className="block text-gray-700 text-sm font-bold">
                    How much {tokenSymbol} do you want to collateralize?
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-4">
                  <Input
                    id="collateral-amount"
                    type="number"
                    step="0.0001"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    placeholder={
                      cashOutChainId && selectedBalance
                        ? Number(formatUnits(selectedBalance.balance.value, projectTokenDecimals)).toFixed(8)
                        : "Enter amount"
                    }
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-4">
                  <div className="flex gap-1 mt-1 mb-2">
                    {[10, 25, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          if (selectedBalance) {
                            const value = Number(formatUnits(selectedBalance.balance.value, projectTokenDecimals)) * (pct / 100);
                            setCollateralAmount(value.toFixed(6));
                          }
                        }}
                        className="h-10 px-3 text-sm text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100"
                      >
                        {pct}%
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedBalance) {
                          const maxValue = Number(formatUnits(selectedBalance.balance.value, projectTokenDecimals));
                          setCollateralAmount(maxValue.toFixed(6));
                        }
                      }}
                      className="h-10 px-3 text-sm text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100"
                    >
                      Max
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Simulation state for loan preview, including reallocation --- */}
            {(() => {
              // Calculate effectiveBorrowableAmount and simulation values
              const effectiveBorrowableAmount =
                internalSelectedLoan && showOtherCollateral && selectedLoanReallocAmount
                  ? selectedLoanReallocAmount - BigInt(internalSelectedLoan.borrowAmount)
                  : estimatedBorrowFromInputOnly;
              const simulatedAmountBorrowed = effectiveBorrowableAmount
                ? Number(formatUnits(effectiveBorrowableAmount, NATIVE_TOKEN_DECIMALS))
                : 0;
              const simulatedGrossBorrowedEth = simulatedAmountBorrowed;

              if (collateralAmount && !isNaN(Number(collateralAmount))) {
                return (
                  <SimulatedLoanCard
                    collateralAmount={collateralAmount}
                    tokenSymbol={tokenSymbol}
                    amountBorrowed={simulatedAmountBorrowed}
                    prepaidPercent={prepaidPercent}
                    grossBorrowedNative={simulatedGrossBorrowedEth}
                    feeData={feeData}
                    totalFixedFees={totalFixedFees}
                  />
                );
              }
              return null;
            })()}
            {/* Fee Structure Over Time toggleable chart */}
            <button
              type="button"
              onClick={() => setShowChart(!showChart)}
              className="flex items-center gap-2 text-left block text-gray-700 text-sm font-bold  mt-6"
            >
              <span>Fee Structure</span>
              <span
                className={`transform transition-transform ${showChart ? "rotate-90" : "rotate-0"}`}
              >
                ▶
              </span>
            </button>
            {showChart && (
              <LoanFeeChart
                prepaidPercent={prepaidPercent}
                setPrepaidPercent={setPrepaidPercent}
                feeData={feeData}
                nativeToWallet={nativeToWallet}
                grossBorrowedNative={grossBorrowedNative}
                collateralAmount={collateralAmount}
                tokenSymbol={tokenSymbol}
                displayYears={displayYears}
                displayMonths={displayMonths}
              />
            )}
            {/* Important Info toggleable section */}
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-2 text-left block text-gray-700 text-sm font-bold mb-2 mt-6"
            >
              <span>Important Info</span>
              <span
                className={`transform transition-transform ${showInfo ? "rotate-90" : "rotate-0"}`}
              >
                ▶
              </span>
            </button>
            {showInfo && (
              <ImportantInfo collateralAmount={collateralAmount} tokenSymbol={tokenSymbol} />
            )}
            {/* Borrow Button and Status Message - horizontally aligned */}
            <DialogFooter className="flex flex-row items-center justify-between w-full gap-4">
              <div className="flex-1 text-left">
                {borrowStatus !== "idle" && (
                  <p className="text-sm text-zinc-600">
                    {borrowStatus === "checking" && "Checking permissions..."}
                    {borrowStatus === "granting-permission" && "Granting permission..."}
                    {borrowStatus === "permission-granted" && "Permission granted. Creating loan..."}
                    {borrowStatus === "waiting-signature" && "Waiting for wallet confirmation..."}
                    {borrowStatus === "pending" && "Creating loan..."}
                    {borrowStatus === "reallocation-pending" && "Adjusting loan..."}
                    {borrowStatus === "success" && "Loan created successfully!"}
                    {borrowStatus === "error-permission-denied" && "Permission was not granted. Please approve to proceed."}
                    {borrowStatus === "error-loan-canceled" && "Loan creation was canceled."}
                    {borrowStatus === "error" && "Something went wrong during loan creation."}
                  </p>
                )}
              </div>
              {/* Single borrow button for both reallocation and standard borrowing */}
              <ButtonWithWallet
                targetChainId={cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined}
                loading={loading}
                onClick={handleBorrow}
              >
                {internalSelectedLoan && collateralAmount && !isNaN(Number(collateralAmount))
                  ? "Adjust loan"
                  : "Open loan"}
              </ButtonWithWallet>
            </DialogFooter>
          </div>
        )}
     </DialogContent>
    </Dialog>
  );
}

