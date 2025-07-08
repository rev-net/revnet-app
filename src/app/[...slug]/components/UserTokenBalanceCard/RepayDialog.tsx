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
import { JBChainId, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { useJBTokenContext } from "juice-sdk-react";
import { formatTokenSymbol } from "@/lib/utils";
import { formatUnits } from "viem";
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
  // Debug: Log the loan ID being passed in
  console.log("RepayDialog - loanId:", loanId, "type:", typeof loanId);
  
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

  // Debug: Log loan data when it loads
  console.log("RepayDialog - loanData:", loanData);

  // Repay loan hook
  const { writeContractAsync: repayLoanAsync, isPending: isRepaying } = useWriteRevLoansRepayLoan();

  // Transaction status tracking
  const { isLoading: isRepayTxLoading, isSuccess: isRepaySuccess } = useWaitForTransactionReceipt({
    hash: repayTxHash,
  });

  // ===== HELPER FUNCTIONS =====
  const formatCollateralAmount = (amountWei: bigint) => {
    const amountTokens = formatUnits(amountWei, decimals);

    // If amount is negligible dust, return "0"
    if (Number(amountTokens) < 0.0000000001) {
      return "0";
    }

    // Clean up trailing zeros
    return Number(amountTokens).toFixed(6).replace(/\.?0+$/, "");
  };

  const calculateCollateralAmount = (input: string, maxCollateral: bigint) => {
    const userInputWei = BigInt(Math.floor(Number(input) * (10 ** decimals)));
    return userInputWei >= maxCollateral ? maxCollateral : userInputWei;
  };

  // Alternative 1: Use full loan amount as max, let contract calculate actual amount needed
  const {
    data: simulationResult,
    isLoading: isSimulating,
    error: simulationError,
  } = useSimulateRevLoansRepayLoan({
    chainId: chainId as JBChainId,
    args: loanData && collateralToReturn && userAddress
      ? [
          BigInt(loanId),
          loanData.amount, // Use full loan amount as maxRepayBorrowAmount
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
      : undefined,
    value: loanData?.amount, // Send full amount, contract will return excess
  });

  // Debug: Log the collateral calculation
  console.log("RepayDialog - collateral calculation:", {
    collateralToReturn: collateralToReturn,
    calculatedCollateralWei: loanData ? calculateCollateralAmount(collateralToReturn, loanData.collateral) : undefined,
    originalCollateral: loanData?.collateral,
    ratio: loanData ? Number(calculateCollateralAmount(collateralToReturn, loanData.collateral)) / Number(loanData.collateral) : undefined,
    originalLoanAmount: loanData?.amount,
    // Add decimal information
    projectTokenDecimals: decimals,
    nativeTokenDecimals: 18,
    // Show the actual calculations
    collateralToReturnInWei: loanData ? BigInt(Math.floor(Number(collateralToReturn) * (10 ** decimals))) : undefined,
    maxCollateralInWei: loanData?.collateral,
    // Show percentage
    percentageOfCollateral: loanData ? (Number(calculateCollateralAmount(collateralToReturn, loanData.collateral)) / Number(loanData.collateral)) * 100 : undefined,
    // Show the exact calculation steps
    calculationSteps: {
      inputAsNumber: Number(collateralToReturn),
      multiplier: 10 ** decimals,
      rawCalculation: Number(collateralToReturn) * (10 ** decimals),
      flooredValue: Math.floor(Number(collateralToReturn) * (10 ** decimals)),
      finalBigInt: loanData ? BigInt(Math.floor(Number(collateralToReturn) * (10 ** decimals))) : undefined
    }
  });

  // Debug: Log the simulation arguments
  console.log("RepayDialog - simulation args:", {
    loanId: BigInt(loanId),
    maxRepayBorrowAmount: loanData?.amount, // Using full loan amount as max
    collateralCountToReturn: loanData ? calculateCollateralAmount(collateralToReturn, loanData.collateral) : undefined,
    beneficiary: userAddress,
    value: loanData?.amount // Sending full amount, contract will return excess
  });

  // Debug: Log the simulation result
  console.log("RepayDialog - simulationResult:", simulationResult);
  console.log("RepayDialog - simulationError:", simulationError);

  // Use the simulation result to get the exact repay amount
  const exactRepayAmount = simulationResult?.result && Array.isArray(simulationResult.result) && simulationResult.result.length >= 2 && loanData
    ? loanData.amount - BigInt(simulationResult.result[1]?.amount || 0)
    : // Fallback when simulation fails or is not available
      undefined;

  // Use the simulation result to get the exact repay amount, or fallback to full loan amount
  const finalRepayAmount = exactRepayAmount || loanData?.amount;

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
  }, [collateralToReturn, loanData, tokenSymbol]);

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

  // Auto-clear status after 5 seconds for terminal states
  useEffect(() => {
    if (repayStatus === "success" || repayStatus === "error") {
      const timeout = setTimeout(() => setRepayStatus("idle"), 5000);
      return () => clearTimeout(timeout);
    }
  }, [repayStatus]);

  // Initialize form when dialog opens
  useEffect(() => {
    if (open && loanData) {
      // For testing, start with a smaller amount instead of max
      const maxCollateralDisplay = formatUnits(loanData.collateral, decimals);
      const testAmount = (Number(maxCollateralDisplay) * 0.1).toString(); // Start with 10% for testing
      setCollateralToReturn(testAmount);
    }
    if (!open) {
      setCollateralToReturn("");
      setRepayStatus("idle");
      setRepayTxHash(undefined);
      setCollateralError("");
    }
  }, [open, loanData]);

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
      const maxRepayBorrowAmount = finalRepayAmount || loanData.amount;
      const collateralCountToReturn = calculateCollateralAmount(collateralToReturn, loanData.collateral);

      const txHash = await repayLoanAsync({
        chainId: chainId as JBChainId,
        args: [
          loanIdBigInt,
          loanData.amount, // Use actual loan amount for consistency with simulation
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
        value: maxRepayBorrowAmount, // Keep using the calculated amount for the actual ETH sent
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
                  // Only allow numbers, decimals, and backspace
                  if (/^[0-9]*\.?[0-9]*$/.test(value) || value === "") {
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
              Cost to repay: {finalRepayAmount ? formatUnits(finalRepayAmount, decimals) : "0.00"} ETH
            </Label>
            {isSimulating && (
              <p className="text-xs text-zinc-500 mt-1">
                Calculating exact amount...
              </p>
            )}
            {simulationError && (
              <p className="text-xs text-red-500 mt-1">
                Error calculating amount: {simulationError.message}
              </p>
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