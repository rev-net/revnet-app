import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAccount, useWaitForTransactionReceipt, usePublicClient, useWalletClient } from "wagmi";
import { Address, erc20Abi } from "viem";
import {
  useWriteRevLoansRepayLoan,
  useSimulateRevLoansRepayLoan,
  useReadRevLoansLoanOf,
  revLoansAddress
} from "revnet-sdk";
import { JBChainId } from "juice-sdk-core";
import { useJBTokenContext, useJBChainId } from "juice-sdk-react";
import { formatTokenSymbol } from "@/lib/utils";
import { formatUnits, parseUnits } from "viem";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { getTokenSymbolFromAddress, getTokenConfigForChain } from "@/lib/tokenUtils";

export function RepayDialog({
  loanId,
  chainId,
  projectId,
  open,
  onOpenChange,
}: {
  loanId: string;
  chainId: number;
  projectId: bigint;
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
  const projectTokenDecimals = token?.data?.decimals ?? 18;
  const currentChainId = useJBChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  // Check allowance for non-ETH base tokens before simulation
  const [allowanceChecked, setAllowanceChecked] = useState(false);
  const [hasSufficientAllowance, setHasSufficientAllowance] = useState(true);
  const [allowanceError, setAllowanceError] = useState<string>("");
  
  // Fetch loan data first to get the project ID
  const { data: loanData, isLoading: isLoadingLoan } = useReadRevLoansLoanOf({
    chainId: chainId as JBChainId,
    args: [BigInt(loanId)],
  });

  // Get project data to find sucker group ID using the project ID
  const { data: projectData } = useBendystrawQuery(ProjectDocument, {
    chainId: Number(currentChainId),
    projectId: Number(projectId), // Use the passed project ID
  }, {
    enabled: !!currentChainId && !!projectId,
    pollInterval: 10000
  });
  
  const suckerGroupId = projectData?.project?.suckerGroupId;
  
  // Get sucker group data for token mapping
  const { data: suckerGroupData } = useBendystrawQuery(SuckerGroupDocument, {
    id: suckerGroupId ?? "",
  }, {
    enabled: !!suckerGroupId,
    pollInterval: 10000
  });
  
  // Get token configuration for this loan's chain
  const chainTokenConfig = getTokenConfigForChain(suckerGroupData, chainId);
  const baseTokenSymbol = getTokenSymbolFromAddress(chainTokenConfig.token);
  const baseTokenDecimals = chainTokenConfig.decimals;
  
  // Repay loan hook
  const { writeContractAsync: repayLoanAsync, isPending: isRepaying } = useWriteRevLoansRepayLoan();

  // Transaction status tracking
  const { isLoading: isRepayTxLoading, isSuccess: isRepaySuccess } = useWaitForTransactionReceipt({
    hash: repayTxHash,
  });

  // ===== HELPER FUNCTIONS =====
  const formatCollateralAmount = (amountWei: bigint) => {
    const amountTokens = formatUnits(amountWei, projectTokenDecimals);
    return Number(amountTokens).toFixed(6).replace(/\.?0+$/, "");
  };

  const calculateCollateralAmount = (input: string, maxCollateral: bigint): bigint => {
    try {
      const userInputWei = parseUnits(input, projectTokenDecimals);
      return userInputWei >= maxCollateral ? maxCollateral : userInputWei;
    } catch (error) {
      return 0n;
    }
  };

  // Simulation arguments - only run if allowance is sufficient for non-ETH tokens
  const shouldRunSimulation = !isLoadingLoan && 
    loanData && 
    collateralToReturn && 
    userAddress && 
    allowanceChecked && // Ensure allowance check has completed
    (baseTokenSymbol === "ETH" || hasSufficientAllowance);
    
  const simulationArgs = shouldRunSimulation
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



  // Always call the hook, but pass undefined args when we shouldn't simulate
  const {
    data: simulationResult,
    isLoading: isSimulating,
    error: simulationError,
  } = useSimulateRevLoansRepayLoan({
    chainId: chainId as JBChainId,
    args: shouldRunSimulation && simulationArgs ? (simulationArgs as unknown as readonly [bigint, bigint, bigint, `0x${string}`, { sigDeadline: bigint; amount: bigint; expiration: number; nonce: number; signature: `0x${string}`; }]) : undefined,
    value: baseTokenSymbol === "ETH" ? loanData?.amount : 0n, // Only send ETH value for ETH-based projects
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

  // ===== ALLOWANCE CHECKING =====
  // Check allowance for non-ETH base tokens
  useEffect(() => {
    const checkAllowance = async () => {
      if (!loanData || !userAddress || !publicClient || baseTokenSymbol === "ETH") {
        setAllowanceChecked(true);
        setHasSufficientAllowance(true);
        setAllowanceError("");
        return;
      }

      try {
        const baseTokenAddress = chainTokenConfig.token;
        const revLoansContractAddress = revLoansAddress[chainId as JBChainId];
        
        const allowance = await publicClient.readContract({
          address: baseTokenAddress,
          abi: erc20Abi,
          functionName: "allowance",
          args: [userAddress as Address, revLoansContractAddress as Address],
        });

        if (BigInt(allowance) < loanData.amount) {
          setHasSufficientAllowance(false);
          setAllowanceError(`To calculate your repayment cost, we need permission for this loan. You will not be charged until you confirm repayment.`);
        } else {
          setHasSufficientAllowance(true);
          setAllowanceError("");
        }
      } catch (error) {
        setAllowanceError("Error checking allowance. Please try again.");
        setHasSufficientAllowance(false);
      } finally {
        setAllowanceChecked(true);
      }
    };

    checkAllowance();
  }, [loanData, userAddress, publicClient, baseTokenSymbol, chainTokenConfig, chainId, baseTokenDecimals]);

  // ===== EFFECTS =====

  // Validate collateral input
  useEffect(() => {
    if (!loanData || !collateralToReturn) {
      setCollateralError("");
      return;
    }

    const maxCollateralDisplay = Number(formatUnits(loanData.collateral, projectTokenDecimals));
    const inputCollateral = Number(collateralToReturn);

    if (inputCollateral > maxCollateralDisplay) {
      setCollateralError(`Cannot return more than ${formatCollateralAmount(loanData.collateral)} ${tokenSymbol}`);
    } else if (inputCollateral <= 0) {
      setCollateralError("Collateral amount must be greater than 0");
    } else {
      setCollateralError("");
    }
  }, [collateralToReturn, loanData, tokenSymbol, projectTokenDecimals]);

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
    if (open && loanData && projectTokenDecimals) {
      const maxCollateralDisplay = formatUnits(loanData.collateral, projectTokenDecimals);
      setCollateralToReturn(maxCollateralDisplay);
    }
    if (!open) {
      setCollateralToReturn("");
      setRepayStatus("idle");
      setRepayTxHash(undefined);
      setCollateralError("");
    }
  }, [open, loanData, projectTokenDecimals]);

  // ===== EVENT HANDLERS =====
  const handleApproveAllowance = async () => {
    if (!loanData || !userAddress || !publicClient || !walletClient || baseTokenSymbol === "ETH") {
      return;
    }

    try {
      setRepayStatus("approving");
      const baseTokenAddress = chainTokenConfig.token;
      const revLoansContractAddress = revLoansAddress[chainId as JBChainId];
      
      const approveHash = await walletClient.writeContract({
        address: baseTokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [revLoansContractAddress as Address, loanData.amount],
      });
      
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      
      // Reset allowance check to trigger re-check
      setAllowanceChecked(false);
      setRepayStatus("idle");
      
      toast({
        title: "Approval Successful",
        description: "Token allowance approved. You can now proceed with repayment.",
      });
    } catch (error: any) {
      setRepayStatus("error");
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "An error occurred during approval",
      });
    }
  };

  const handleRepay = async () => {
    if (!loanData || !userAddress || !repayLoanAsync || !publicClient || !walletClient) {
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



      // Check allowance for USDC-based projects
      if (baseTokenSymbol !== "ETH") {
        const baseTokenAddress = chainTokenConfig.token;
        const revLoansContractAddress = revLoansAddress[chainId as JBChainId];
        
        const allowance = await publicClient.readContract({
          address: baseTokenAddress,
          abi: erc20Abi,
          functionName: "allowance",
          args: [userAddress as Address, revLoansContractAddress as Address],
        });

        if (BigInt(allowance) < maxRepayBorrowAmount) {
          setRepayStatus("approving");
          
          if (!walletClient) {
            throw new Error("Wallet client not available");
          }
          
          const approveHash = await walletClient.writeContract({
            address: baseTokenAddress,
            abi: erc20Abi,
            functionName: "approve",
            args: [revLoansContractAddress as Address, maxRepayBorrowAmount],
          });
          
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
          setRepayStatus("waiting-signature");
        }
      }

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
        value: baseTokenSymbol === "ETH" ? (exactRepayAmount || loanData?.amount) : 0n,
      });

      setRepayTxHash(txHash);
    } catch (error: any) {
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
              const collateralInTokens = Number(formatUnits(loanData.collateral, projectTokenDecimals));
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
            const maxCollateralDisplay = formatUnits(loanData.collateral, projectTokenDecimals);
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
      "approving": "Approving token allowance...",
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
  if (isLoadingLoan || (!allowanceChecked && baseTokenSymbol !== "ETH")) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Repay loan</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-zinc-700 space-y-4">
            <p>{isLoadingLoan ? "Loading loan data..." : "Checking token allowance..."}</p>
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
                  const maxValue = loanData ? Number(formatUnits(loanData.collateral, projectTokenDecimals)) : 0;
                  
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
                        <td className="font-semibold text-right">{formatUnits(loanData.amount, baseTokenDecimals)} {baseTokenSymbol}</td>
                      </tr>
                      <tr>
                        <td className="pr-4">Amount of collateral you want back ({(Number(collateralToReturn) / Number(formatUnits(loanData.collateral, projectTokenDecimals)) * 100).toFixed(1)}%):</td>
                        <td className="font-semibold text-right">{collateralToReturn} {tokenSymbol}</td>
                      </tr>
                      {!isSimulating && !simulationError && exactRepayAmount && (
                        <>
                          <tr>
                            <td className="pr-4">Amount to pay now:</td>
                            <td className="font-semibold text-right">{formatUnits(exactRepayAmount, baseTokenDecimals)} {baseTokenSymbol}</td>
                          </tr>
                          <tr>
                            <td className="pr-4">Amount rolled into new loan id:</td>
                            <td className="font-semibold text-right">{formatUnits(loanData.amount - exactRepayAmount, baseTokenDecimals)} {baseTokenSymbol}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
                {isSimulating && (
                  <p className="text-sm text-zinc-500 mt-2">Calculating exact amounts...</p>
                )}
                {simulationError && shouldRunSimulation && (
                  <p className="text-sm text-red-500 mt-2">Error: {simulationError.message}</p>
                )}
                {!isSimulating && !simulationError && !exactRepayAmount && !hasSufficientAllowance && baseTokenSymbol !== "ETH" && (
                  <p className="text-sm text-red-500 mt-2">Please approve token allowance to see exact repayment amounts</p>
                )}
                {!isSimulating && !simulationError && !exactRepayAmount && (hasSufficientAllowance || baseTokenSymbol === "ETH") && (
                  <p className="text-sm text-zinc-500 mt-2">Contract will calculate exact amounts</p>
                )}
              </div>
            )}
          </div>
                    {/* Allowance Error Display */}
                    {allowanceChecked && !hasSufficientAllowance && baseTokenSymbol !== "ETH" && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm text-red-700 font-medium mb-2">
                    Token Approval Required
                  </p>
                  <p className="text-sm text-red-600 mb-3">
                    {allowanceError}
                  </p>
                  <ButtonWithWallet
                    targetChainId={chainId as JBChainId}
                    loading={repayStatus === "approving"}
                    onClick={handleApproveAllowance}
                    variant="outline"
                    size="sm"
                  >
                    Approve {baseTokenSymbol}
                  </ButtonWithWallet>
                </div>
              </div>
            </div>
          )}
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
                !!collateralError ||
                (baseTokenSymbol !== "ETH" && !hasSufficientAllowance)
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