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
  useSimulateRevLoansRepayLoan
} from "revnet-sdk";
import { JBChainId, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { LoansDetailsByAccountDocument } from "@/generated/graphql";

export function RepayDialog({
  projectId,
  tokenSymbol,
  address,
  open,
  onOpenChange,
  loanId,
  chainId,
  ...props
}: {
  projectId: bigint;
  tokenSymbol: string;
  address: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string;
  chainId: number;
}) {
  const [repayAmount, setRepayAmount] = useState("");
  const [collateralToReturn, setCollateralToReturn] = useState("");
  const [repayStatus, setRepayStatus] = useState("idle");
  const [repayTxHash, setRepayTxHash] = useState<`0x${string}` | undefined>();
  const [collateralError, setCollateralError] = useState<string>("");
  
  const { address: userAddress } = useAccount();
  const { toast } = useToast();

  // Fetch loan data using GraphQL
  const { data: loansData } = useBendystrawQuery(LoansDetailsByAccountDocument, {
    owner: address,
    projectId: Number(projectId),
  });
  // Find the specific loan by ID
  const loan = loansData?.loans?.items?.find(l => l.id === loanId);
  
  // Repay loan hook
  const { writeContractAsync: repayLoanAsync, isPending: isRepaying } = useWriteRevLoansRepayLoan();
  
  // Transaction status tracking
  const { isLoading: isRepayTxLoading, isSuccess: isRepaySuccess } = useWaitForTransactionReceipt({
    hash: repayTxHash,
  });

  // Simulate the repay loan transaction to get the exact amount
  const {
    data: simulationResult,
    isLoading: isSimulating,
    error: simulationError,
  } = useSimulateRevLoansRepayLoan({
    chainId: chainId as JBChainId,
    args: loan && collateralToReturn && userAddress
      ? [
          BigInt(loan.id),
          2n ** 256n - 1n, // MaxUint256 - allow contract to use maximum amount needed
          // Convert user input to wei, but be conservative to avoid rounding errors
          (() => {
            const userInputWei = BigInt(Math.floor(Number(collateralToReturn) * (10 ** NATIVE_TOKEN_DECIMALS)));
            const maxCollateralWei = BigInt(loan.collateral);
            
            // If this is a full repayment (within 1 wei of max), use exact loan collateral
            if (userInputWei >= maxCollateralWei - 1n) {
              return maxCollateralWei;
            }
            
            // For partial repayments, cap at actual loan collateral
            return userInputWei > maxCollateralWei ? maxCollateralWei : userInputWei;
          })(),
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
    value: loan ? BigInt(loan.borrowAmount) : undefined,
  });

  // Use the simulation result to get the exact repay amount and collateral used
  const exactRepayAmount = simulationResult?.result && Array.isArray(simulationResult.result) && simulationResult.result.length >= 2
    ? BigInt(loan?.borrowAmount || 0) - BigInt(simulationResult.result[1]?.amount || 0)
    : undefined;

  // Extract the exact collateral amount that was actually used in the simulation
  const exactCollateralUsed = simulationResult?.result && Array.isArray(simulationResult.result) && simulationResult.result.length >= 2
    ? BigInt(simulationResult.result[1]?.collateral || 0)
    : undefined;

  // Validate collateral input with precision to avoid rounding errors
  useEffect(() => {
    if (!loan || !collateralToReturn) {
      setCollateralError("");
      return;
    }

    const maxCollateralWei = BigInt(loan.collateral);
    const maxCollateralDisplay = Number(maxCollateralWei) / (10 ** NATIVE_TOKEN_DECIMALS);
    const inputCollateral = Number(collateralToReturn);

    if (inputCollateral > maxCollateralDisplay) {
      setCollateralError(`Cannot return more than ${maxCollateralDisplay.toString()} ${tokenSymbol}`);
    } else if (inputCollateral <= 0) {
      setCollateralError("Collateral amount must be greater than 0");
    } else {
      setCollateralError("");
    }
  }, [collateralToReturn, loan, tokenSymbol]);

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
      // Close dialog after success
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
    if (open && loan) {
      const maxCollateralWei = BigInt(loan.collateral);
      const maxCollateralDisplay = Number(maxCollateralWei) / (10 ** NATIVE_TOKEN_DECIMALS);
      setCollateralToReturn(maxCollateralDisplay.toString());
      // This will trigger full repayment detection
    }
    if (!open) {
      setRepayAmount("");
      setCollateralToReturn("");
      setRepayStatus("idle");
      setRepayTxHash(undefined);
      setCollateralError("");
    }
  }, [open, loan]);

  if (!loan) return null;

  const handleRepay = async () => {
    if (!loan || !userAddress || !repayLoanAsync) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing required data for repayment",
      });
      return;
    }

    try {
      setRepayStatus("waiting-signature");
      
      const loanIdBigInt = BigInt(loan.id);
      // Use the exact amount from simulation as maxRepayBorrowAmount
      const maxRepayBorrowAmount = exactRepayAmount && typeof exactRepayAmount === 'bigint' ? exactRepayAmount : BigInt(loan.borrowAmount);
      
      // Use precise conversion with safety check to never exceed loan collateral
      const simulationCollateral = (() => {
        const userInputWei = BigInt(Math.floor(Number(collateralToReturn) * (10 ** NATIVE_TOKEN_DECIMALS)));
        const maxCollateralWei = BigInt(loan.collateral);
        
        // If this is a full repayment (within 1 wei of max), use exact loan collateral
        if (userInputWei >= maxCollateralWei - 1n) {
          return maxCollateralWei;
        }
        
        // For partial repayments, cap at actual loan collateral
        return userInputWei > maxCollateralWei ? maxCollateralWei : userInputWei;
      })();
      
      const collateralCountToReturn = simulationCollateral;
      
      const beneficiary = userAddress as Address;
      
      // Default allowance (no permit2)
      const allowance = {
        sigDeadline: 0n,
        amount: 0n,
        expiration: 0,
        nonce: 0,
        signature: "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
      };

      const txHash = await repayLoanAsync({
        chainId: chainId as JBChainId,
        args: [
          loanIdBigInt,
          maxRepayBorrowAmount,
          collateralCountToReturn,
          beneficiary,
          allowance,
        ],
        value: maxRepayBorrowAmount,
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
                onChange={(e) => setCollateralToReturn(e.target.value)}
                placeholder="Enter collateral amount to return"
                className={collateralError ? "border-red-500" : ""}
              />
              {collateralError && (
                <p className="text-xs text-red-500 mt-1">
                  {collateralError}
                </p>
              )}
              
              {/* Percentage buttons */}
              <div className="flex gap-1 mt-4 flex-wrap">
                {[10, 25, 50, 75].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={async () => {
                      const collateralInTokens = Number(loan.collateral) / (10 ** NATIVE_TOKEN_DECIMALS);
                      const portion = collateralInTokens * (pct / 100);
                      setCollateralToReturn(portion.toString());
                    }}
                    className="h-8 px-3 text-xs text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100"
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const maxCollateralWei = BigInt(loan.collateral);
                    const maxCollateralDisplay = Number(maxCollateralWei) / (10 ** NATIVE_TOKEN_DECIMALS);
                    setCollateralToReturn(maxCollateralDisplay.toString());
                  }}
                  className="h-8 px-3 text-xs text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100"
                >
                  Max
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Label className="block text-gray-700 text-sm font-bold mb-1">
              Cost to repay: {exactRepayAmount && typeof exactRepayAmount === 'bigint' ? (Number(exactRepayAmount) / (10 ** NATIVE_TOKEN_DECIMALS)).toFixed(6) : (repayAmount || "0.00")} ETH
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
            {!isSimulating && !exactRepayAmount && repayAmount && (
              <p className="text-xs text-zinc-500 mt-1">
                Estimated cost (simulation in progress...)
              </p>
            )}
          </div>
          <div className="flex flex-col items-end pt-2">
            <ButtonWithWallet
              targetChainId={chainId as JBChainId}
              loading={isRepaying || repayStatus === "waiting-signature" || repayStatus === "pending"}
              onClick={handleRepay}
              disabled={!exactRepayAmount || Number(exactRepayAmount) <= 0 || !collateralToReturn || Number(collateralToReturn) <= 0 || !!collateralError}
            >
              Repay loan
            </ButtonWithWallet>
            {repayStatus !== "idle" && (
              <p className="text-sm text-zinc-600 mt-2">
                {repayStatus === "waiting-signature" && "Waiting for wallet confirmation..."}
                {repayStatus === "pending" && "Repayment pending..."}
                {repayStatus === "success" && "Repayment successful!"}
                {repayStatus === "error" && "Something went wrong during repayment."}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 