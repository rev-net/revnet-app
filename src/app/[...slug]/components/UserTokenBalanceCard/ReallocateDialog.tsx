import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatUnits } from "viem";
import { NATIVE_TOKEN_DECIMALS, JBChainId } from "juice-sdk-core";
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
import { LoanFeeChart } from "../LoanFeeChart";
import { ImportantInfo } from "./ImportantInfo";
import { useBorrowDialog } from "./hooks/useBorrowDialog";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { useTokenA } from "@/hooks/useTokenA";
import { SimulatedLoanCard } from "../SimulatedLoanCard";

export function ReallocateDialog({
  projectId,
  tokenSymbol,
  selectedLoan,
  children,
  open,
  onOpenChange,
}: {
  projectId: bigint;
  tokenSymbol: string;
  selectedLoan: any;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const reallocateDialog = useBorrowDialog({
    projectId,
    tokenSymbol,
    selectedLoan,
    defaultTab: "borrow",
  });

  const {
    isDialogOpen,
    showChart,
    showInfo,
    borrowStatus,
    collateralAmount,
    selectedChainId,
    cashOutChainId,
    prepaidPercent,
    nativeToWallet,
    grossBorrowedNative,
    loading,
    projectTokenDecimals,
    selectedBalance,
    totalFixedFees,
    feeData,
    newLoanFeeData,
    displayYears,
    displayMonths,
    estimatedBorrowFromInputOnly,
    selectedLoanReallocAmount,
    newLoanBorrowableAmount,
    collateralHeadroom,
    handleOpenChange,
    handleBorrow,
    setCollateralAmount,
    setPrepaidPercent,
    setShowChart,
    setShowInfo,
    balances,
    primaryNativeTerminal,
    address,
  } = reallocateDialog;

  const nativeTokenSymbol = useNativeTokenSymbol();

  // Get the borrowable amount for the specific loan's chain
  const loanChainBalance = balances?.find(
    (b) => b.chainId === Number(selectedLoan?.chainId)
  );
  
  const borrowableAmount = loanChainBalance?.balance.value ?? 0n;
  const borrowableAmountFormatted = Number(formatUnits(borrowableAmount, projectTokenDecimals));

  // Set default collateral amount when dialog opens
  useEffect(() => {
    const isOpen = open !== undefined ? open : isDialogOpen;
    if (isOpen && borrowableAmountFormatted > 0) {
      setCollateralAmount(borrowableAmountFormatted.toFixed(6));
    }
  }, [open, isDialogOpen, borrowableAmountFormatted, setCollateralAmount]);

  // Pre-populate with existing loan data
  const existingCollateral = selectedLoan ? Number(formatUnits(BigInt(selectedLoan.collateral), projectTokenDecimals)) : 0;
  const existingBorrowed = selectedLoan ? Number(formatUnits(BigInt(selectedLoan.borrowAmount), NATIVE_TOKEN_DECIMALS)) : 0;

  // Use provided open state or internal state
  const dialogOpen = open !== undefined ? open : isDialogOpen;
  const handleDialogOpenChange = onOpenChange || handleOpenChange;

  // Close dialog on successful reallocation
  useEffect(() => {
    if (borrowStatus === "success" && onOpenChange) {
      setTimeout(() => {
        onOpenChange(false);
      }, 3000); // Same delay as in useBorrowDialog
    }
  }, [borrowStatus, onOpenChange]);

  // Calculate the new loan simulation values
  const headroomCollateral = Number(formatUnits(collateralHeadroom, projectTokenDecimals));
  const additionalCollateral = Number(collateralAmount || 0);
  const newLoanCollateral = headroomCollateral + additionalCollateral;
  
  // Show simulation if there's headroom available (even with 0 additional capital)
  // because the user needs to set terms for the new loan that will be created from the headroom
  const shouldShowSimulation = headroomCollateral > 0;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reallocate Loan</DialogTitle>
          <DialogDescription>
            Carve out your token's upside: maintain your original loan terms & generate a second loan that pays you cash based on your collateral's gain.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Loan Details */}
          <div className="bg-zinc-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-3">Current Loan Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-600">Current Collateral:</span>
                <div className="font-medium">{existingCollateral.toFixed(6)} {tokenSymbol}</div>
              </div>
              <div>
                <span className="text-zinc-600">Currently Borrowed:</span>
                <div className="font-medium">{existingBorrowed.toFixed(6)} {nativeTokenSymbol}</div>
              </div>
              <div>
                <span className="text-zinc-600">Loan ID will be burned and replaced:</span>
                <div className="font-medium">{selectedLoan?.id}</div>
              </div>
              <div>
                <span className="text-zinc-600">Chain:</span>
                <div className="font-medium">{selectedLoan?.chainId}</div>
              </div>
            </div>
          </div>

          {/* Additional Collateral Input */}
          <div>
            <Label htmlFor="additional-collateral" className="block text-gray-700 text-sm font-bold mb-2">
              How much additional {tokenSymbol} do you want to add as collateral for the new loan?
            </Label>
            {borrowableAmountFormatted > 0 ? (
              <div className="text-sm text-zinc-600 mb-2">
                Available on this chain: {borrowableAmountFormatted.toFixed(6)} {tokenSymbol}
              </div>
            ) : (
              <div className="text-sm text-red-600 mb-2">
                No {tokenSymbol} available on this chain for reallocation
              </div>
            )}
            {collateralAmount && Number(collateralAmount) > borrowableAmountFormatted && (
              <div className="text-sm text-red-600 mb-2">
                Amount exceeds available balance on this chain
              </div>
            )}
            <Input
              id="additional-collateral"
              type="number"
              step="0.0001"
              value={collateralAmount}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = Number(value);
                if (numValue <= borrowableAmountFormatted) {
                  setCollateralAmount(value);
                }
              }}
              placeholder="Enter additional amount"
              className="mb-2"
              max={borrowableAmountFormatted.toString()}
            />
            <div className="flex gap-1 mt-1 mb-2">

            <div className="flex gap-1 mt-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  setCollateralAmount("0");
                }}
                className="h-10 px-3 text-sm text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100 w-16"
              >
                0
              </button>
              {[10, 25, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    const value = borrowableAmountFormatted * (pct / 100);
                    setCollateralAmount(value.toFixed(6));
                  }}
                  className="h-10 px-3 text-sm text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100 w-16"
                >
                  {pct}%
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCollateralAmount(borrowableAmountFormatted.toFixed(6));
                }}
                className="h-10 px-3 text-sm text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100 w-16"
              >
                Max
              </button>
            </div>
            </div>
          </div>

          {/* New Loan Preview */}
          {shouldShowSimulation && newLoanBorrowableAmount && (
            <SimulatedLoanCard
              collateralAmount={newLoanCollateral.toFixed(6)}
              tokenSymbol={tokenSymbol}
              amountBorrowed={Number(formatUnits(newLoanBorrowableAmount, NATIVE_TOKEN_DECIMALS))}
              prepaidPercent={prepaidPercent}
              grossBorrowedNative={Number(formatUnits(newLoanBorrowableAmount, NATIVE_TOKEN_DECIMALS))}
              feeData={newLoanFeeData}
              totalFixedFees={totalFixedFees}
            />
          )}

          {/* Fee Structure Chart */}
          <button
            type="button"
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-2 text-left block text-gray-700 text-sm font-bold"
          >
            <span>Fee Structure for New Loan</span>
            <span className={`transform transition-transform ${showChart ? "rotate-90" : "rotate-0"}`}>
              ▶
            </span>
          </button>
          {showChart && (
            <div className="bg-zinc-50 p-4 rounded-lg">
              <p className="text-sm text-zinc-600 mb-4">
                This shows the fee structure for the new loan that will be created with {newLoanCollateral.toFixed(6)} {tokenSymbol} collateral (appreciation: {headroomCollateral.toFixed(6)} + additional: {additionalCollateral.toFixed(6)}), allowing you to borrow {newLoanBorrowableAmount ? Number(formatUnits(newLoanBorrowableAmount, NATIVE_TOKEN_DECIMALS)).toFixed(6) : "0.000000"} {nativeTokenSymbol}.
              </p>
              <LoanFeeChart
                prepaidPercent={prepaidPercent}
                setPrepaidPercent={setPrepaidPercent}
                feeData={newLoanFeeData}
                nativeToWallet={nativeToWallet}
                grossBorrowedNative={grossBorrowedNative}
                collateralAmount={newLoanCollateral.toFixed(6)}
                tokenSymbol={tokenSymbol}
                displayYears={displayYears}
                displayMonths={displayMonths}
              />
            </div>
          )}

          {/* Important Info */}
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 text-left block text-gray-700 text-sm font-bold"
          >
            <span>Important Info</span>
            <span className={`transform transition-transform ${showInfo ? "rotate-90" : "rotate-0"}`}>
              ▶
            </span>
          </button>
          {showInfo && (
            <ImportantInfo collateralAmount={collateralAmount} tokenSymbol={tokenSymbol} />
          )}

          {/* Status and Action */}
          <DialogFooter className="flex flex-row items-center justify-between w-full gap-4">
            <div className="flex-1 text-left">
              {borrowStatus !== "idle" && (
                <p className="text-sm text-zinc-600">
                  {borrowStatus === "checking" && "Checking permissions..."}
                  {borrowStatus === "granting-permission" && "Granting permission..."}
                  {borrowStatus === "permission-granted" && "Permission granted. Reallocating loan..."}
                  {borrowStatus === "waiting-signature" && "Waiting for wallet confirmation..."}
                  {borrowStatus === "pending" && "Reallocating loan..."}
                  {borrowStatus === "reallocation-pending" && "Reallocating loan..."}
                  {borrowStatus === "success" && "Loan reallocated successfully!"}
                  {borrowStatus === "error-permission-denied" && "Permission was not granted. Please approve to proceed."}
                  {borrowStatus === "error-loan-canceled" && "Loan reallocation was canceled."}
                  {borrowStatus === "error" && "Something went wrong during loan reallocation."}
                </p>
              )}
            </div>
            <ButtonWithWallet
              targetChainId={cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined}
              loading={loading}
              onClick={handleBorrow}
              disabled={!collateralAmount || Number(collateralAmount) > borrowableAmountFormatted || Number(collateralAmount) < 0}
            >
              Reallocate Loan
            </ButtonWithWallet>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 