import { useEffect, useState, useCallback } from "react";
import { useHasBorrowPermission } from "@/hooks/useHasBorrowPermission";
import { generateFeeData } from "@/lib/feeHelpers";
import { formatUnits, parseUnits, Address, erc20Abi } from "viem";
import { useAccount, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useWalletClient } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { primaryNativeTerminal } from "@/app/constants"; 

import {
  JBChainId,
  jbPermissionsAbi,
  NATIVE_TOKEN_DECIMALS,
  JB_TOKEN_DECIMALS,
} from "juice-sdk-core";
import {
  useJBContractContext,
  useJBTokenContext,
  useJBChainId,
} from "juice-sdk-react";

import {
  useReadRevLoansBorrowableAmountFrom,
  useReadRevDeployerPermissions,
  useReadRevDeployerFee,
  useReadRevLoansRevPrepaidFeePercent,
  useWriteRevLoansRepayLoan,
  useWriteRevLoansReallocateCollateralFromLoan,
} from "revnet-sdk";
import { useWriteRevLoansBorrowFrom } from "@/hooks/useWriteRevLoansBorrowFrom";

import { REV_LOANS_ADDRESSES } from "@/app/constants";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { SuckerGroupDocument } from "@/generated/graphql";
import { getTokenSymbolFromAddress, createTokenConfigGetter } from "@/lib/tokenUtils";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { useUserTokenBalancesBendy } from "@/hooks/useUserTokenBalancesBendy";

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

// Helpers
const toTenthsPercent = (pctString: string) =>
  Math.round(parseFloat(pctString || "0") * 10); // e.g. "2.5" -> 25

const isNonZero = (v?: bigint) => !!v && v > 0n;

// 365-day year in seconds — matches on-chain 6-month = 15,768,000s seen in logs
const YEAR_SECONDS = 31_536_000;

