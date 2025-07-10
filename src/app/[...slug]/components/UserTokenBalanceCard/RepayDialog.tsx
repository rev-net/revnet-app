import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { Address } from "viem";
import {
  useWriteRevLoansRepayLoan,
  useSimulateRevLoansRepayLoan,
  useReadRevLoansLoanOf
} from "revnet-sdk";
import { JBChainId } from "juice-sdk-core";
import { useJBTokenContext } from "juice-sdk-react";
import { formatTokenSymbol } from "@/lib/utils";
import { formatUnits, parseUnits } from "viem";
import { useTokenA } from "@/hooks/useTokenA";

export function RepayDialog({
  loanId,
  chainId,
  open,
  onOpenChange,
}: {
  loanId: string;
  chainId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // ===== STATE =====
  const [collateralToReturn, setCollateralToReturn] = useState("");
  const [repayStatus, setRepayStatus] = useState("idle");
  const [repayTxHash, setRepayTxHash] = useState<`0x${string}` | undefined>();
  const [collateralError, setCollateralError] = useState<string>("");

  // ===== HOOKS =====
  const { address: userAddress } = useAccount();
  const { toast } = useToast();
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);
  const { decimals } = useTokenA();

  // Fetch loan data directly from contract using SDK
  const { data: loanData, isLoading: isLoadingLoan } = useReadRevLoansLoanOf({
    chainId: chainId as JBChainId,
    args: [BigInt(loanId)],
  });

  // Repay loan hook
  const { writeContractAsync: repayLoanAsync, isPending: isRepaying } = useWriteRevLoansRepayLoan();

  // Transaction status tracking
  const { isLoading: isRepayTxLoading, isSuccess: isRepaySuccess } = useWaitForTransactionReceipt({
    hash: repayTxHash,
  });

  // ===== HELPER FUNCTIONS =====
  const formatCollateralAmount = (amountWei: bigint) => {
    const amountTokens = formatUnits(amountWei, decimals);
    return Number(amountTokens).toFixed(6).replace(/\.?0+$/, "");
  };

  const calculateCollateralAmount = (input: string, maxCollateral: bigint): bigint => {
    try {
      const userInputWei = parseUnits(input, decimals);
      return userInputWei >= maxCollateral ? maxCollateral : userInputWei;
    } catch (error) {
      return 0n;
    }
  };

  // Simulation arguments
  const simulationArgs = !isLoadingLoan && loanData && collateralToReturn && userAddress
    ? [
        BigInt(loanId),
        loanData.amount, // Always use full loan amount - contract will calculate exact amount needed
        calculateCollateralAmount(collateralToReturn, loanData.collateral),
        userAddress as Address,
        {
          sigDeadline: 0n,
          amount: 0n,
          expiration: 0,
          nonce: 0,
          signature: "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        }
      ]
    : undefined;

  const {
    data: simulationResult,
    isLoading: isSimulating,
    error: simulationError,
  } = useSimulateRevLoansRepayLoan({
    chainId: chainId as JBChainId,
    args: simulationArgs as readonly [bigint, bigint, bigint, `0x${string}`, { sigDeadline: bigint; amount: bigint; expiration: number; nonce: number; signature: `0x${string}`; }] | undefined,
    value: loanData?.amount, // Send full loan amount - contract will use what it needs and refund excess
  });

  // Extract the exact amount from simulation result for display purposes only
  const exactRepayAmount = (() => {
    if (!simulationResult?.result) return undefined;
    
    // Try to extract amount from simulation result
    if (Array.isArray(simulationResult.result) && simulationResult.result.length >= 2) {
      const remainingLoanAmount = simulationResult.result[1]?.amount;
      
      if (remainingLoanAmount !== undefined && loanData) {
        // Calculate payment amount: original loan - remaining loan
        const paymentAmount = loanData.amount - BigInt(remainingLoanAmount);
        return paymentAmount;
      }
      return undefined;
    }
    
    // Try direct result if it's not an array
    if (simulationResult.result && typeof simulationResult.result === 'object' && 'amount' in simulationResult.result) {
      const remainingLoanAmount = simulationResult.result.amount;
      if (remainingLoanAmount !== undefined && loanData && (typeof remainingLoanAmount === 'string' || typeof remainingLoanAmount === 'number' || typeof remainingLoanAmount === 'bigint')) {
        const paymentAmount = loanData.amount - BigInt(remainingLoanAmount);
        return paymentAmount;
      }
    }
    
    return undefined;
  })();

  // Always use full loan amount - contract will calculate exact amount needed
  const finalRepayAmount = loanData?.amount;

  // ===== EFFECTS =====

  // Validate collateral input
  useEffect(() => {
    if (!loanData || !collateralToReturn) {
      setCollateralError("");
      return;
    }

    const maxCollateralDisplay = Number(formatUnits(loanData.collateral, decimals));
    const inputCollateral = Number(collateralToReturn);

    if (inputCollateral > maxCollateralDisplay) {
      setCollateralError(`Cannot return more than ${formatCollateralAmount(loanData.collateral)} ${tokenSymbol}`);
    } else if (inputCollateral <= 0) {
      setCollateralError("Collateral amount must be greater than 0");
    } else {
      setCollateralError("");
    }
  }, [collateralToReturn, loanData, tokenSymbol, decimals]);

  // Handle transaction status updates
  useEffect(() => {
    if (isRepayTxLoading) {
      setRepayStatus("pending");
    } else if (isRepaySuccess) {
      setRepayStatus("success");
      toast({
        title: "Success",
        description: "Loan repayment completed successfully!",
      });
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    }
  }, [isRepayTxLoading, isRepaySuccess, toast, onOpenChange]);

  // Auto-clear status after 3 seconds for terminal states
  useEffect(() => {
    if (repayStatus === "success" || repayStatus === "error") {
      const timeout = setTimeout(() => setRepayStatus("idle"), 3000);
      return () => clearTimeout(timeout);
    }
  }, [repayStatus]);

  // Initialize form when dialog opens
  useEffect(() => {
    if (open && loanData) {
      const maxCollateralDisplay = formatUnits(loanData.collateral, decimals);
      setCollateralToReturn(maxCollateralDisplay);
    }
    if (!open) {
      setCollateralToReturn("");
      setRepayStatus("idle");
      setRepayTxHash(undefined);
      setCollateralError("");
    }
  }, [open, loanData, decimals]);

  // ===== EVENT HANDLERS =====
  const handleRepay = async () => {
    if (!loanData || !userAddress || !repayLoanAsync) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing required data for repayment",
      });
      return;
    }

    try {
      setRepayStatus("waiting-signature");

      const loanIdBigInt = BigInt(loanId);
      const maxRepayBorrowAmount = loanData.amount; // Use full loan amount as ceiling
      const collateralCountToReturn = calculateCollateralAmount(collateralToReturn, loanData.collateral);

      const txHash = await repayLoanAsync({
        chainId: chainId as JBChainId,
        args: [
          loanIdBigInt,
          maxRepayBorrowAmount,
          collateralCountToReturn,
          userAddress as Address,
          {
            sigDeadline: 0n,
            amount: 0n,
            expiration: 0,
            nonce: 0,
            signature: "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
          },
        ],
        value: exactRepayAmount || loanData?.amount,
      });

      setRepayTxHash(txHash);
    } catch (error: any) {
      console.error("Repayment failed:", error);
      setRepayStatus("error");
      toast({
        variant: "destructive",
        title: "Repayment Failed",
        description: error.message || "An error occurred during repayment",
      });
    }
  };

  // ===== RENDER HELPERS =====
  const renderPercentageButtons = () => {
    if (!loanData) return null;

    return (
      <div className="flex gap-1 mt-4 flex-wrap">
        {[10, 25, 50, 75].map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => {
              const collateralInTokens = Number(formatUnits(loanData.collateral, decimals));
              const portion = collateralInTokens * (pct / 100);
              setCollateralToReturn(portion < 0.000001 ? "0" : portion.toFixed(6).replace(/\.?0+$/, ""));
            }}
            className="h-8 px-3 text-xs text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100"
          >
            {pct}%
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const maxCollateralDisplay = formatUnits(loanData.collateral, decimals);
            setCollateralToReturn(maxCollateralDisplay);
          }}
          className="h-8 px-3 text-xs text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100"
        >
          Max
        </button>
      </div>
    );
  };

  const renderStatusMessage = () => {
    if (repayStatus === "idle") return null;

    const messages = {
      "waiting-signature": "Waiting for wallet confirmation...",
      "pending": "Repayment pending...",
      "success": "Repayment successful!",
      "error": "Something went wrong during repayment."
    };

    return (
      <p className="text-sm text-zinc-600 mt-2">
        {messages[repayStatus as keyof typeof messages]}
      </p>
    );
  };

  // ===== LOADING STATES =====
  if (isLoadingLoan) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Repay loan</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-zinc-700 space-y-4">
            <p>Loading loan data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!loanData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Repay loan</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-zinc-700 space-y-4">
            <p>Loan not found or no longer exists.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Repay loan</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-zinc-700 space-y-4">
          <div className="grid grid-cols-7 gap-2">
            <div className="col-span-4">
              <Label htmlFor="collateral-to-return" className="block text-gray-700 text-sm font-bold mb-1">
                How much {tokenSymbol} collateral do you want back?
              </Label>
              <Input
                id="collateral-to-return"
                type="number"
                step="0.000001"
                value={collateralToReturn}
                onChange={(e) => {
                  const value = e.target.value;
                  
                  // Allow empty input for clearing
                  if (value === "") {
                    setCollateralToReturn("");
                    return;
                  }
                  
                  // Limit decimal places to 8 digits
                  const decimalIndex = value.indexOf('.');
                  if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 8) {
                    return; // Don't update if too many decimal places
                  }
                  
                  const numValue = Number(value);
                  const maxValue = loanData ? Number(formatUnits(loanData.collateral, decimals)) : 0;
                  
                  // Only validate max if it's a valid number
                  if (!isNaN(numValue)) {
                    // Prevent entering more than available collateral
                    if (numValue > maxValue) {
                      setCollateralToReturn(maxValue.toFixed(6));
                    } else {
                      setCollateralToReturn(value);
                    }
                  } else {
                    // Allow partial input (like just a decimal point)
                    setCollateralToReturn(value);
                  }
                }}
                placeholder="Enter collateral amount to return"
                className={collateralError ? "border-red-500" : ""}
              />
              {collateralError && (
                <p className="text-xs text-red-500 mt-1">
                  {collateralError}
                </p>
              )}

              {renderPercentageButtons()}
            </div>
          </div>
          <div className="mt-4">
            <Label className="block text-gray-700 text-sm font-bold mb-1">
              Repayment Breakdown
            </Label>
            {loanData && (
              <div className="bg-zinc-50 p-4 rounded-lg">
                <div className="text-sm text-zinc-600">
                  <table className="w-full">
                    <tbody className="space-y-1">
                      <tr>
                        <td className="pr-4">Original amount borrowed:</td>
                        <td className="font-semibold text-right">{formatUnits(loanData.amount, decimals)} ETH</td>
                      </tr>
                      <tr>
                        <td className="pr-4">Amount of collateral you want back ({(Number(collateralToReturn) / Number(formatUnits(loanData.collateral, decimals)) * 100).toFixed(1)}%):</td>
                        <td className="font-semibold text-right">{collateralToReturn} {tokenSymbol}</td>
                      </tr>
                      {!isSimulating && !simulationError && exactRepayAmount && (
                        <>
                          <tr>
                            <td className="pr-4">Amount to pay now:</td>
                            <td className="font-semibold text-right">{formatUnits(exactRepayAmount, decimals)} ETH</td>
                          </tr>
                          <tr>
                            <td className="pr-4">Amount rolled into new loan id:</td>
                            <td className="font-semibold text-right">{formatUnits(loanData.amount - exactRepayAmount, decimals)} ETH</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
                {isSimulating && (
                  <p className="text-sm text-zinc-500 mt-2">Calculating exact amounts...</p>
                )}
                {simulationError && (
                  <p className="text-sm text-red-500 mt-2">Error: {simulationError.message}</p>
                )}
                {!isSimulating && !simulationError && !exactRepayAmount && (
                  <p className="text-sm text-zinc-500 mt-2">Contract will calculate exact amounts</p>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end pt-2">
            <ButtonWithWallet
              targetChainId={chainId as JBChainId}
              loading={isRepaying || repayStatus === "waiting-signature" || repayStatus === "pending"}
              onClick={handleRepay}
              disabled={
                !finalRepayAmount ||
                Number(finalRepayAmount) <= 0 ||
                !collateralToReturn ||
                Number(collateralToReturn) <= 0 ||
                !!collateralError
              }
            >
              Repay loan
            </ButtonWithWallet>
            {renderStatusMessage()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}