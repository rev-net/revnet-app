import { PropsWithChildren, useEffect, useState, useCallback } from "react";
import { useHasBorrowPermission } from "@/hooks/useHasBorrowPermission";
import { generateFeeData } from "@/lib/feeHelpers";
import { toWei } from "@/lib/utils";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useWalletClient } from "wagmi";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import {
  JBChainId,
  jbPermissionsAbi,
  NATIVE_TOKEN_DECIMALS,
  JB_TOKEN_DECIMALS
} from "juice-sdk-core";
import {
  useJBContractContext,
} from "juice-sdk-react";
import {
  useReadRevLoansBorrowableAmountFrom,
  useReadRevDeployerPermissions,
  useWriteRevLoansBorrowFrom,
  revLoansAddress,
  calcPrepaidFee,
  useWriteRevLoansRepayLoan,
  useWriteRevLoansReallocateCollateralFromLoan,
} from "revnet-sdk";
import { FixedInt } from "fpnum";
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
import { TokenBalanceTable } from "../TokenBalanceTable";
import { LoanDetailsTable } from "../LoansDetailsTable";
import { ImportantInfo } from "./ImportantInfo";
import { ExternalLink } from "@/components/ExternalLink";
import { etherscanLink } from "@/lib/utils";
import { useAppData } from "@/contexts/AppDataContext";

const FIXEDLOANFEES = 0.035; // TODO: get from onchain?

export function BorrowDialog({
  projectId,
  tokenSymbol,
  children,
  selectedLoan,
  defaultTab,
}: PropsWithChildren<{
  projectId: bigint;
  tokenSymbol: string;
  selectedLoan?: any;
  defaultTab?: "borrow" | "repay";
}>) {
  // State management
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

  const [collateralAmount, setCollateralAmount] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [repayAmount, setRepayAmount] = useState("");
  const [collateralToReturn, setCollateralToReturn] = useState("");
  const [prepaidPercent, setPrepaidPercent] = useState("2.5");
  const [ethToWallet, setEthToWallet] = useState(0);
  const [grossBorrowedEth, setGrossBorrowedEth] = useState(0);
  const [borrowStatus, setBorrowStatus] = useState<BorrowState>("idle");
  const [cashOutChainId, setCashOutChainId] = useState<string>();
  const [showChart, setShowChart] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showingWaitingMessage, setShowingWaitingMessage] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"borrow" | "repay">(defaultTab ?? "borrow");
  const [showRefinanceLoanDetailsTable, setShowRefinanceLoanDetailsTable] = useState(true);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { invalidateUserData } = useAppData();

  // Reset internal state when dialog closes or set tab on open
  const handleOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      setSelectedTab(defaultTab ?? "borrow");
    } else {
      setCollateralAmount("");
      setPrepaidPercent("2.5");
      setEthToWallet(0);
      setBorrowStatus("idle");
      setCashOutChainId(undefined);
      setRepayAmount("");
      setCollateralToReturn("");
      setShowLoanDetailsTable(true);
      setShowRefinanceLoanDetailsTable(true);
      setSelectedChainId(null); // Reset chain selection on close
    }
  }, [defaultTab]);

  // Sync defaultTab with selectedTab if defaultTab changes
  useEffect(() => {
    if (defaultTab && defaultTab !== selectedTab) {
      setSelectedTab(defaultTab);
    }
  }, [defaultTab, selectedTab]);
  const [showLoanDetailsTable, setShowLoanDetailsTable] = useState(true);

  // Used for estimating how much ETH could be borrowed if both
  // the existing loan's collateral and new collateral were combined into one.
  // --- Reallocation borrowable amount estimation ---
  const totalReallocationCollateral =
    selectedLoan && collateralAmount
      ? BigInt(selectedLoan.collateral) + BigInt(Math.floor(Number(collateralAmount) * 1e18))
      : undefined;

  const { data: selectedLoanReallocAmount } = useReadRevLoansBorrowableAmountFrom({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
    args: totalReallocationCollateral
      ? [
          projectId,
          totalReallocationCollateral,
          BigInt(NATIVE_TOKEN_DECIMALS),
          61166n,
        ]
      : undefined,
  });

  // --- Current borrowable amount on selected collateral ---
  const { data: currentBorrowableOnSelectedCollateral } = useReadRevLoansBorrowableAmountFrom({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
    args: selectedLoan
      ? [
          projectId,
          BigInt(selectedLoan.collateral),
          BigInt(NATIVE_TOKEN_DECIMALS),
          61166n,
        ]
      : undefined,
  });