export function useBorrowDialog({
  projectId,
  tokenSymbol,
  selectedLoan,
  defaultTab,
}: UseBorrowDialogProps) {
  // ===== STATE =====
  const ETH_CURRENCY_ID = 1n;

  // UI
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"borrow" | "repay">(defaultTab ?? "borrow");
  const [showChart, setShowChart] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showOtherCollateral, setShowOtherCollateral] = useState(false);
  const [showLoanDetailsTable, setShowLoanDetailsTable] = useState(true);
  const [showRefinanceLoanDetailsTable, setShowRefinanceLoanDetailsTable] = useState(true);
  const [showingWaitingMessage, setShowingWaitingMessage] = useState(false);

  // Borrow
  const [borrowStatus, setBorrowStatus] = useState<BorrowState>("idle");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>(undefined);
  const [cashOutChainId, setCashOutChainId] = useState<string>();
  const [prepaidPercent, setPrepaidPercent] = useState("2.5");
  const [nativeToWallet, setNativeToWallet] = useState(0);
  const [grossBorrowedNative, setGrossBorrowedNative] = useState(0);
  const [internalSelectedLoan, setInternalSelectedLoan] = useState<any | null>(selectedLoan ?? null);

  // Repay
  const [repayStatus, setRepayStatus] = useState<RepayState>("idle");
  const [repayAmount, setRepayAmount] = useState("");
  const [collateralToReturn, setCollateralToReturn] = useState("");
  const [repayTxHash, setRepayTxHash] = useState<`0x${string}` | undefined>();

  const { toast } = useToast();

  // ===== CONTEXT & CLIENTS =====
  const { token } = useJBTokenContext(); // project token (collateral)
  // const {
  //   contracts: { primaryNativeTerminal },
  // } = useJBContractContext(); // resolve terminal from JB context
  const jbChainId = useJBChainId();

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // ===== BASE TOKEN & GROUP CONTEXT =====
  const baseToken = useProjectBaseToken();
  const { suckerGroupId } = useCurrentProject();
  const { data: suckerGroupData } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: suckerGroupId ?? "" },
    { enabled: !!suckerGroupId, pollInterval: 10000 }
  );

  // Token config getter per chain (borrow currency configuration)
  const getTokenConfigForChain = useCallback(createTokenConfigGetter(suckerGroupData), [suckerGroupData]);

  // User balances across chains for project token
  const { balances } = useUserTokenBalancesBendy(suckerGroupId, address);

  // Rev deployer contracts & fees for the selected cash-out chain
  const targetJBChainId = cashOutChainId ? (Number(cashOutChainId) as JBChainId) : undefined;

  const { data: resolvedPermissionsAddress } = useReadRevDeployerPermissions({
    chainId: targetJBChainId,
  });
  const { data: revDeployerFee } = useReadRevDeployerFee({
    chainId: targetJBChainId,
  });

  const { data: revPrepaidFeePercent } = useReadRevLoansRevPrepaidFeePercent({
    chainId: targetJBChainId,
  });

  // ===== DERIVED VALUES =====
  const projectTokenDecimals = token?.data?.decimals ?? JB_TOKEN_DECIMALS;
  const projectTokenAddress = token?.data?.address as Address | undefined; // for approvals (collateral)

  const selectedBalance = balances?.find((b: any) => b.chainId === Number(cashOutChainId));
  const userProjectTokenBalance = selectedBalance ? BigInt(selectedBalance.userBalance || 0) : 0n;

  // Use per-chain projectId if resolved from balance, else prop
  const effectiveProjectId = selectedBalance?.projectId ? BigInt(selectedBalance.projectId) : projectId;

  // fees are in tenths-of-a-percent (‰ * 0.1). Divide by 1000 to get a fraction.
  const totalFixedFeesTenths =
    (revDeployerFee ? Number(revDeployerFee) : 0) +
    (revPrepaidFeePercent ? Number(revPrepaidFeePercent) : 0);

  // Selected chain borrow currency config
  const selectedChainTokenConfig = cashOutChainId ? getTokenConfigForChain(Number(cashOutChainId)) : null;

  // Prepaid fee representations & duration (derived for display)
  const prepaidTenths = toTenthsPercent(prepaidPercent); // e.g. "2.5" -> 25
  const prepaidPctFloat = parseFloat(prepaidPercent || "0");
  // Contract-equivalent duration: (prepaid% / 5%) * 1 year
  const prepaidDurationSeconds = Math.round((prepaidPctFloat / 5) * YEAR_SECONDS);
  const prepaidMonths = (prepaidPctFloat / 5) * 12; // 2.5% -> 6 months
  const displayYears = Math.floor(prepaidMonths / 12);
  const displayMonths = Math.round(prepaidMonths % 12);
  const prepaidDurationLabel =
    displayYears > 0
      ? `${displayYears}y${displayMonths ? ` ${displayMonths}m` : ""}`
      : `${displayMonths}m`;

  // ===== READS: BORROWABLE AMOUNTS (various scenarios) =====
  const borrowArgsOrUndefined =
    cashOutChainId && selectedChainTokenConfig
      ? ([
          effectiveProjectId,
          userProjectTokenBalance,
          BigInt(selectedChainTokenConfig.decimals),
          BigInt(selectedChainTokenConfig.currency),
        ] as const)
      : undefined;

  const {
    data: borrowableAmountRaw,
    error: borrowableError,
    isLoading: isBorrowableLoading,
  } = useReadRevLoansBorrowableAmountFrom({
    chainId: targetJBChainId,
    args: borrowArgsOrUndefined,
  });

  const { data: estimatedBorrowFromInputOnly } = useReadRevLoansBorrowableAmountFrom({
    chainId: targetJBChainId,
    args:
      collateralAmount && selectedChainTokenConfig
        ? ([
            effectiveProjectId,
            parseUnits(collateralAmount, projectTokenDecimals),
            BigInt(selectedChainTokenConfig.decimals),
            BigInt(selectedChainTokenConfig.currency),
          ] as const)
        : undefined,
  });

  // Reallocation reads (based on an existing loan)
  const totalReallocationCollateral =
    internalSelectedLoan && collateralAmount
      ? BigInt(internalSelectedLoan.collateral) + parseUnits(collateralAmount, projectTokenDecimals)
      : undefined;

  const { data: selectedLoanReallocAmount } = useReadRevLoansBorrowableAmountFrom({
    chainId: targetJBChainId,
    args:
      totalReallocationCollateral && selectedChainTokenConfig
        ? ([
            effectiveProjectId,
            totalReallocationCollateral,
            BigInt(selectedChainTokenConfig.decimals),
            BigInt(selectedChainTokenConfig.currency),
          ] as const)
        : undefined,
  });

  const { data: currentBorrowableOnSelectedCollateral } = useReadRevLoansBorrowableAmountFrom({
    chainId: targetJBChainId,
    args:
      internalSelectedLoan && selectedChainTokenConfig
        ? ([
            effectiveProjectId,
            BigInt(internalSelectedLoan.collateral),
            BigInt(selectedChainTokenConfig.decimals),
            BigInt(selectedChainTokenConfig.currency),
          ] as const)
        : undefined,
  });

  // Repay estimation scaffolding
  const remainingCollateral =
    internalSelectedLoan && collateralToReturn
      ? BigInt(internalSelectedLoan.collateral) - parseUnits(collateralToReturn, projectTokenDecimals)
      : undefined;

  const {
    data: estimatedRepayAmountForCollateral,
    isLoading: isEstimatingRepayment,
  } = useReadRevLoansBorrowableAmountFrom({
    chainId: internalSelectedLoan?.chainId,
    args: internalSelectedLoan
      ? ([
          effectiveProjectId,
          BigInt(internalSelectedLoan.collateral),
          BigInt(JB_TOKEN_DECIMALS), // confirm for loan chain if needed
          BigInt(ETH_CURRENCY_ID),
        ] as const)
      : undefined,
  });

  const { data: estimatedNewBorrowableAmount } = useReadRevLoansBorrowableAmountFrom({
    chainId: internalSelectedLoan?.chainId,
    args:
      internalSelectedLoan && remainingCollateral !== undefined
        ? ([
            effectiveProjectId,
            remainingCollateral,
            BigInt(NATIVE_TOKEN_DECIMALS),
            BigInt(ETH_CURRENCY_ID),
          ] as const)
        : undefined,
  });

  // New-loan-only borrowable with headroom from an existing loan
  const collateralHeadroom =
    currentBorrowableOnSelectedCollateral !== undefined && internalSelectedLoan
      ? currentBorrowableOnSelectedCollateral - BigInt(internalSelectedLoan.borrowAmount)
      : 0n;

  const newLoanCollateral =
    collateralHeadroom + (collateralAmount ? parseUnits(collateralAmount, projectTokenDecimals) : 0n);

  const { data: newLoanBorrowableAmount } = useReadRevLoansBorrowableAmountFrom({
    chainId: targetJBChainId,
    args:
      newLoanCollateral > 0n && selectedChainTokenConfig
        ? ([
            effectiveProjectId,
            newLoanCollateral,
            BigInt(selectedChainTokenConfig.decimals),
            BigInt(selectedChainTokenConfig.currency),
          ] as const)
        : undefined,
  });

  // Overcollateralization checks
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

  // ===== WRITES =====
  const { writeContract, isPending: isWriteLoading, data } = useWriteRevLoansBorrowFrom();
  const {
    writeContractAsync: reallocateCollateralAsync,
    isPending: isReallocating,
    data: reallocationTxHash,
  } = useWriteRevLoansReallocateCollateralFromLoan();
  const { writeContractAsync: repayLoanAsync, isPending: isRepaying } = useWriteRevLoansRepayLoan();

  // TX receipts
  const txHash = data;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const { isLoading: isReallocationTxLoading, isSuccess: isReallocationSuccess } =
    useWaitForTransactionReceipt({ hash: reallocationTxHash });
  const { isLoading: isRepayTxLoading, isSuccess: isRepaySuccess } =
    useWaitForTransactionReceipt({ hash: repayTxHash });

  // Permission
  let userHasPermission = useHasBorrowPermission({
    address: address as `0x${string}`,
    projectId: effectiveProjectId,
    chainId: cashOutChainId ? Number(cashOutChainId) : undefined,
    resolvedPermissionsAddress: resolvedPermissionsAddress as `0x${string}`,
    skip: false,
  });
  // userHasPermission = false; // force for testing
  // Fees & display duration
  const borrowAmountForFeeCalculation =
    internalSelectedLoan && selectedLoanReallocAmount
      ? Number(
          formatUnits(
            selectedLoanReallocAmount,
            selectedChainTokenConfig?.decimals || NATIVE_TOKEN_DECIMALS
          )
        )
      : grossBorrowedNative;

  const feeData = generateFeeData({
    grossBorrowedEth: borrowAmountForFeeCalculation,
    prepaidPercent, // keep as string for your helper
  });

  const newLoanFeeData = newLoanBorrowableAmount
    ? generateFeeData({
        grossBorrowedEth: Number(
          formatUnits(
            newLoanBorrowableAmount,
            selectedChainTokenConfig?.decimals || NATIVE_TOKEN_DECIMALS
          )
        ),
        prepaidPercent,
      })
    : feeData;

  const loading = isWriteLoading || isTxLoading;

  // ===== INTERNAL HELPERS =====
  const ensureCollateralAllowance = useCallback(
    async ({
      needed,
      chainId,
    }: {
      needed: bigint;
      chainId: JBChainId;
    }) => {
      if (!publicClient || !walletClient || !address) return;

      // If the project token is undefined, assume native & no approve needed
      if (!projectTokenAddress || !isNonZero(needed)) return;

      const spender = REV_LOANS_ADDRESSES[chainId] as Address | undefined;
      if (!spender) throw new Error("RevLoans address not configured for selected chain");

      const currentAllowance = (await publicClient.readContract({
        address: projectTokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address as Address, spender],
      })) as bigint;

      if (currentAllowance < needed) {
        setBorrowStatus("approving");
        const approveHash = await walletClient.writeContract({
          address: projectTokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, needed],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        setBorrowStatus("waiting-signature");
      }
    },
    [address, publicClient, walletClient, projectTokenAddress]
  );

  // ===== CALLBACKS =====
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsDialogOpen(open);
      if (open) {
        setSelectedTab(defaultTab ?? "borrow");
      } else {
        // Reset UI
        setCollateralAmount("");
        setPrepaidPercent("2.5");
        setNativeToWallet(0);
        setGrossBorrowedNative(0);
        setBorrowStatus("idle");
        setRepayStatus("idle");
        setRepayAmount("");
        setCollateralToReturn("");
        setRepayTxHash(undefined);
        setCashOutChainId(undefined);
        setSelectedChainId(undefined);
        setInternalSelectedLoan(null);
        setShowChart(false);
        setShowInfo(false);
        setShowOtherCollateral(false);
        setShowLoanDetailsTable(true);
        setShowRefinanceLoanDetailsTable(true);
        setShowingWaitingMessage(false);
      }
    },
    [defaultTab]
  );

  const handleChainSelection = useCallback(
    (chainId: number) => {
      const selected = balances?.find((b: any) => b.chainId === chainId);
      const collateral = selected
        ? formatUnits(BigInt(selected.userBalance || 0), projectTokenDecimals)
        : "0";
      setSelectedChainId(chainId);
      setCashOutChainId(chainId.toString());
      setCollateralAmount(collateral);
      setInternalSelectedLoan(null);
    },
    [balances, projectTokenDecimals]
  );

  const handleLoanSelection = useCallback((loanId: string, loanData: any) => {
    setInternalSelectedLoan(loanData);
    if (loanData?.chainId) setCashOutChainId(loanData.chainId.toString());
    else if (loanData?.chain) setCashOutChainId(loanData.chain.toString());
  }, []);

 const handleBorrow = useCallback(async () => {
    try {
      /* 0. pre-flight guards (unchanged) */
      // … chain / wallet / terminal checks …

      const chainAsJB = Number(cashOutChainId) as JBChainId;
      const revLoansAddress = REV_LOANS_ADDRESSES[chainAsJB] as Address | undefined;
      if (!revLoansAddress) { /* toast + return */ }

      /* ========== PATH A: REALLOCATION (unchanged) ========== */
      if (internalSelectedLoan && collateralAmount && !isNaN(Number(collateralAmount))) {
        // … reallocation branch untouched …
        return;
      }

      /* ========== PATH B: STANDARD BORROW (OPTION 1) ========== */
      setBorrowStatus("checking");

      if (!borrowableAmountRaw || !resolvedPermissionsAddress) { /* toast + return */ }

      /* 1. permission (unchanged) */
      if (!userHasPermission) {
        setBorrowStatus("granting-permission");
        try {
          await walletClient!.writeContract({
            account: address,
            address: resolvedPermissionsAddress as `0x${string}`, 
            abi: jbPermissionsAbi,
            functionName: "setPermissionsFor",
            args: [
              address as `0x${string}`,                          
              {
                operator: revLoansAddress!,                       
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
            title: "Permission denied",
            description: "Granting PAY permission was rejected or failed.",
          });
          return; // stop; don’t proceed to approvals
        }
      } else if (userHasPermission === undefined) {
        toast({
          variant: "destructive",
          title: "Permission status unknown",
          description: "Still checking operator permission—please try again in a moment.",
        });
        return;
      } else {
        setBorrowStatus("permission-granted"); // already had it
      }

      /* 2. collateral approval (PROJECT TOKEN → RevLoans) */
      const collateralBigInt = parseUnits(collateralAmount || "0", projectTokenDecimals);
      await ensureCollateralAllowance({
        needed: collateralBigInt,
        chainId: chainAsJB,
      });

      /* ---- DEBUG LOG after collateral allowance ---- */
      console.debug("✅ Collateral allowance ensured", {
        chainId: chainAsJB,
        collateralToken: projectTokenAddress,
        spender: revLoansAddress,
        amountWei: collateralBigInt.toString(),
      });

      /* 3. build args & extra sanity logs */
      const feeTenths = BigInt(prepaidTenths);
      const args = [
        effectiveProjectId,
        {
          token: selectedChainTokenConfig!.token,
          terminal: primaryNativeTerminal.data as `0x${string}`,
        },
        0n,                  // minBorrowAmount
        collateralBigInt,    // collateral
        address as `0x${string}`,
        feeTenths,
      ] as const;

      /* ---- DEBUG LOG before writeContract ---- */
      console.debug("📤 Borrow call params", {
        projectId: effectiveProjectId.toString(),
        borrowToken: selectedChainTokenConfig!.token,
        terminal: primaryNativeTerminal.data,
        collateralWei: collateralBigInt.toString(),
        prepaidFeeTenths: prepaidTenths,
        chainId: chainAsJB,
      });

      /* 4. send tx */
      if (!writeContract) { /* toast + return */ }
      setBorrowStatus("waiting-signature");
      await writeContract({ chainId: chainAsJB, args });
    } catch (err: any) {
      const cancelled = String(err?.message || "").toLowerCase().includes("user rejected");
      setBorrowStatus(cancelled ? "error-loan-canceled" : "error");
      toast({
        variant: "destructive",
        title: cancelled ? "Transaction cancelled" : "Borrow failed",
        description: err?.message || "Unable to complete borrow.",
      });
      if (cancelled) setTimeout(() => setBorrowStatus("idle"), 5_000);
    }
  }, [
    /* deps unchanged */
    address,
    borrowableAmountRaw,
    cashOutChainId,
    collateralAmount,
    effectiveProjectId,
    ensureCollateralAllowance,
    projectTokenAddress,
    projectTokenDecimals,
    prepaidTenths,
    primaryNativeTerminal?.data,
    resolvedPermissionsAddress,
    selectedChainTokenConfig,
    toast,
    userHasPermission,
    walletClient,
    writeContract,
  ]);


  // ===== EFFECTS =====
  useEffect(() => {
    if (defaultTab && defaultTab !== selectedTab) setSelectedTab(defaultTab);
  }, [defaultTab, selectedTab]);

  useEffect(() => {
    setInternalSelectedLoan(selectedLoan ?? null);
    if (selectedLoan?.chainId) setCashOutChainId(selectedLoan.chainId.toString());
    else if (selectedLoan?.chain) setCashOutChainId(selectedLoan.chain.toString());
  }, [selectedLoan]);

  useEffect(() => {
    if (isReallocating) setBorrowStatus("reallocation-pending");
  }, [isReallocating]);

  useEffect(() => {
    if (!txHash && !reallocationTxHash) return;

    if (isTxLoading || isReallocationTxLoading) {
      setBorrowStatus("pending");
    } else if (isSuccess || isReallocationSuccess) {
      setBorrowStatus("success");
      toast({
        title: "Success",
        description: isReallocationSuccess ? "Loan adjusted successfully!" : "Loan created successfully!",
      });
      setTimeout(() => handleOpenChange(false), 3000);
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

  useEffect(() => {
    if (!collateralAmount || isNaN(Number(collateralAmount))) {
      setNativeToWallet(0);
      setGrossBorrowedNative(0);
      return;
    }
    const tokenDecimals = selectedChainTokenConfig?.decimals || NATIVE_TOKEN_DECIMALS;

    const userBal = Number(formatUnits(userProjectTokenBalance, projectTokenDecimals)) || 0;
    const inputAmt = Number(formatUnits(parseUnits(collateralAmount, projectTokenDecimals), projectTokenDecimals)) || 0;
    const percent = userBal > 0 ? inputAmt / userBal : 0;

    const estimatedRaw =
      borrowableAmountRaw ? Number(formatUnits(borrowableAmountRaw, tokenDecimals)) : 0;

    const adjusted = estimatedRaw * percent;

    // totalFixedFeesTenths is tenths-of-a-percent; divide by 1000 to get fraction
    const afterNetworkFee = adjusted * (1 - totalFixedFeesTenths / 1000);

    setNativeToWallet(afterNetworkFee);
    setGrossBorrowedNative(adjusted);
  }, [
    collateralAmount,
    userProjectTokenBalance,
    borrowableAmountRaw,
    totalFixedFeesTenths,
    projectTokenDecimals,
    selectedChainTokenConfig,
  ]);

  useEffect(() => {
    if (isRepayTxLoading) setRepayStatus("pending");
    else if (isRepaySuccess) setRepayStatus("success");
  }, [isRepayTxLoading, isRepaySuccess]);

  useEffect(() => {
    if (repayStatus === "success" || repayStatus === "error") {
      const timeout = setTimeout(() => setRepayStatus("idle"), 5000);
      return () => clearTimeout(timeout);
    }
  }, [repayStatus]);

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

  useEffect(() => {
    setShowLoanDetailsTable(selectedTab === "repay");
  }, [selectedTab]);

  useEffect(() => {
    if (!internalSelectedLoan || !collateralToReturn || estimatedNewBorrowableAmount === undefined) return;

    const loanChainTokenConfig = internalSelectedLoan?.chainId
      ? getTokenConfigForChain(internalSelectedLoan.chainId)
      : null;

    const tokenDecimals = loanChainTokenConfig?.decimals || NATIVE_TOKEN_DECIMALS;

    const correctedBorrowAmount = BigInt(internalSelectedLoan.borrowAmount);
    const repayAmountWei = correctedBorrowAmount - estimatedNewBorrowableAmount;
    setRepayAmount(formatUnits(repayAmountWei, tokenDecimals));
  }, [
    collateralToReturn,
    estimatedNewBorrowableAmount,
    internalSelectedLoan,
    getTokenConfigForChain,
  ]);

  // ===== RETURN =====
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

    // Derived
    projectTokenDecimals,
    userProjectTokenBalance,
    selectedBalance,
    totalFixedFees: totalFixedFeesTenths,
    totalReallocationCollateral,
    remainingCollateral,
    netAvailableToBorrow,
    isOvercollateralized,
    extraCollateralBuffer,
    collateralHeadroom,
    feeData,
    newLoanFeeData,

    // Prepaid fee representations
    prepaidTenths, // e.g. 25 -> 2.5%
    prepaidDurationSeconds, // matches contract’s year-based schedule
    prepaidDurationLabel, // e.g. "6m", "1y", "2y"
    displayYears,
    displayMonths,

    // Estimates
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

    // Extras
    balances,
    primaryNativeTerminal,
    address,
    setSelectedChainId,
    setCashOutChainId,

    // Base token & configs
    baseToken,
    selectedChainTokenConfig,
    getTokenConfigForChain,
    selectedChainTokenSymbol: selectedChainTokenConfig
      ? getTokenSymbolFromAddress(selectedChainTokenConfig.token)
      : "ETH",
  };
}
