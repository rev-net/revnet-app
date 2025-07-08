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
    
    // Simple approach: just format to reasonable precision
    return Number(amountTokens).toFixed(6).replace(/\.?0+$/, "");
  };

  const calculateCollateralAmount = (input: string, maxCollateral: bigint): bigint => {
    try {
      const userInputWei = parseUnits(input, decimals);
      return userInputWei >= maxCollateral ? maxCollateral : userInputWei;
    } catch (error) {
      // Fallback for invalid input (empty string, invalid number, etc.)
      return 0n;
    }
  };

  // Calculate a conservative maxRepayBorrowAmount
  const calculateMaxRepayAmount = (): bigint | undefined => {
    if (!loanData || !collateralToReturn) return undefined;
    
    const requestedCollateralWei = calculateCollateralAmount(collateralToReturn, loanData.collateral);
    const collateralRatio = Number(requestedCollateralWei) / Number(loanData.collateral);
    
    // Use a much more conservative approach - only 50% of the proportional amount
    const conservativeMaxRepay = BigInt(Math.floor(Number(loanData.amount) * collateralRatio * 0.5));
    
    console.log("RepayDialog - maxRepay calculation:", {
      requestedCollateralWei: requestedCollateralWei.toString(),
      originalCollateral: loanData.collateral.toString(),
      collateralRatio,
      originalLoanAmount: loanData.amount.toString(),
      conservativeMaxRepay: conservativeMaxRepay.toString()
    });
    
    return conservativeMaxRepay;
  };

  // Temporarily disable simulation due to contract errors
  const simulationResult = undefined;
  const isSimulating = false;
  const simulationError = undefined;

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
    maxRepayBorrowAmount: calculateMaxRepayAmount() || loanData?.amount, // Using proportional amount with buffer
    collateralCountToReturn: loanData ? calculateCollateralAmount(collateralToReturn, loanData.collateral) : undefined,
    beneficiary: userAddress,
    value: calculateMaxRepayAmount() || loanData?.amount // Sending proportional amount with buffer
  });

  // Debug: Log the simulation result
  console.log("RepayDialog - simulationResult:", simulationResult);
  console.log("RepayDialog - simulationError:", simulationError);

  // Debug: Log current state
  console.log("RepayDialog - current state:", {
    hasLoanData: !!loanData,
    collateralToReturn,
    userAddress
  });

  // Calculate proportional fallback based on collateral ratio
  const calculateProportionalRepayAmount = (): bigint | undefined => {
    if (!loanData || !collateralToReturn) return undefined;
    
    const requestedCollateralWei = calculateCollateralAmount(collateralToReturn, loanData.collateral);
    const collateralRatio = Number(requestedCollateralWei) / Number(loanData.collateral);
    const proportionalRepayAmount = BigInt(Math.floor(Number(loanData.amount) * collateralRatio));
    
    console.log("RepayDialog - proportional fallback:", {
      requestedCollateralWei: requestedCollateralWei.toString(),
      originalCollateral: loanData.collateral.toString(),
      collateralRatio,
      originalLoanAmount: loanData.amount.toString(),
      proportionalRepayAmount: proportionalRepayAmount.toString()
    });
    
    return proportionalRepayAmount;
  };

  // Always use proportional calculation since simulation is disabled
  const finalRepayAmount = calculateProportionalRepayAmount() || loanData?.amount;

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
      const maxCollateralDisplay = formatUnits(loanData.collateral, decimals);
      setCollateralToReturn(maxCollateralDisplay);
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
            <p className="text-xs text-zinc-500 mt-1">
              Using proportional estimate based on collateral ratio
            </p>
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