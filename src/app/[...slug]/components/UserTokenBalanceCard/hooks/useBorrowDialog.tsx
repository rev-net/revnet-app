import { useEffect, useState, useCallback } from "react";
import { useHasBorrowPermission } from "@/hooks/useHasBorrowPermission";
import { generateFeeData } from "@/lib/feeHelpers";
import { toWei } from "@/lib/utils";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useWalletClient } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { formatUnits, parseUnits } from "viem";

import {
  JBChainId,
  jbPermissionsAbi,
  NATIVE_TOKEN_DECIMALS,
  JB_TOKEN_DECIMALS
} from "juice-sdk-core";
import {
  useJBContractContext,
  useSuckersUserTokenBalance,
  useJBTokenContext,
} from "juice-sdk-react";
import {
  useReadRevLoansBorrowableAmountFrom,
  useReadRevDeployerPermissions,
  useWriteRevLoansBorrowFrom,
  revLoansAddress,
  useReadRevDeployerFee,
  useReadRevLoansRevPrepaidFeePercent,
  useWriteRevLoansRepayLoan,
  useWriteRevLoansReallocateCollateralFromLoan,
} from "revnet-sdk";

// Types
type BorrowState =
  | "idle"
  | "checking"
  | "granting-permission"
  | "permission-granted"
  | "waiting-signature"
  | "pending"
  | "success"
  | "error-permission-denied"
  | "error-loan-canceled"
  | "error"
  | "reallocation-pending";

type RepayState = "idle" | "waiting-signature" | "pending" | "success" | "error";

interface UseBorrowDialogProps {
  projectId: bigint;
  tokenSymbol: string;
  selectedLoan?: any;
  defaultTab?: "borrow" | "repay";
}

