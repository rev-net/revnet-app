import { PropsWithChildren } from "react";
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
import { SimulatedLoanCard } from "../SimulatedLoanCard";
import { LoanFeeChart } from "../LoanFeeChart";
import { ImportantInfo } from "./ImportantInfo";
import { useBorrowDialog } from "./hooks/useBorrowDialog";
import { useEffect, useCallback } from "react";
import { ChainLogo } from "@/components/ChainLogo";
import { JB_CHAINS } from "juice-sdk-core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USDC_ADDRESSES } from "@/app/constants";

export function BorrowDialog({
  projectId,
  tokenSymbol,
  children,
  selectedLoan,
}: PropsWithChildren<{
  projectId: bigint;
  tokenSymbol: string;
  selectedLoan?: any;
}>) {
  
  const borrowDialog = useBorrowDialog({
    projectId,
    tokenSymbol,
    selectedLoan,
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
    internalSelectedLoan,
    loading,
    projectTokenDecimals,
    selectedBalance,
    totalFixedFees,
    feeData,
    displayYears,
    displayMonths,
    estimatedBorrowFromInputOnly,
    selectedLoanReallocAmount,
    handleOpenChange,
    handleBorrow,
    setCollateralAmount,
    setPrepaidPercent,
    setShowChart,
    setShowInfo,
    setInternalSelectedLoan,
    balances,
    setSelectedChainId,
    setCashOutChainId,
    // ===== PHASE 3: BASE TOKEN CONTEXT =====
    baseToken,
    selectedChainTokenConfig,
    getTokenConfigForChain,
  } = borrowDialog;

  // ===== PHASE 3: DYNAMIC TOKEN SYMBOL =====
  // Get the correct token symbol for the selected chain
  const getTokenSymbolForChain = useCallback((targetChainId: number) => {
    const chainTokenConfig = getTokenConfigForChain(targetChainId);
    
    // Get the actual token symbol from the bendystraw data
    if (chainTokenConfig?.token?.toLowerCase() === "0x000000000000000000000000000000000000eeee") {
      return "ETH";
    }
    
    // For other tokens, check if it's a known USDC address
    const isUsdc = Object.values(USDC_ADDRESSES).includes(chainTokenConfig?.token as `0x${string}`);
    const symbol = isUsdc ? "USDC" : "TOKEN";
    return symbol;
  }, [getTokenConfigForChain]);
  
  const selectedChainTokenSymbol = cashOutChainId ? getTokenSymbolForChain(Number(cashOutChainId)) : baseToken.symbol;
  
  // Handle chain selection - exactly like RedeemDialog
  const handleChainSelect = useCallback((chainId: string) => {
    const selected = balances?.find((b: any) => b.chainId === Number(chainId));
    if (selected) {
      const collateral = formatUnits(selected.balance.value, projectTokenDecimals);
      setSelectedChainId(Number(chainId));
      setCashOutChainId(chainId);
      setCollateralAmount(collateral);
      setInternalSelectedLoan(null);
    }
  }, [balances, projectTokenDecimals, setSelectedChainId, setCashOutChainId, setCollateralAmount, setInternalSelectedLoan]);

  // Restore chain selection if it gets reset while dialog is open
  useEffect(() => {
    if (isDialogOpen && !cashOutChainId && selectedChainId && balances) {
      setCashOutChainId(selectedChainId.toString());
    }
  }, [isDialogOpen, cashOutChainId, selectedChainId, balances, setCashOutChainId]);

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
        <div>
          {/* Holdings Overview Section - Static like RedeemDialog */}
          <div className="mb-5 w-[65%]">
            <span className="text-sm text-black font-medium">
              Your {tokenSymbol}
            </span>
            <div className="mt-1 border border-zinc-200 p-3 bg-zinc-50">
              {balances?.map((balance, index) => (
                <div key={index} className="flex justify-between gap-2">
                  {JB_CHAINS[balance.chainId as JBChainId].name}
                  <span className="font-medium">
                    {balance.balance?.format(8)} {tokenSymbol}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Collateral Input Section - Like RedeemDialog */}
          <div className="grid w-full gap-1.5">
            <Label htmlFor="collateral-amount" className="text-zinc-900">
              How much {tokenSymbol} do you want to collateralize?
            </Label>
            <div className="grid grid-cols-7 gap-2">
              <div className="col-span-4">
                <div className="relative">
                  <Input
                    id="collateral-amount"
                    name="collateral-amount"
                    type="number"
                    step="0.0001"
                    max={selectedBalance ? Number(formatUnits(selectedBalance.balance.value, projectTokenDecimals)) : undefined}
                    value={collateralAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      
                      // Allow empty input for clearing
                      if (value === "") {
                        setCollateralAmount("");
                        return;
                      }
                      
                      // Limit decimal places to 8 digits
                      const decimalIndex = value.indexOf('.');
                      if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 8) {
                        return; // Don't update if too many decimal places
                      }
                      
                      const numValue = Number(value);
                      const maxValue = selectedBalance ? Number(formatUnits(selectedBalance.balance.value, projectTokenDecimals)) : 0;
                      
                      // Only validate max if it's a valid number
                      if (!isNaN(numValue)) {
                        // Prevent entering more than available balance
                        if (numValue > maxValue) {
                          setCollateralAmount(maxValue.toFixed(6));
                        } else {
                          setCollateralAmount(value);
                        }
                      } else {
                        // Allow partial input (like just a decimal point)
                        setCollateralAmount(value);
                      }
                    }}
                    placeholder={
                      cashOutChainId && selectedBalance
                        ? Number(formatUnits(selectedBalance.balance.value, projectTokenDecimals)).toFixed(8)
                        : "Enter amount"
                    }
                    className="mt-2"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 z-10">
                    <span className="text-zinc-500 sm:text-md">
                      {tokenSymbol}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-span-3">
                <Select 
                  onValueChange={handleChainSelect} 
                  value={cashOutChainId || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chain">
                      {cashOutChainId && (
                        <div className="flex items-center gap-2">
                          <ChainLogo chainId={Number(cashOutChainId) as JBChainId} />
                          <span>{JB_CHAINS[Number(cashOutChainId) as JBChainId].name}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {balances
                      ?.filter((b) => b.balance.value > 0n)
                      .map((balance) => {
                        return (
                          <SelectItem
                            value={balance.chainId.toString()}
                            key={balance.chainId}
                          >
                            <div className="flex items-center gap-2">
                              <ChainLogo
                                chainId={balance.chainId as JBChainId}
                              />
                              {
                                JB_CHAINS[balance.chainId as JBChainId]
                                  .name
                              }
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
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
                        setCollateralAmount(maxValue.toFixed(8));
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
              internalSelectedLoan && selectedLoanReallocAmount
                ? selectedLoanReallocAmount - BigInt(internalSelectedLoan.borrowAmount)
                : estimatedBorrowFromInputOnly;
            
            // Use correct decimals for the selected chain
            const tokenDecimals = selectedChainTokenConfig?.decimals || NATIVE_TOKEN_DECIMALS;
            const simulatedAmountBorrowed = effectiveBorrowableAmount
              ? Number(formatUnits(effectiveBorrowableAmount, tokenDecimals))
              : 0;
            const simulatedGrossBorrowedEth = simulatedAmountBorrowed;



            if (collateralAmount && !isNaN(Number(collateralAmount))) {
              return (
                <SimulatedLoanCard
                  collateralAmount={collateralAmount}
                  tokenSymbol={selectedChainTokenSymbol}
                  collateralTokenSymbol={tokenSymbol}
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
            <span>Variable Fee Structure</span>
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
              tokenSymbol={selectedChainTokenSymbol}
              collateralTokenSymbol={tokenSymbol}
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
                  {borrowStatus === "approving" && "Approving token allowance..."}
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
              targetChainId={Number(cashOutChainId) as JBChainId}
              loading={loading}
              onClick={() => {
                handleBorrow();
              }}
            >
              {internalSelectedLoan && collateralAmount && !isNaN(Number(collateralAmount))
                ? "Adjust loan"
                : "Open loan"}
            </ButtonWithWallet>
          </DialogFooter>
        </div>
       </DialogContent>
      </Dialog>
    );
  }