const netAvailableToBorrow =
  selectedTab === "borrow" && selectedLoanReallocAmount !== undefined && selectedLoan
    ? selectedLoanReallocAmount - BigInt(selectedLoan.borrowAmount)
    : 0n;

// --- Overcollateralization buffer calculation and debug log ---
const isOvercollateralized =
  selectedLoanReallocAmount !== undefined &&
  BigInt(selectedLoan?.borrowAmount ?? 0) < selectedLoanReallocAmount;

const extraCollateralBuffer = isOvercollateralized
  ? selectedLoanReallocAmount - BigInt(selectedLoan?.borrowAmount ?? 0)
  : 0n;

// --- Collateral headroom calculation and debug log ---
const collateralHeadroom =
  currentBorrowableOnSelectedCollateral !== undefined && selectedLoan
    ? currentBorrowableOnSelectedCollateral - BigInt(selectedLoan.borrowAmount)
    : 0n;

// --- Collateral count to transfer calculation for display ---
const collateralCountToTransfer = selectedLoan && currentBorrowableOnSelectedCollateral
  ? BigInt(
      Math.floor(
        Number(collateralHeadroom) /
          (Number(currentBorrowableOnSelectedCollateral) / Number(selectedLoan.collateral))
      )
    )
  : BigInt(0);

  useEffect(() => {
    if (currentBorrowableOnSelectedCollateral !== undefined && selectedLoan?.borrowAmount !== undefined) {
      const netAvailableBorrowETH =
        Number(currentBorrowableOnSelectedCollateral - BigInt(selectedLoan.borrowAmount)) / 1e18;
      // Debug log here
    }
  }, [currentBorrowableOnSelectedCollateral, selectedLoan]);

  // Reset showLoanDetailsTable or showRefinanceLoanDetailsTable when switching tabs
  useEffect(() => {
    if (selectedTab === "repay") {
      setShowLoanDetailsTable(true);
    }
  }, [selectedTab]);

  // Always show LoanDetailsTable when repay tab is active
  useEffect(() => {
    setShowLoanDetailsTable(selectedTab === "repay");
  }, [selectedTab]);

  // Repay transaction status tracking
  type RepayState = "idle" | "waiting-signature" | "pending" | "success" | "error";
  const [repayStatus, setRepayStatus] = useState<RepayState>("idle");
  const [repayTxHash, setRepayTxHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync: repayLoanAsync, isPending: isRepaying } = useWriteRevLoansRepayLoan();
  // Repay tx status tracking using wagmi
  const { isLoading: isRepayTxLoading, isSuccess: isRepaySuccess } = useWaitForTransactionReceipt({
    hash: repayTxHash,
  });

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

  useEffect(() => {
    if (borrowStatus === "waiting-signature") {
      const timeout = setTimeout(() => setShowingWaitingMessage(true), 250);
      return () => clearTimeout(timeout);
    } else {
      setShowingWaitingMessage(false);
    }
  }, [borrowStatus]);

  // Auto-clear status after 5 seconds for terminal states
  useEffect(() => {
    if (["success", "error", "error-permission-denied", "error-loan-canceled"].includes(borrowStatus)) {
      const timeout = setTimeout(() => setBorrowStatus("idle"), 5000);
      return () => clearTimeout(timeout);
    }
  }, [borrowStatus]);

  const {
    contracts: { primaryNativeTerminal, controller, splits, rulesets },
  } = useJBContractContext();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { balances } = useAppData();
  const { data: resolvedPermissionsAddress } = useReadRevDeployerPermissions({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
  });

  const {
    data: estimatedRepayAmountForCollateral,
    isLoading: isEstimatingRepayment,
  } = useReadRevLoansBorrowableAmountFrom({
    chainId: selectedLoan?.chainId,
    args: selectedLoan
      ? [
          projectId,
          BigInt(selectedLoan.collateral),
          BigInt(JB_TOKEN_DECIMALS), // TODO confirm this is correct
          61166n,
        ]
      : undefined,
  });

  // Collateral to return logic for repay tab
  const remainingCollateral = selectedLoan && collateralToReturn
    ? BigInt(selectedLoan.collateral) - BigInt(Math.floor(Number(collateralToReturn) * 1e18))
    : undefined;

  const {
    data: estimatedNewBorrowableAmount,
  } = useReadRevLoansBorrowableAmountFrom({
    chainId: selectedLoan?.chainId,
    args:
      selectedLoan && remainingCollateral !== undefined
        ? [
            projectId,
            remainingCollateral,
            BigInt(NATIVE_TOKEN_DECIMALS),
            61166n,
          ]
        : undefined,
  });

  // Recalculate repayAmount when collateralToReturn, estimatedNewBorrowableAmount, or selectedLoan changes
  useEffect(() => {
    if (!selectedLoan || !collateralToReturn || estimatedNewBorrowableAmount === undefined) return;

    const correctedBorrowAmount = BigInt(selectedLoan.borrowAmount);
    const repayAmountWei = correctedBorrowAmount - estimatedNewBorrowableAmount;
    setRepayAmount((Number(repayAmountWei) / 1e18).toFixed(6));
  }, [collateralToReturn, estimatedNewBorrowableAmount, selectedLoan]);

  const participantsData = (balances?.data as any)?.participants?.items ?? [];
  
  // Define the balance type
  type BalanceData = {
    balance: { value: bigint };
    chainId: number;
    projectId: bigint;
  };
  
  // Aggregate balances by chain (GraphQL query is already filtered by project context)
  const aggregatedBalances = participantsData.reduce((acc: Record<number, BalanceData>, participant: any) => {
    const chainId = participant.chainId;
    const balance = BigInt(participant.balance || 0);
    
    if (!acc[chainId]) {
      acc[chainId] = {
        balance: { value: 0n },
        chainId: chainId,
        projectId: BigInt(participant.projectId || 0),
      };
    }
    
    acc[chainId].balance.value += balance;
    return acc;
  }, {});

  const convertedBalances: BalanceData[] = Object.values(aggregatedBalances);

  const userProjectTokenBalance = convertedBalances.find(
    (b: BalanceData) =>
      BigInt(b.projectId) === projectId &&
      b.chainId === Number(cashOutChainId)
  )?.balance?.value ?? 0n;
  const selectedBalance = convertedBalances.find(
    (b: BalanceData) => b.chainId === Number(cashOutChainId)
  );

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
          61166n,
        ] as const
      : undefined,
  });

  // --- Estimated borrowable amount from input only (for simulation) ---
  const { data: estimatedBorrowFromInputOnly } = useReadRevLoansBorrowableAmountFrom({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
    args: collateralAmount
      ? [
          projectId,
          BigInt(Math.floor(Number(collateralAmount) * 1e18)),
          BigInt(NATIVE_TOKEN_DECIMALS),
          61166n,
        ]
      : undefined,
  });


  const {
    writeContract,
    isPending: isWriteLoading,
    data,
  } = useWriteRevLoansBorrowFrom();

  // Add reallocate collateral hook
  const {
    writeContractAsync: reallocateCollateralAsync,
    isPending: isReallocating,
    data: reallocationTxHash,
  } = useWriteRevLoansReallocateCollateralFromLoan();

  const txHash = data;

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Track reallocation transaction status
  const { isLoading: isReallocationTxLoading, isSuccess: isReallocationSuccess } = useWaitForTransactionReceipt({
    hash: reallocationTxHash,
  });

  // Handle reallocation pending status
  useEffect(() => {
    if (isReallocating) {
      setBorrowStatus("reallocation-pending");
    }
  }, [isReallocating]);

  // TODO:  surely i missed a helper util here
  useEffect(() => {
    if (!txHash && !reallocationTxHash) return;

    if (isTxLoading || isReallocationTxLoading) {
      setBorrowStatus("pending");
    } else if (isSuccess || isReallocationSuccess) {
      setBorrowStatus("success");
      // Invalidate user data cache to refresh balances and loans
      invalidateUserData();
      
      const currentTxHash = txHash || reallocationTxHash;
      toast({
        title: "Success",
        description: (
          <div>
            <div>{isReallocationSuccess ? "Loan adjusted successfully!" : "Loan created successfully!"}</div>
            {currentTxHash && (
              <div className="mt-1">
                <ExternalLink
                  href={etherscanLink(currentTxHash as string, {
                    type: "tx",
                  })}
                  className="text-blue-600 hover:underline"
                >
                  View transaction
                </ExternalLink>
              </div>
            )}
          </div>
        ),
      });
      // Close dialog after showing transaction link and toast
      setTimeout(() => {
        handleOpenChange(false);
      }, 3000);
    } else {
      setBorrowStatus("error");
    }
  }, [txHash, reallocationTxHash, isTxLoading, isReallocationTxLoading, isSuccess, isReallocationSuccess, toast, handleOpenChange, invalidateUserData]);

  const loading = isWriteLoading || isTxLoading;


  useEffect(() => {
    if (!collateralAmount || isNaN(Number(collateralAmount))) {
      setEthToWallet(0);
      setGrossBorrowedEth(0);
      return;
    }
    // for ux buttons 25 50 75 100
    const percent = Number(collateralAmount) / (Number(userProjectTokenBalance) / 1e18);
    const estimatedRaw = borrowableAmountRaw ? Number(borrowableAmountRaw) / 1e18 : 0;
    const adjusted = estimatedRaw * percent;
    const afterNetworkFee = adjusted * ( 1 - FIXEDLOANFEES); // get from onchain?
    setEthToWallet(afterNetworkFee);
    setGrossBorrowedEth(adjusted);

    // --- Insert prepaid fee SDK calculation ---
    if (borrowableAmountRaw && prepaidPercent) {
      const monthsToPrepay = (parseFloat(prepaidPercent) / 50) * 120;
      const feeBpsBigInt = calcPrepaidFee(monthsToPrepay); // SDK returns bps as bigint
      const feeBps = Number(feeBpsBigInt);
      const fee = (borrowableAmountRaw * BigInt(feeBps)) / 1000n;
    }
  }, [collateralAmount, userProjectTokenBalance, borrowableAmountRaw, prepaidPercent]);