export function useBorrowDialog({
  projectId,
  tokenSymbol,
  selectedLoan,
  defaultTab,
}: UseBorrowDialogProps) {
  // ===== STATE VARIABLES =====
  const ETH_CURRENCY_ID = 61166n;
  // ===== STATE VARIABLES =====
  // Dialog and UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"borrow" | "repay">(defaultTab ?? "borrow");
  const [showChart, setShowChart] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showOtherCollateral, setShowOtherCollateral] = useState(false);
  const [showLoanDetailsTable, setShowLoanDetailsTable] = useState(true);
  const [showRefinanceLoanDetailsTable, setShowRefinanceLoanDetailsTable] = useState(true);
  const [showingWaitingMessage, setShowingWaitingMessage] = useState(false);

  // Borrow-related state
  const [borrowStatus, setBorrowStatus] = useState<BorrowState>("idle");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>(undefined);
  const [cashOutChainId, setCashOutChainId] = useState<string>();
  const [prepaidPercent, setPrepaidPercent] = useState("2.5");
  const [nativeToWallet, setNativeToWallet] = useState(0);
  const [grossBorrowedNative, setGrossBorrowedNative] = useState(0);
  const [internalSelectedLoan, setInternalSelectedLoan] = useState<any | null>(selectedLoan ?? null);

  // Repay-related state
  const [repayStatus, setRepayStatus] = useState<RepayState>("idle");
  const [repayAmount, setRepayAmount] = useState("");
  const [collateralToReturn, setCollateralToReturn] = useState("");
  const [repayTxHash, setRepayTxHash] = useState<`0x${string}` | undefined>();

  const { toast } = useToast();

  // ===== HOOKS AND CONTEXT =====
  // Context hooks
  const { token } = useJBTokenContext();
  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  
  // Account and wallet hooks
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  // Data hooks
  const { data: balances } = useSuckersUserTokenBalance();
  const { data: resolvedPermissionsAddress } = useReadRevDeployerPermissions({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
  });

  // Fee-related hooks
  const { data: revDeployerFee } = useReadRevDeployerFee({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
  });
  const { data: revPrepaidFeePercent } = useReadRevLoansRevPrepaidFeePercent({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
  });

  // ===== DERIVED VALUES (needed by callbacks) =====
  const projectTokenDecimals = token?.data?.decimals ?? JB_TOKEN_DECIMALS;
  
  const userProjectTokenBalance = balances?.find(
    (b) =>
      BigInt(b.projectId) === projectId &&
      b.chainId === Number(cashOutChainId)
  )?.balance.value ?? 0n;
  
  const selectedBalance = balances?.find(
    (b) => b.chainId === Number(cashOutChainId)
  );

  // Calculate total fixed fees from contract values (in basis points)
  const totalFixedFees = (revDeployerFee ? Number(revDeployerFee) : 0) + 
                        (revPrepaidFeePercent ? Number(revPrepaidFeePercent) : 0);

  // Used for estimating how much Native could be borrowed if both
  // the existing loan's collateral and new collateral were combined into one.
  const totalReallocationCollateral =
    internalSelectedLoan && collateralAmount
      ? BigInt(internalSelectedLoan.collateral) + parseUnits(collateralAmount, projectTokenDecimals)
      : undefined;

  // Collateral to return logic for repay tab
  const remainingCollateral = internalSelectedLoan && collateralToReturn
    ? BigInt(internalSelectedLoan.collateral) - parseUnits(collateralToReturn, projectTokenDecimals)
    : undefined;

  // Borrow-related hooks
  const {
    data: borrowableAmountRaw,
    error: borrowableError,
    isLoading: isBorrowableLoading,
  } = useReadRevLoansBorrowableAmountFrom({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
    args: cashOutChainId
      ? [
          projectId,
          userProjectTokenBalance,
          BigInt(NATIVE_TOKEN_DECIMALS),
          BigInt(ETH_CURRENCY_ID),
        ] as const
      : undefined,
  });

  const { data: estimatedBorrowFromInputOnly } = useReadRevLoansBorrowableAmountFrom({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
    args: collateralAmount
      ? [
          projectId,
          parseUnits(collateralAmount, projectTokenDecimals),
          BigInt(NATIVE_TOKEN_DECIMALS),
          BigInt(ETH_CURRENCY_ID),
        ]
      : undefined,
  });

  // Reallocation-related hooks
  const { data: selectedLoanReallocAmount } = useReadRevLoansBorrowableAmountFrom({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
    args: totalReallocationCollateral
      ? [
          projectId,
          totalReallocationCollateral,
          BigInt(NATIVE_TOKEN_DECIMALS),
          BigInt(ETH_CURRENCY_ID),
        ]
      : undefined,
  });

  const { data: currentBorrowableOnSelectedCollateral } = useReadRevLoansBorrowableAmountFrom({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
    args: internalSelectedLoan
      ? [
          projectId,
          BigInt(internalSelectedLoan.collateral),
          BigInt(NATIVE_TOKEN_DECIMALS),
          BigInt(ETH_CURRENCY_ID),
        ]
      : undefined,
  });

  // Repay-related hooks
  const {
    data: estimatedRepayAmountForCollateral,
    isLoading: isEstimatingRepayment,
  } = useReadRevLoansBorrowableAmountFrom({
    chainId: internalSelectedLoan?.chainId,
    args: internalSelectedLoan
      ? [
          projectId,
          BigInt(internalSelectedLoan.collateral),
          BigInt(JB_TOKEN_DECIMALS), // TODO confirm this is correct
          BigInt(ETH_CURRENCY_ID),
        ]
      : undefined,
  });

  const {
    data: estimatedNewBorrowableAmount,
  } = useReadRevLoansBorrowableAmountFrom({
    chainId: internalSelectedLoan?.chainId,
    args:
      internalSelectedLoan && remainingCollateral !== undefined
        ? [
            projectId,
            remainingCollateral,
            BigInt(NATIVE_TOKEN_DECIMALS),
            BigInt(ETH_CURRENCY_ID),
          ]
        : undefined,
  });

  // Transaction hooks
  const {
    writeContract,
    isPending: isWriteLoading,
    data,
  } = useWriteRevLoansBorrowFrom();

  const {
    writeContractAsync: reallocateCollateralAsync,
    isPending: isReallocating,
    data: reallocationTxHash,
  } = useWriteRevLoansReallocateCollateralFromLoan();

  const { writeContractAsync: repayLoanAsync, isPending: isRepaying } = useWriteRevLoansRepayLoan();

  // Transaction status hooks
  const txHash = data;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { isLoading: isReallocationTxLoading, isSuccess: isReallocationSuccess } = useWaitForTransactionReceipt({
    hash: reallocationTxHash,
  });

  const { isLoading: isRepayTxLoading, isSuccess: isRepaySuccess } = useWaitForTransactionReceipt({
    hash: repayTxHash,
  });

  // Permission hook
  const userHasPermission = useHasBorrowPermission({
    address: address as `0x${string}`,
    projectId,
    chainId: cashOutChainId ? Number(cashOutChainId) : undefined,
    resolvedPermissionsAddress: resolvedPermissionsAddress as `0x${string}`,
    skip: false,
  });

  // Additional derived values
  const netAvailableToBorrow =
    selectedTab === "borrow" && selectedLoanReallocAmount !== undefined && internalSelectedLoan
      ? selectedLoanReallocAmount - BigInt(internalSelectedLoan.borrowAmount)
      : 0n;

  const isOvercollateralized =
    selectedLoanReallocAmount !== undefined &&
    BigInt(internalSelectedLoan?.borrowAmount ?? 0) < selectedLoanReallocAmount;

  const extraCollateralBuffer = isOvercollateralized
    ? selectedLoanReallocAmount - BigInt(internalSelectedLoan?.borrowAmount ?? 0)
    : 0n;

  const collateralHeadroom =
    currentBorrowableOnSelectedCollateral !== undefined && internalSelectedLoan
      ? currentBorrowableOnSelectedCollateral - BigInt(internalSelectedLoan.borrowAmount)
      : 0n;

  // Calculate borrowable amount for just the new loan (headroom + additional collateral)
  const newLoanCollateral = collateralHeadroom + (collateralAmount ? toWei(collateralAmount) : 0n);
  const { data: newLoanBorrowableAmount } = useReadRevLoansBorrowableAmountFrom({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
    args: newLoanCollateral > 0n
      ? [
          projectId,
          newLoanCollateral,
          BigInt(NATIVE_TOKEN_DECIMALS),
          BigInt(ETH_CURRENCY_ID),
        ]
      : undefined,
  });

  const collateralCountToTransfer = internalSelectedLoan && currentBorrowableOnSelectedCollateral
    ? BigInt(
        Math.floor(
          Number(collateralHeadroom) /
            (Number(currentBorrowableOnSelectedCollateral) / Number(internalSelectedLoan.collateral))
        )
      )
    : BigInt(0);

  // For reallocation, use the total borrowable amount for combined collateral
  const borrowAmountForFeeCalculation = internalSelectedLoan && selectedLoanReallocAmount
    ? Number(formatUnits(selectedLoanReallocAmount, NATIVE_TOKEN_DECIMALS))
    : grossBorrowedNative;
    
  const feeData = generateFeeData({ 
    grossBorrowedEth: borrowAmountForFeeCalculation, 
    prepaidPercent 
  });

  // Fee calculation for the new loan simulation (not the combined total)
  const newLoanFeeData = newLoanBorrowableAmount 
    ? generateFeeData({ 
        grossBorrowedEth: Number(formatUnits(newLoanBorrowableAmount, NATIVE_TOKEN_DECIMALS)), 
        prepaidPercent 
      })
    : feeData;

  // Calculate prepaidMonths using new prepaidDuration logic
  const monthsToPrepay = (parseFloat(prepaidPercent) / 50) * 120;
  const prepaidMonths = monthsToPrepay;
  const displayYears = Math.floor(prepaidMonths / 12);
  const displayMonths = Math.round(prepaidMonths % 12);

  const loading = isWriteLoading || isTxLoading;

  // ===== CALLBACK HOOKS (must be before any conditional logic) =====
  // Reset internal state when dialog closes or set tab on open
  const handleOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      setSelectedTab(defaultTab ?? "borrow");
    } else {
      setCollateralAmount("");
      setPrepaidPercent("2.5");
      setNativeToWallet(0);
      setBorrowStatus("idle");
      setCashOutChainId(undefined);
      setRepayAmount("");
      setCollateralToReturn("");
      setInternalSelectedLoan(null);
      setShowLoanDetailsTable(true);
      setShowRefinanceLoanDetailsTable(true);
      setShowOtherCollateral(false);
      setSelectedChainId(undefined);
    }
  }, [defaultTab]);

  const handleChainSelection = useCallback((chainId: number) => {
    const selected = balances?.find((b) => b.chainId === chainId);
    const collateral = selected ? formatUnits(selected.balance.value, projectTokenDecimals) : "0";
    setSelectedChainId(chainId);
    setCashOutChainId(chainId.toString());
    setCollateralAmount(collateral);
    setInternalSelectedLoan(null);
  }, [balances, projectTokenDecimals]);

  const handleLoanSelection = useCallback((loanId: string, loanData: any) => {
    console.log("Loan selection data:", loanData);
    setInternalSelectedLoan(loanData);
    // Set the cashOutChainId based on the loan's chain
    if (loanData?.chainId) {
      setCashOutChainId(loanData.chainId.toString());
    } else if (loanData?.chain) {
      setCashOutChainId(loanData.chain.toString());
    } else {
      console.warn("No chain information found in loan data:", loanData);
    }
  }, []);

  const handleBorrow = useCallback(async () => {
    if (internalSelectedLoan && collateralAmount !== undefined && !isNaN(Number(collateralAmount))) {
      // Reallocation path - allow 0 additional capital
      if (
        !internalSelectedLoan ||
        !primaryNativeTerminal?.data ||
        !cashOutChainId ||
        !address ||
        !walletClient
      ) {
        console.error("Missing data for reallocation:", {
          internalSelectedLoan: !!internalSelectedLoan,
          primaryNativeTerminal: !!primaryNativeTerminal?.data,
          cashOutChainId: !!cashOutChainId,
          address: !!address,
          walletClient: !!walletClient,
          internalSelectedLoanData: internalSelectedLoan,
          primaryNativeTerminalData: primaryNativeTerminal?.data,
          cashOutChainIdValue: cashOutChainId,
          addressValue: address,
        });
        setBorrowStatus("error");
        return;
      }

      // Fix the parameter calculations based on the guidance:
      // Calculate the safe transfer amount to avoid under-collateralization
      const principalCover = BigInt(internalSelectedLoan.borrowAmount);
      const maxRemovable = currentBorrowableOnSelectedCollateral ? 
        currentBorrowableOnSelectedCollateral - principalCover : 0n;
      
      // Only transfer the safe amount (or less)
      const collateralCountToTransfer = maxRemovable > 0n ? maxRemovable : 0n;
      
      // collateralCountToAdd: The amount of collateral to add to the new loan (can be 0)
      const collateralCountToAdd = toWei(collateralAmount || "0");
      
      // feePercent: The fee percent for the new loan
      const feePercent = BigInt(Math.round(parseFloat(prepaidPercent) * 10));
      
      // Validate that the reallocation won't result in a borrow amount less than the original
      if (selectedLoanReallocAmount !== undefined && selectedLoanReallocAmount < BigInt(internalSelectedLoan.borrowAmount)) {
        console.error("Reallocation would result in borrow amount less than original:", {
          selectedLoanReallocAmount: selectedLoanReallocAmount.toString(),
          originalBorrowAmount: internalSelectedLoan.borrowAmount,
        });
        setBorrowStatus("error");
        toast({
          variant: "destructive",
          title: "Invalid Reallocation",
          description: "Adding this collateral would result in a borrow amount less than your original loan. Please add more collateral.",
        });
        return;
      }
      
      // Set minBorrowAmount to 0 as per the guidance
      const minBorrowAmount = 0n;

      try {
        setBorrowStatus("waiting-signature");

        console.log("Reallocation transaction args:", {
          chainId: Number(cashOutChainId) as JBChainId,
          loanId: internalSelectedLoan.id,
          collateralCountToTransfer: collateralCountToTransfer.toString(),
          terminal: primaryNativeTerminal.data as `0x${string}`,
          minBorrowAmount: minBorrowAmount.toString(),
          collateralCountToAdd: collateralCountToAdd.toString(),
          address: address as `0x${string}`,
          feePercent: feePercent.toString(),
        });

        await reallocateCollateralAsync({
          chainId: Number(cashOutChainId) as JBChainId,
          args: [
            internalSelectedLoan.id,
            collateralCountToTransfer,
            {
              token: "0x000000000000000000000000000000000000EEEe",
              terminal: primaryNativeTerminal.data as `0x${string}`,
            },
            minBorrowAmount,
            collateralCountToAdd,
            address as `0x${string}`,
            feePercent,
          ],
        });
      } catch (err) {
        console.error("❌ Reallocation TX failed:", err);
        setBorrowStatus("error");
        toast({
          variant: "destructive",
          title: "Reallocation Failed",
          description: err instanceof Error ? err.message : "An error occurred during loan adjustment",
        });
      }
    } else {
      // Standard borrow path
      try {
        setBorrowStatus("checking");

        if (
          !walletClient ||
          !primaryNativeTerminal?.data ||
          !address ||
          !borrowableAmountRaw ||
          !resolvedPermissionsAddress
        ) {
          console.error("Missing required data");
          setBorrowStatus("error");
          return;
        }

        const feeBasisPoints = Math.round(parseFloat(prepaidPercent) * 10);
        if (!userHasPermission) {
          setBorrowStatus("granting-permission");
          try {
            await walletClient.writeContract({
              account: address,
              address: resolvedPermissionsAddress as `0x${string}`,
              abi: jbPermissionsAbi,
              functionName: "setPermissionsFor",
              args: [
                address as `0x${string}`,
                {
                  operator: revLoansAddress[Number(cashOutChainId) as JBChainId],
                  projectId,
                  permissionIds: [1],
                },
              ],
            });
            setBorrowStatus("permission-granted");
          } catch (err) {
            setBorrowStatus("error-permission-denied");
            toast({
              variant: "destructive",
              title: "Permission Denied",
              description: "Permission was not granted. Please approve to proceed.",
            });
            setTimeout(() => setBorrowStatus("idle"), 5000);
            return;
          }
        } else {
          setBorrowStatus("permission-granted");
        }

        const collateralBigInt = toWei(collateralAmount);
        const args = [
          projectId,
          {
            token: "0x000000000000000000000000000000000000EEEe",
            terminal: primaryNativeTerminal.data as `0x${string}`,
          },
          0n,
          collateralBigInt,
          address as `0x${string}`,
          BigInt(feeBasisPoints),
        ] as const;

        if (!writeContract) {
          console.error("writeContract is not available");
          setBorrowStatus("error");
          return;
        }

        try {
          setBorrowStatus("waiting-signature");
          await writeContract({
            chainId: Number(cashOutChainId) as JBChainId,
            args,
          });
        } catch (err) {
          console.warn("User rejected or tx failed", err);
          setBorrowStatus("error-loan-canceled");
          toast({
            variant: "destructive",
            title: "Transaction Cancelled",
            description: "Loan creation was cancelled by user",
          });
          setTimeout(() => setBorrowStatus("idle"), 5000);
          return;
        }
      } catch (err) {
        console.error(err);
        setBorrowStatus("error");
        toast({
          variant: "destructive",
          title: "Borrow Failed",
          description: err instanceof Error ? err.message : "An error occurred during borrowing",
        });
      }
    }
  }, [
    internalSelectedLoan,
    collateralAmount,
    primaryNativeTerminal?.data,
    cashOutChainId,
    address,
    walletClient,
    currentBorrowableOnSelectedCollateral,
    selectedLoanReallocAmount,
    prepaidPercent,
    reallocateCollateralAsync,
    toast,
    userHasPermission,
    borrowableAmountRaw,
    resolvedPermissionsAddress,
    writeContract,
    projectId,
  ]);

  // ===== EFFECTS =====
  // Sync defaultTab with selectedTab if defaultTab changes
  useEffect(() => {
    if (defaultTab && defaultTab !== selectedTab) {
      setSelectedTab(defaultTab);
    }
  }, [defaultTab, selectedTab]);

  // Sync internalSelectedLoan with selectedLoan prop
  useEffect(() => {
    setInternalSelectedLoan(selectedLoan ?? null);
    // Also set the cashOutChainId based on the loan's chain
    if (selectedLoan?.chainId) {
      setCashOutChainId(selectedLoan.chainId.toString());
    } else if (selectedLoan?.chain) {
      setCashOutChainId(selectedLoan.chain.toString());
    }
  }, [selectedLoan]);

  // Check if selected chain has no borrowable amount and auto-select another chain
  // Only run this effect if we don't have a selectedLoan (for new loans, not reallocation)
  useEffect(() => {
    if (!selectedLoan && selectedChainId && balances && borrowableAmountRaw !== undefined && balances.length > 0) {
      if (borrowableAmountRaw === 0n) {
        const alternativeChain = balances.find(b => 
          b.chainId !== selectedChainId && 
          b.balance.value > 0n
        );
        if (alternativeChain) {
          const collateral = Number(formatUnits(alternativeChain.balance.value, projectTokenDecimals));
          setSelectedChainId(alternativeChain.chainId);
          setCashOutChainId(alternativeChain.chainId.toString());
          setCollateralAmount(collateral.toFixed(6));
        }
      }
    }
  }, [selectedLoan, selectedChainId, balances, borrowableAmountRaw, projectTokenDecimals]);

  // Handle reallocation pending status
  useEffect(() => {
    if (isReallocating) {
      setBorrowStatus("reallocation-pending");
    }
  }, [isReallocating]);

  // Transaction status effects
  useEffect(() => {
    if (!txHash && !reallocationTxHash) return;

    if (isTxLoading || isReallocationTxLoading) {
      setBorrowStatus("pending");
    } else if (isSuccess || isReallocationSuccess) {
      setBorrowStatus("success");
      const currentTxHash = txHash || reallocationTxHash;
      toast({
        title: "Success",
        description: isReallocationSuccess ? "Loan adjusted successfully!" : "Loan created successfully!",
      });
      setTimeout(() => {
        handleOpenChange(false);
      }, 3000);
    } else {
      setBorrowStatus("error");
    }
  }, [txHash, reallocationTxHash, isTxLoading, isReallocationTxLoading, isSuccess, isReallocationSuccess, toast, handleOpenChange]);

  // Calculate native to wallet and gross borrowed
  useEffect(() => {
    if (!collateralAmount || isNaN(Number(collateralAmount))) {
      setNativeToWallet(0);
      setGrossBorrowedNative(0);
      return;
    }
    const percent = Number(formatUnits(parseUnits(collateralAmount, projectTokenDecimals), projectTokenDecimals)) / Number(formatUnits(userProjectTokenBalance, projectTokenDecimals));
    const estimatedRaw = borrowableAmountRaw ? Number(formatUnits(borrowableAmountRaw, NATIVE_TOKEN_DECIMALS)) : 0;
    const adjusted = estimatedRaw * percent;
    const afterNetworkFee = adjusted * (1 - (totalFixedFees / 1000));
    setNativeToWallet(afterNetworkFee);
    setGrossBorrowedNative(adjusted);
  }, [collateralAmount, userProjectTokenBalance, borrowableAmountRaw, totalFixedFees, projectTokenDecimals]);

  // Repay status effects
  useEffect(() => {
    if (isRepayTxLoading) {
      setRepayStatus("pending");
    } else if (isRepaySuccess) {
      setRepayStatus("success");
    }
  }, [isRepayTxLoading, isRepaySuccess]);

  useEffect(() => {
    if (repayStatus === "success" || repayStatus === "error") {
      const timeout = setTimeout(() => setRepayStatus("idle"), 5000);
      return () => clearTimeout(timeout);
    }
  }, [repayStatus]);

  // Borrow status effects
  useEffect(() => {
    if (borrowStatus === "waiting-signature") {
      const timeout = setTimeout(() => setShowingWaitingMessage(true), 250);
      return () => clearTimeout(timeout);
    } else {
      setShowingWaitingMessage(false);
    }
  }, [borrowStatus]);

  useEffect(() => {
    if (["success", "error", "error-permission-denied", "error-loan-canceled"].includes(borrowStatus)) {
      const timeout = setTimeout(() => setBorrowStatus("idle"), 5000);
      return () => clearTimeout(timeout);
    }
  }, [borrowStatus]);

  // Tab-related effects - COMBINED into one effect
  useEffect(() => {
    setShowLoanDetailsTable(selectedTab === "repay");
  }, [selectedTab]);

  // Recalculate repayAmount when collateralToReturn, estimatedNewBorrowableAmount, or selectedLoan changes
  useEffect(() => {
    if (!internalSelectedLoan || !collateralToReturn || estimatedNewBorrowableAmount === undefined) return;

    const correctedBorrowAmount = BigInt(internalSelectedLoan.borrowAmount);
    const repayAmountWei = correctedBorrowAmount - estimatedNewBorrowableAmount;
    setRepayAmount(formatUnits(repayAmountWei, NATIVE_TOKEN_DECIMALS));
  }, [collateralToReturn, estimatedNewBorrowableAmount, internalSelectedLoan]);

  // ===== RETURN VALUES =====
  return {
    // State
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

    // Derived values
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
    newLoanFeeData,
    displayYears,
    displayMonths,
    estimatedBorrowFromInputOnly,
    selectedLoanReallocAmount,
    currentBorrowableOnSelectedCollateral,
    estimatedRepayAmountForCollateral,
    isEstimatingRepayment,
    estimatedNewBorrowableAmount,
    newLoanBorrowableAmount,

    // Actions
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
    
    // Additional exports needed by component
    balances,
    primaryNativeTerminal,
    address,
    setSelectedChainId,
    setCashOutChainId,
  };
}
