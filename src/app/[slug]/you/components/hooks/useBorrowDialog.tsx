import { useToast } from "@/components/ui/use-toast";
import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { useHasBorrowPermission } from "@/hooks/useHasBorrowPermission";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { generateFeeData } from "@/lib/feeHelpers";
import { getTokenConfigForChain, getTokenSymbolFromAddress } from "@/lib/tokenUtils";
import { formatWalletError } from "@/lib/utils";
import {
  getRevnetLoanContract,
  JB_TOKEN_DECIMALS,
  JBChainId,
  jbPermissionsAbi,
  NATIVE_TOKEN_DECIMALS,
  revDeployerAbi,
  revLoansAbi,
  RevnetCoreContracts,
} from "juice-sdk-core";
import {
  useBendystrawQuery,
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import { useCallback, useEffect, useState } from "react";
import { Address, erc20Abi, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from "wagmi";

// Types
type BorrowState =
  | "idle"
  | "checking"
  | "granting-permission"
  | "permission-granted"
  | "approving"
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
  const ETH_CURRENCY_ID = 1n;
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
  const [internalSelectedLoan, setInternalSelectedLoan] = useState<any | null>(
    selectedLoan ?? null,
  );

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
    contractAddress,
    version,
  } = useJBContractContext();

  const chainId = useJBChainId();

  // Account and wallet hooks
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // ===== PHASE 1: BASE TOKEN CONTEXT =====

  // Get base token information
  const baseToken = useProjectBaseToken();

  // Get sucker group data for token mapping
  const { data: projectData, isLoading: projectLoading } = useBendystrawQuery(
    ProjectDocument,
    {
      chainId: Number(chainId),
      projectId: Number(projectId),
      version,
    },
    {
      enabled: !!chainId && !!projectId,
      pollInterval: 10000,
    },
  );
  const suckerGroupId = projectData?.project?.suckerGroupId;

  const { data: suckerGroupData, isLoading: suckerGroupLoading } = useBendystrawQuery(
    SuckerGroupDocument,
    {
      id: suckerGroupId ?? "",
    },
    {
      enabled: !!suckerGroupId,
      pollInterval: 10000,
    },
  );

  // ===== PHASE 1: TOKEN RESOLUTION FUNCTION =====
  // Get the correct token configuration for a specific chain
  const tokenConfigForChain = useCallback(
    (chainId: string | number) => {
      return getTokenConfigForChain(suckerGroupData, Number(chainId));
    },
    [suckerGroupData],
  );

  // Data hooks
  const { data: balances } = useSuckersUserTokenBalance();
  const { data: resolvedPermissionsAddress } = useReadContract({
    abi: revDeployerAbi,
    functionName: "PERMISSIONS",
    address: contractAddress(RevnetCoreContracts.REVDeployer),
    chainId: cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
  });

  // Fee-related hooks
  const { data: revDeployerFee } = useReadContract({
    abi: revDeployerAbi,
    functionName: "FEE",
    address: contractAddress(RevnetCoreContracts.REVDeployer),
    chainId: cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
  });

  const { data: revPrepaidFeePercent } = useReadContract({
    abi: revLoansAbi,
    functionName: "REV_PREPAID_FEE_PERCENT",
    address: getRevnetLoanContract(
      version,
      cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    ),
    chainId: cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
  });

  // ===== DERIVED VALUES (needed by callbacks) =====
  const projectTokenDecimals = token?.data?.decimals ?? JB_TOKEN_DECIMALS;

  const selectedBalance = balances?.find((b) => b.chainId === Number(cashOutChainId));

  const userProjectTokenBalance = selectedBalance?.balance.value ?? 0n;

  // Dynamically determine the correct projectId based on the selected chain
  const effectiveProjectId = selectedBalance?.projectId
    ? BigInt(selectedBalance.projectId)
    : projectId;

  // Calculate total fixed fees from contract values (in basis points)
  const totalFixedFees =
    (revDeployerFee ? Number(revDeployerFee) : 0) +
    (revPrepaidFeePercent ? Number(revPrepaidFeePercent) : 0);

  // Used for estimating how much Native could be borrowed if both
  // the existing loan's collateral and new collateral were combined into one.
  const totalReallocationCollateral =
    internalSelectedLoan && collateralAmount
      ? BigInt(internalSelectedLoan.collateral) + parseUnits(collateralAmount, projectTokenDecimals)
      : undefined;

  // Collateral to return logic for repay tab
  const remainingCollateral =
    internalSelectedLoan && collateralToReturn
      ? BigInt(internalSelectedLoan.collateral) -
        parseUnits(collateralToReturn, projectTokenDecimals)
      : undefined;

  // ===== PHASE 2: UPDATE CONTRACT CALLS =====

  // Get token configuration for the selected chain
  const selectedChainTokenConfig = cashOutChainId
    ? tokenConfigForChain(Number(cashOutChainId))
    : null;

  // Borrow-related hooks
  const {
    data: borrowableAmountRaw,
    error: borrowableError,
    isLoading: isBorrowableLoading,
  } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: getRevnetLoanContract(
      version,
      cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    ),
    chainId: cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    args:
      cashOutChainId && selectedChainTokenConfig
        ? ([
            effectiveProjectId,
            userProjectTokenBalance,
            BigInt(selectedChainTokenConfig.decimals),
            BigInt(selectedChainTokenConfig.currency),
          ] as const)
        : undefined,
  });

  const { data: estimatedBorrowFromInputOnly } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: getRevnetLoanContract(
      version,
      cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    ),
    chainId: cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    args:
      collateralAmount && selectedChainTokenConfig
        ? [
            effectiveProjectId,
            parseUnits(collateralAmount, projectTokenDecimals),
            BigInt(selectedChainTokenConfig.decimals),
            BigInt(selectedChainTokenConfig.currency),
          ]
        : undefined,
  });

  // Reallocation-related hooks
  const { data: selectedLoanReallocAmount } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: getRevnetLoanContract(
      version,
      cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    ),
    chainId: cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    args:
      totalReallocationCollateral && selectedChainTokenConfig
        ? [
            // Use the same project ID as the loan table for consistency
            projectId,
            totalReallocationCollateral,
            BigInt(selectedChainTokenConfig.decimals),
            BigInt(selectedChainTokenConfig.currency),
          ]
        : undefined,
  });

  const { data: currentBorrowableOnSelectedCollateral } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: getRevnetLoanContract(
      version,
      cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    ),
    chainId: cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    args:
      internalSelectedLoan && selectedChainTokenConfig
        ? [
            // Use the same project ID as the loan table for consistency
            projectId,
            BigInt(internalSelectedLoan.collateral),
            BigInt(selectedChainTokenConfig.decimals),
            BigInt(selectedChainTokenConfig.currency),
          ]
        : undefined,
  });

  // Repay-related hooks
  const { data: estimatedRepayAmountForCollateral, isLoading: isEstimatingRepayment } =
    useReadContract({
      abi: revLoansAbi,
      functionName: "borrowableAmountFrom",
      address: getRevnetLoanContract(
        version,
        internalSelectedLoan?.chainId
          ? (Number(internalSelectedLoan.chainId) as JBChainId)
          : undefined,
      ),
      chainId: internalSelectedLoan?.chainId,
      args: internalSelectedLoan
        ? [
            effectiveProjectId,
            BigInt(internalSelectedLoan.collateral),
            BigInt(JB_TOKEN_DECIMALS), // TODO confirm this is correct
            BigInt(ETH_CURRENCY_ID), // TODO: This should also be dynamic
          ]
        : undefined,
    });

  const { data: estimatedNewBorrowableAmount } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: getRevnetLoanContract(
      version,
      internalSelectedLoan?.chainId
        ? (Number(internalSelectedLoan.chainId) as JBChainId)
        : undefined,
    ),
    chainId: internalSelectedLoan?.chainId,
    args:
      internalSelectedLoan && remainingCollateral !== undefined
        ? [
            effectiveProjectId,
            remainingCollateral,
            BigInt(NATIVE_TOKEN_DECIMALS), // TODO: This should also be dynamic
            BigInt(ETH_CURRENCY_ID), // TODO: This should also be dynamic
          ]
        : undefined,
  });

  // Transaction hooks
  const { writeContractAsync, isPending: isWriteLoading, data } = useWriteContract();

  const {
    writeContractAsync: reallocateCollateralAsync,
    isPending: isReallocating,
    data: reallocationTxHash,
  } = useWriteContract();

  // Transaction status hooks
  const txHash = data;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { isLoading: isReallocationTxLoading, isSuccess: isReallocationSuccess } =
    useWaitForTransactionReceipt({
      hash: reallocationTxHash,
    });

  const { isLoading: isRepayTxLoading, isSuccess: isRepaySuccess } = useWaitForTransactionReceipt({
    hash: repayTxHash,
  });

  // Permission hook
  const userHasPermission = useHasBorrowPermission({
    address: address as `0x${string}`,
    projectId: effectiveProjectId,
    chainId: cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    resolvedPermissionsAddress: resolvedPermissionsAddress as `0x${string}`,
    skip: false,
  });

  // Additional derived values in native tokens
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
  const newLoanCollateral =
    collateralHeadroom +
    (collateralAmount ? parseUnits(collateralAmount, projectTokenDecimals) : 0n);
  const { data: newLoanBorrowableAmount } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: getRevnetLoanContract(
      version,
      cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    ),
    chainId: cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
    args:
      newLoanCollateral > 0n && selectedChainTokenConfig
        ? [
            // Use the same project ID as the loan table for consistency
            projectId,
            newLoanCollateral,
            BigInt(selectedChainTokenConfig.decimals),
            BigInt(selectedChainTokenConfig.currency),
          ]
        : undefined,
  });

  const collateralCountToTransfer =
    internalSelectedLoan && currentBorrowableOnSelectedCollateral
      ? BigInt(
          Math.floor(
            Number(collateralHeadroom) /
              (Number(currentBorrowableOnSelectedCollateral) /
                Number(internalSelectedLoan.collateral)),
          ),
        )
      : BigInt(0);

  // ===== PHASE 4: UPDATE FEE CALCULATIONS =====

  // For reallocation, use the total borrowable amount for combined collateral
  const borrowAmountForFeeCalculation =
    internalSelectedLoan && selectedLoanReallocAmount
      ? Number(
          formatUnits(
            selectedLoanReallocAmount,
            selectedChainTokenConfig?.decimals || NATIVE_TOKEN_DECIMALS,
          ),
        )
      : grossBorrowedNative;

  const feeData = generateFeeData({
    grossBorrowedEth: borrowAmountForFeeCalculation,
    prepaidPercent,
  });

  // Fee calculation for the new loan simulation (not the combined total)
  const newLoanFeeData = newLoanBorrowableAmount
    ? generateFeeData({
        grossBorrowedEth: Number(
          formatUnits(
            newLoanBorrowableAmount,
            selectedChainTokenConfig?.decimals || NATIVE_TOKEN_DECIMALS,
          ),
        ),
        prepaidPercent,
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
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsDialogOpen(open);
      if (open) {
        setSelectedTab(defaultTab ?? "borrow");
      } else {
        // Clear all form state
        setCollateralAmount("");
        setPrepaidPercent("2.5");
        setNativeToWallet(0);
        setGrossBorrowedNative(0);

        // Clear all status states
        setBorrowStatus("idle");
        setRepayStatus("idle");
        setRepayAmount("");
        setCollateralToReturn("");
        setRepayTxHash(undefined);

        // Clear chain selection and loan data
        setCashOutChainId(undefined);
        setSelectedChainId(undefined);
        setInternalSelectedLoan(null);

        // Clear UI state
        setShowChart(false);
        setShowInfo(false);
        setShowOtherCollateral(false);
        setShowLoanDetailsTable(true);
        setShowRefinanceLoanDetailsTable(true);
        setShowingWaitingMessage(false);
      }
    },
    [defaultTab],
  );

  const handleChainSelection = useCallback(
    (chainId: number) => {
      const selected = balances?.find((b) => b.chainId === chainId);
      const collateral = selected ? formatUnits(selected.balance.value, projectTokenDecimals) : "0";
      setSelectedChainId(chainId);
      setCashOutChainId(chainId.toString());
      setCollateralAmount(collateral);
      setInternalSelectedLoan(null);
    },
    [balances, projectTokenDecimals],
  );

  const handleLoanSelection = useCallback((loanId: string, loanData: any) => {
    setInternalSelectedLoan(loanData);
    // Set the cashOutChainId based on the loan's chain
    if (loanData?.chainId) {
      setCashOutChainId(loanData.chainId.toString());
    } else if (loanData?.chain) {
      setCashOutChainId(loanData.chain.toString());
    }
  }, []);

  const handleBorrow = useCallback(async () => {
    // Get token configuration for the selected chain
    const selectedChainTokenConfig = cashOutChainId ? tokenConfigForChain(cashOutChainId) : null;

    // Validate that we have token configuration for the selected chain
    if (!selectedChainTokenConfig) {
      setBorrowStatus("error");
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Unable to determine token configuration for the selected chain.",
      });
      return;
    }

    if (
      internalSelectedLoan &&
      collateralAmount !== undefined &&
      !isNaN(Number(collateralAmount))
    ) {
      // Reallocation path - allow 0 additional capital
      if (
        !internalSelectedLoan ||
        !primaryNativeTerminal?.data ||
        !cashOutChainId ||
        !address ||
        !walletClient
      ) {
        setBorrowStatus("error");
        return;
      }

      // Fix the parameter calculations based on the guidance:
      // Calculate the safe transfer amount to avoid under-collateralization
      const principalCover = BigInt(internalSelectedLoan.borrowAmount);
      const maxRemovable = currentBorrowableOnSelectedCollateral
        ? currentBorrowableOnSelectedCollateral - principalCover
        : 0n;

      // Only transfer the safe amount (or less)
      const collateralCountToTransfer = maxRemovable > 0n ? maxRemovable : 0n;

      // collateralCountToAdd: The amount of collateral to add to the new loan (can be 0)
      // Should be in project token decimals, not base token decimals
      const collateralCountToAdd = parseUnits(collateralAmount || "0", projectTokenDecimals);

      // feePercent: The fee percent for the new loan
      const feePercent = BigInt(Math.round(parseFloat(prepaidPercent) * 10));

      // Validate that the reallocation won't result in a borrow amount less than the original
      if (
        selectedLoanReallocAmount !== undefined &&
        selectedLoanReallocAmount < BigInt(internalSelectedLoan.borrowAmount)
      ) {
        setBorrowStatus("error");
        toast({
          variant: "destructive",
          title: "Invalid Reallocation",
          description:
            "Adding this collateral would result in a borrow amount less than your original loan. Please add more collateral.",
        });
        return;
      }

      // Set minBorrowAmount to 0 as per the guidance
      const minBorrowAmount = 0n;

      // Get base token symbol for allowance checking
      const baseTokenSymbol = getTokenSymbolFromAddress(selectedChainTokenConfig.token);

      try {
        setBorrowStatus("waiting-signature");

        // Check allowance for non-ETH base tokens
        if (baseTokenSymbol !== "ETH" && publicClient && walletClient && newLoanBorrowableAmount) {
          const baseTokenAddress = selectedChainTokenConfig.token;
          const revLoansContractAddress = getRevnetLoanContract(
            version,
            cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
          );

          const allowance = await publicClient.readContract({
            address: baseTokenAddress,
            abi: erc20Abi,
            functionName: "allowance",
            args: [address as Address, revLoansContractAddress as Address],
          });

          if (BigInt(allowance) < newLoanBorrowableAmount) {
            setBorrowStatus("approving");

            const approveHash = await walletClient.writeContract({
              address: baseTokenAddress,
              abi: erc20Abi,
              functionName: "approve",
              args: [revLoansContractAddress as Address, newLoanBorrowableAmount],
            });

            await publicClient.waitForTransactionReceipt({ hash: approveHash });
            setBorrowStatus("waiting-signature");
          }
        }

        await reallocateCollateralAsync({
          abi: revLoansAbi,
          functionName: "reallocateCollateralFromLoan",
          address: getRevnetLoanContract(
            version,
            cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
          ),
          chainId: Number(cashOutChainId) as JBChainId,
          args: [
            internalSelectedLoan.id,
            collateralCountToTransfer,
            {
              token: selectedChainTokenConfig.token,
              terminal: primaryNativeTerminal.data as `0x${string}`,
            },
            minBorrowAmount,
            collateralCountToAdd,
            address as `0x${string}`,
            feePercent,
          ],
        });
      } catch (err) {
        setBorrowStatus("error");
        toast({
          variant: "destructive",
          title: "Reallocation Failed",
          description: formatWalletError(err),
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
                  operator: getRevnetLoanContract(
                    version,
                    cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
                  ),
                  projectId: effectiveProjectId,
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

        // collateralBigInt should be in project token decimals, not base token decimals
        const collateralBigInt = parseUnits(collateralAmount, projectTokenDecimals);

        // Get base token symbol for allowance checking
        const baseTokenSymbol = getTokenSymbolFromAddress(selectedChainTokenConfig.token);

        // Check allowance for non-ETH base tokens (for standard borrow)
        if (
          baseTokenSymbol !== "ETH" &&
          publicClient &&
          walletClient &&
          estimatedBorrowFromInputOnly
        ) {
          const baseTokenAddress = selectedChainTokenConfig.token;
          const revLoansContractAddress = getRevnetLoanContract(
            version,
            cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
          );

          const allowance = await publicClient.readContract({
            address: baseTokenAddress,
            abi: erc20Abi,
            functionName: "allowance",
            args: [address as Address, revLoansContractAddress as Address],
          });

          if (BigInt(allowance) < estimatedBorrowFromInputOnly) {
            setBorrowStatus("approving");

            const approveHash = await walletClient.writeContract({
              address: baseTokenAddress,
              abi: erc20Abi,
              functionName: "approve",
              args: [revLoansContractAddress as Address, estimatedBorrowFromInputOnly],
            });

            await publicClient.waitForTransactionReceipt({ hash: approveHash });
            setBorrowStatus("waiting-signature");
          }
        }
        const args = [
          effectiveProjectId,
          {
            token: selectedChainTokenConfig.token,
            terminal: primaryNativeTerminal.data as `0x${string}`,
          },
          0n,
          collateralBigInt,
          address as `0x${string}`,
          BigInt(feeBasisPoints),
        ] as const;

        if (!writeContractAsync) {
          setBorrowStatus("error");
          return;
        }

        try {
          setBorrowStatus("waiting-signature");
          await writeContractAsync({
            abi: revLoansAbi,
            functionName: "borrowFrom",
            address: getRevnetLoanContract(
              version,
              cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined,
            ),
            chainId: Number(cashOutChainId) as JBChainId,
            args,
          });
        } catch (err) {
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
        setBorrowStatus("error");
        toast({
          variant: "destructive",
          title: "Borrow Failed",
          description: formatWalletError(err),
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
    writeContractAsync,
    effectiveProjectId,
    estimatedBorrowFromInputOnly,
    newLoanBorrowableAmount,
    selectedChainTokenConfig,
    publicClient,
    projectTokenDecimals,
    version,
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

  // Don't auto-select any chain - let user choose manually
  // This prevents pre-selection issues and ensures user has full control

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
        description: isReallocationSuccess
          ? "Loan adjusted successfully!"
          : "Loan created successfully!",
      });
      setTimeout(() => {
        handleOpenChange(false);
      }, 3000);
    } else {
      setBorrowStatus("error");
    }
  }, [
    txHash,
    reallocationTxHash,
    isTxLoading,
    isReallocationTxLoading,
    isSuccess,
    isReallocationSuccess,
    toast,
    handleOpenChange,
  ]);

  // Calculate native to wallet and gross borrowed
  useEffect(() => {
    if (!collateralAmount || isNaN(Number(collateralAmount))) {
      setNativeToWallet(0);
      setGrossBorrowedNative(0);
      return;
    }

    // Get token configuration for the selected chain
    const selectedChainTokenConfig = cashOutChainId ? tokenConfigForChain(cashOutChainId) : null;
    const tokenDecimals = selectedChainTokenConfig?.decimals || NATIVE_TOKEN_DECIMALS;

    const percent =
      Number(
        formatUnits(parseUnits(collateralAmount, projectTokenDecimals), projectTokenDecimals),
      ) / Number(formatUnits(userProjectTokenBalance, projectTokenDecimals));
    const estimatedRaw = borrowableAmountRaw
      ? Number(formatUnits(borrowableAmountRaw, tokenDecimals))
      : 0;
    const adjusted = estimatedRaw * percent;
    const afterNetworkFee = adjusted * (1 - totalFixedFees / 1000);
    setNativeToWallet(afterNetworkFee);
    setGrossBorrowedNative(adjusted);
  }, [
    collateralAmount,
    userProjectTokenBalance,
    borrowableAmountRaw,
    totalFixedFees,
    projectTokenDecimals,
    cashOutChainId,
    tokenConfigForChain,
  ]);

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
    if (
      ["success", "error", "error-permission-denied", "error-loan-canceled"].includes(borrowStatus)
    ) {
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
    if (!internalSelectedLoan || !collateralToReturn || estimatedNewBorrowableAmount === undefined)
      return;

    // Get token configuration for the loan's chain
    const loanChainTokenConfig = internalSelectedLoan?.chainId
      ? tokenConfigForChain(internalSelectedLoan.chainId)
      : null;
    const tokenDecimals = loanChainTokenConfig?.decimals || NATIVE_TOKEN_DECIMALS;

    const correctedBorrowAmount = BigInt(internalSelectedLoan.borrowAmount);
    const repayAmountWei = correctedBorrowAmount - estimatedNewBorrowableAmount;
    setRepayAmount(formatUnits(repayAmountWei, tokenDecimals));
  }, [collateralToReturn, estimatedNewBorrowableAmount, internalSelectedLoan, tokenConfigForChain]);

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
    borrowableAmountRaw,

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

    // ===== PHASE 5: BASE TOKEN EXPORTS =====
    baseToken,
    selectedChainTokenConfig,
    tokenConfigForChain,
    selectedChainTokenSymbol: selectedChainTokenConfig
      ? getTokenSymbolFromAddress(selectedChainTokenConfig.token)
      : "ETH",
  };
}