const feeData = generateFeeData({ grossBorrowedEth, ethToWallet, prepaidPercent });

  // Calculate prepaidMonths using new prepaidDuration logic
  const monthsToPrepay = (parseFloat(prepaidPercent) / 50) * 120;
  const prepaidMonths = monthsToPrepay;
  const displayYears = Math.floor(prepaidMonths / 12);
  const displayMonths = Math.round(prepaidMonths % 12);

  // Move useHasBorrowPermission to top-level of component
  const userHasPermission = useHasBorrowPermission({
    address: address as `0x${string}`,
    projectId,
    chainId: cashOutChainId ? Number(cashOutChainId) : undefined,
    resolvedPermissionsAddress: resolvedPermissionsAddress as `0x${string}`,
    skip: false,
  });

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
        {selectedTab === "borrow" && (
          <div>
            {/* Network selector and collateral input, new layout */}
            <div className="grid w-full gap-1.5">
              <TokenBalanceTable
                projectId={projectId}
                tokenSymbol={tokenSymbol}
                terminalAddress={primaryNativeTerminal.data as `0x${string}`}
                address={address as `0x${string}`}
                columns={["chain", "holding", "borrowable"]}
                selectedChainId={selectedChainId ?? undefined}
                onCheckRow={(chainId) => {
                  const selected = convertedBalances.find((b: BalanceData) => b.chainId === chainId);
                  const collateral = selected ? Number(selected.balance?.value || 0) / 1e18 : 0;
                  setSelectedChainId(chainId);
                  setCashOutChainId(chainId.toString());
                  setCollateralAmount(collateral.toFixed(6));
                }}
                onAutoselectRow={(chainId) => {
                  const selected = convertedBalances.find((b: BalanceData) => b.chainId === chainId);
                  const collateral = selected ? Number(selected.balance?.value || 0) / 1e18 : 0;
                  setSelectedChainId(chainId);
                  setCashOutChainId(chainId.toString());
                  setCollateralAmount(collateral.toFixed(6));
                }}
              />
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-4">
                  <Label htmlFor="collateral-amount" className="block text-gray-700 text-sm font-bold">
                    How much {tokenSymbol} do you want to collateralize?
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-4">
                  <Input
                    id="collateral-amount"
                    type="number"
                    step="0.0001"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    placeholder={
                      cashOutChainId && selectedBalance
                        ? (Number((selectedBalance as BalanceData).balance.value) / 1e18).toFixed(8)
                        : "Enter amount"
                    }
                    className="mt-2"
                  />
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
                            const value = (Number((selectedBalance as BalanceData).balance.value) / 1e18) * (pct / 100);
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
                          const maxValue = Number((selectedBalance as BalanceData).balance.value) / 1e18;
                          setCollateralAmount(maxValue.toFixed(6));
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
                selectedLoan && selectedLoanReallocAmount
                  ? selectedLoanReallocAmount - BigInt(selectedLoan.borrowAmount)
                  : estimatedBorrowFromInputOnly;
              const simulatedEthToWallet = effectiveBorrowableAmount
                ? Number(effectiveBorrowableAmount) / 1e18 * (1 - FIXEDLOANFEES)
                : 0;
              const simulatedGrossBorrowedEth = effectiveBorrowableAmount
                ? Number(effectiveBorrowableAmount) / 1e18
                : 0;

              // Generate feeData specifically for the simulation
              const simulatedFeeData = generateFeeData({ 
                grossBorrowedEth: simulatedGrossBorrowedEth, 
                ethToWallet: simulatedEthToWallet, 
                prepaidPercent 
              });

              if (collateralAmount && !isNaN(Number(collateralAmount))) {
                return (
                  <SimulatedLoanCard
                    collateralAmount={collateralAmount}
                    tokenSymbol={tokenSymbol}
                    ethToWallet={simulatedEthToWallet}
                    prepaidPercent={prepaidPercent}
                    grossBorrowedEth={simulatedGrossBorrowedEth}
                    feeData={simulatedFeeData}
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
              <span>Fee Structure</span>
              <span
                className={`transform transition-transform ${showChart ? "rotate-90" : "rotate-0"}`}
              >
                ▶
              </span>
            </button>
            {showChart && (() => {
              // Calculate effectiveBorrowableAmount and simulation values for the chart
              const effectiveBorrowableAmount =
                selectedLoan && selectedLoanReallocAmount
                  ? selectedLoanReallocAmount - BigInt(selectedLoan.borrowAmount)
                  : estimatedBorrowFromInputOnly;
              const simulatedEthToWallet = effectiveBorrowableAmount
                ? Number(effectiveBorrowableAmount) / 1e18 * (1 - FIXEDLOANFEES)
                : ethToWallet;
              const simulatedGrossBorrowedEth = effectiveBorrowableAmount
                ? Number(effectiveBorrowableAmount) / 1e18
                : grossBorrowedEth;

              // Generate feeData for the chart using the same values as the simulation
              const chartFeeData = generateFeeData({ 
                grossBorrowedEth: simulatedGrossBorrowedEth, 
                ethToWallet: simulatedEthToWallet, 
                prepaidPercent 
              });

              return (
                <LoanFeeChart
                  prepaidPercent={prepaidPercent}
                  setPrepaidPercent={setPrepaidPercent}
                  feeData={chartFeeData}
                  ethToWallet={simulatedEthToWallet}
                  grossBorrowedEth={simulatedGrossBorrowedEth}
                  collateralAmount={collateralAmount}
                  tokenSymbol={tokenSymbol}
                  displayYears={displayYears}
                  displayMonths={displayMonths}
                />
              );
            })()}
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
                targetChainId={cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined}
                loading={isWriteLoading || isTxLoading || isReallocating || isReallocationTxLoading}
                onClick={async () => {
                  if (selectedLoan && collateralAmount && !isNaN(Number(collateralAmount))) {
                    // Reallocation path
                    if (
                      !primaryNativeTerminal?.data ||
                      !cashOutChainId ||
                      !address ||
                      !walletClient
                    ) {
                      console.error("Missing data for reallocation");
                      setBorrowStatus("error");
                      return;
                    }

                    const collateralCountToTransfer = selectedLoan && currentBorrowableOnSelectedCollateral
                      ? BigInt(
                          Math.floor(
                            Number(collateralHeadroom) /
                              (Number(currentBorrowableOnSelectedCollateral) / Number(selectedLoan.collateral))
                          )
                        )
                      : BigInt(0);
                    const collateralCountToAdd = toWei(collateralAmount);
                    const feePercent = BigInt(Math.round(parseFloat(prepaidPercent) * 10));
                    const minBorrowAmount = 0n;

                    try {
                      setBorrowStatus("waiting-signature");

                      // Console log for reallocation transaction data
                      console.log("🔄 REALLOCATION TRANSACTION DATA:", {
                        chainId: Number(cashOutChainId),
                        functionName: "reallocateCollateralFromLoan",
                        args: [
                          selectedLoan.id,
                          collateralCountToTransfer.toString(),
                          {
                            token: "0x000000000000000000000000000000000000EEEe",
                            terminal: primaryNativeTerminal.data,
                          },
                          minBorrowAmount.toString(),
                          collateralCountToAdd.toString(),
                          address,
                          feePercent.toString(),
                        ],
                        parsedValues: {
                          loanId: selectedLoan.id,
                          collateralCountToTransfer: Number(collateralCountToTransfer) / 1e18,
                          collateralCountToAdd: Number(collateralCountToAdd) / 1e18,
                          minBorrowAmount: Number(minBorrowAmount) / 1e18,
                          feePercent: Number(feePercent) / 10, // Convert back to percentage
                          beneficiary: address,
                          terminal: primaryNativeTerminal.data,
                        }
                      });

                      await reallocateCollateralAsync({
                        chainId: Number(cashOutChainId) as JBChainId,
                        args: [
                          selectedLoan.id,
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
                        borrowableAmountRaw === undefined ||
                        !resolvedPermissionsAddress
                      ) {
                        console.error("Missing required data:", {
                          walletClient: !!walletClient,
                          primaryNativeTerminal: !!primaryNativeTerminal?.data,
                          address: !!address,
                          borrowableAmountRaw: borrowableAmountRaw?.toString(),
                          resolvedPermissionsAddress: !!resolvedPermissionsAddress,
                          cashOutChainId,
                          collateralAmount,
                          projectId: projectId.toString()
                        });
                        setBorrowStatus("error");
                        return;
                      }

                      const feeBasisPoints = Math.round(parseFloat(prepaidPercent) * 10);
                      
                      console.log("🔐 PERMISSION CHECK:", {
                        userHasPermission,
                        resolvedPermissionsAddress,
                        address,
                        projectId: projectId.toString(),
                        chainId: Number(cashOutChainId),
                        revLoansAddress: revLoansAddress[Number(cashOutChainId) as JBChainId],
                        projectToken: tokenSymbol,
                        purpose: "Burn permission for project tokens as collateral"
                      });
                      
                      if (!userHasPermission) {
                        console.log("🔐 GRANTING PERMISSIONS FOR PROJECT TOKENS...");
                        setBorrowStatus("granting-permission");
                        try {
                          const permissionArgs = [
                            address as `0x${string}`,
                            {
                              operator: revLoansAddress[Number(cashOutChainId) as JBChainId],
                              projectId,
                              permissionIds: [1], // Burn permission for project tokens
                            },
                          ] as const;
                          
                          console.log("🔐 PERMISSION TRANSACTION DATA:", {
                            chainId: Number(cashOutChainId),
                            functionName: "setPermissionsFor",
                            address: resolvedPermissionsAddress,
                            args: permissionArgs,
                            parsedValues: {
                              account: address,
                              permissionsAddress: resolvedPermissionsAddress,
                              operator: revLoansAddress[Number(cashOutChainId) as JBChainId],
                              projectId: projectId.toString(),
                              permissionIds: [1],
                              projectToken: tokenSymbol,
                              purpose: "Burn permission for project tokens as collateral"
                            }
                          });
                          
                          await walletClient.writeContract({
                            account: address,
                            address: resolvedPermissionsAddress as `0x${string}`,
                            abi: jbPermissionsAbi,
                            functionName: "setPermissionsFor",
                            args: permissionArgs,
                          });
                          console.log("✅ PERMISSIONS GRANTED FOR PROJECT TOKENS");
                          setBorrowStatus("permission-granted");
                        } catch (err) {
                          console.error("❌ PERMISSION GRANT FAILED:", err);
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
                        console.log("✅ USER ALREADY HAS PERMISSIONS FOR PROJECT TOKENS");
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
                        
                        // Console log for standard borrow transaction data
                        console.log("💰 STANDARD BORROW TRANSACTION DATA:", {
                          chainId: Number(cashOutChainId),
                          functionName: "borrowFrom",
                          args: [
                            projectId.toString(),
                            {
                              token: "0x000000000000000000000000000000000000EEEe",
                              terminal: primaryNativeTerminal.data,
                            },
                            0n.toString(),
                            collateralBigInt.toString(),
                            address,
                            BigInt(feeBasisPoints).toString(),
                          ],
                          parsedValues: {
                            projectId: projectId.toString(),
                            token: "0x000000000000000000000000000000000000EEEe",
                            terminal: primaryNativeTerminal.data,
                            minBorrowAmount: 0,
                            collateralAmount: Number(collateralBigInt) / 1e18,
                            beneficiary: address,
                            feeBasisPoints: feeBasisPoints,
                            feePercent: feeBasisPoints / 10, // Convert to percentage
                            userHasPermission,
                            resolvedPermissionsAddress,
                          }
                        });
                        
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
                }}
              >
                {selectedLoan && collateralAmount && !isNaN(Number(collateralAmount))
                  ? "Adjust loan"
                  : "Open loan"}
              </ButtonWithWallet>
            </DialogFooter>
          </div>
        )}
     </DialogContent>
    </Dialog>
  );
}