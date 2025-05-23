import { PropsWithChildren, useEffect, useState } from "react";
import { useHasBorrowPermission } from "@/hooks/useHasBorrowPermission";
import { generateFeeData } from "@/lib/feeHelpers";
import { toWei } from "@/lib/utils";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useWalletClient } from "wagmi";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  JB_CHAINS,
  jbPermissionsAbi,
  NATIVE_TOKEN_DECIMALS,
  JB_TOKEN_DECIMALS
} from "juice-sdk-core";
import {
  JBChainId,
  useJBContractContext,
  useSuckersUserTokenBalance,
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
import { LoanSimulateCard } from "../LoanSimulateCard";
import { LoanFeeChart } from "../LoanFeeChart";
import { TokenBalanceTable } from "../TokenBalanceTable";
import { LoanDetailsTable } from "../LoansDetailsTable";
import { ImportantInfo } from "./ImportantInfo";

const FIXEDLOANFEES = 0.035; // TODO: get from onchain?
const showAddOnCollateralSection = false; //true; // Set to false to hide this section

export function BorrowDialog({
  projectId,
  creditBalance,
  tokenSymbol,
  primaryTerminalEth,
  disabled,
  children,
  selectedLoan,
  defaultTab,
}: PropsWithChildren<{
  projectId: bigint;
  creditBalance: FixedInt<number>;
  tokenSymbol: string;
  primaryTerminalEth: string;
  disabled?: boolean;
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
  const [showOtherCollateral, setShowOtherCollateral] = useState(false);
  const [showingWaitingMessage, setShowingWaitingMessage] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"borrow" | "repay">(defaultTab ?? "borrow");

  // Sync defaultTab with selectedTab if defaultTab changes
  useEffect(() => {
    if (defaultTab && defaultTab !== selectedTab) {
      setSelectedTab(defaultTab);
    }
  }, [defaultTab, selectedTab]);
  const [internalSelectedLoan, setInternalSelectedLoan] = useState<any | null>(selectedLoan ?? null);
  const [showLoanDetailsTable, setShowLoanDetailsTable] = useState(true);
  const [showRefinanceLoanDetailsTable, setShowRefinanceLoanDetailsTable] = useState(true);

  // Used for estimating how much ETH could be borrowed if both
  // the existing loan's collateral and new collateral were combined into one.
  // --- Reallocation borrowable amount estimation ---
  const totalReallocationCollateral =
    internalSelectedLoan && collateralAmount
      ? BigInt(internalSelectedLoan.collateral) + BigInt(Math.floor(Number(collateralAmount) * 1e18))
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
    args: internalSelectedLoan
      ? [
          projectId,
          BigInt(internalSelectedLoan.collateral),
          BigInt(NATIVE_TOKEN_DECIMALS),
          61166n,
        ]
      : undefined,
  });

const netAvailableToBorrow =
  selectedTab === "borrow" && selectedLoanReallocAmount !== undefined && internalSelectedLoan
    ? selectedLoanReallocAmount - BigInt(internalSelectedLoan.borrowAmount)
    : 0n;

// --- Overcollateralization buffer calculation and debug log ---
const isOvercollateralized =
  selectedLoanReallocAmount !== undefined &&
  BigInt(internalSelectedLoan?.borrowAmount ?? 0) < selectedLoanReallocAmount;

const extraCollateralBuffer = isOvercollateralized
  ? selectedLoanReallocAmount - BigInt(internalSelectedLoan?.borrowAmount ?? 0)
  : 0n;

// --- Collateral headroom calculation and debug log ---
const collateralHeadroom =
  currentBorrowableOnSelectedCollateral !== undefined && internalSelectedLoan
    ? currentBorrowableOnSelectedCollateral - BigInt(internalSelectedLoan.borrowAmount)
    : 0n;

// --- Collateral count to transfer calculation for display ---
const collateralCountToTransfer = internalSelectedLoan && currentBorrowableOnSelectedCollateral
  ? BigInt(
      Math.floor(
        Number(collateralHeadroom) /
          (Number(currentBorrowableOnSelectedCollateral) / Number(internalSelectedLoan.collateral))
      )
    )
  : BigInt(0);

  useEffect(() => {
    if (currentBorrowableOnSelectedCollateral !== undefined && internalSelectedLoan?.borrowAmount !== undefined) {
      const netAvailableBorrowETH =
        Number(currentBorrowableOnSelectedCollateral - BigInt(internalSelectedLoan.borrowAmount)) / 1e18;
      // Debug log here
    }
  }, [currentBorrowableOnSelectedCollateral, internalSelectedLoan]);

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

  const {
    contracts: { primaryNativeTerminal, controller, splits, rulesets },
  } = useJBContractContext();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: balances } = useSuckersUserTokenBalance();
  const { data: resolvedPermissionsAddress } = useReadRevDeployerPermissions({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
  });

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
          61166n,
        ]
      : undefined,
  });

  // Collateral to return logic for repay tab
  const remainingCollateral = internalSelectedLoan && collateralToReturn
    ? BigInt(internalSelectedLoan.collateral) - BigInt(Math.floor(Number(collateralToReturn) * 1e18))
    : undefined;

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
            61166n,
          ]
        : undefined,
  });

  // Recalculate repayAmount when collateralToReturn, estimatedNewBorrowableAmount, or selectedLoan changes
  useEffect(() => {
    if (!internalSelectedLoan || !collateralToReturn || estimatedNewBorrowableAmount === undefined) return;

    const correctedBorrowAmount = BigInt(internalSelectedLoan.borrowAmount);
    const repayAmountWei = correctedBorrowAmount - estimatedNewBorrowableAmount;
    setRepayAmount((Number(repayAmountWei) / 1e18).toFixed(6));
  }, [collateralToReturn, estimatedNewBorrowableAmount, internalSelectedLoan]);

  const userProjectTokenBalance = balances?.find(
    (b) =>
      BigInt(b.projectId) === projectId &&
      b.chainId === Number(cashOutChainId)
  )?.balance.value ?? 0n;
  const selectedBalance = balances?.find(
    (b) => b.chainId === Number(cashOutChainId)
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
  } = useWriteRevLoansReallocateCollateralFromLoan();

  const txHash = data;

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // TODO:  surely i missed a helper util here
  useEffect(() => {
    if (!txHash) return;

    if (isTxLoading) {
      setBorrowStatus("pending");
    } else if (isSuccess) {
      setBorrowStatus("success");
    } else {
      setBorrowStatus("error");
    }
  }, [txHash, isTxLoading, isSuccess]);

  // Auto-clear status after 5 seconds for terminal states
  useEffect(() => {
    if (["success", "error", "error-permission-denied", "error-loan-canceled"].includes(borrowStatus)) {
      const timeout = setTimeout(() => setBorrowStatus("idle"), 5000);
      return () => clearTimeout(timeout);
    }
  }, [borrowStatus]);

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

  // Reset internal state when dialog closes or set tab on open
 const handleOpenChange = (open: boolean) => {
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
    setInternalSelectedLoan(null);
    setShowLoanDetailsTable(true);
    setShowRefinanceLoanDetailsTable(true);
    setShowOtherCollateral(false); // ✅ Hide add-on collateral
    setSelectedChainId(null); // Reset chain selection on close
  }
};

  // Move useHasBorrowPermission to top-level of component
  const userHasPermission = useHasBorrowPermission({
    address: address as `0x${string}`,
    projectId,
    chainId: cashOutChainId ? Number(cashOutChainId) : undefined,
    resolvedPermissionsAddress: resolvedPermissionsAddress as `0x${string}`,
    skip: false,
  });

  return (
    <Dialog onOpenChange={handleOpenChange}>
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
                balances={balances}
                projectId={projectId}
                tokenSymbol={tokenSymbol}
                terminalAddress={primaryNativeTerminal.data as `0x${string}`}
                address={address as `0x${string}`}
                columns={["chain", "holding", "borrowable"]}
                selectedChainId={selectedChainId ?? undefined}
                onCheckRow={(chainId) => {
                  const selected = balances?.find((b) => b.chainId === chainId);
                  const collateral = selected ? Number(selected.balance.value) / 1e18 : 0;
                  setSelectedChainId(chainId);
                  setCashOutChainId(chainId.toString());
                  setCollateralAmount(collateral.toFixed(6));
                  setInternalSelectedLoan(null);
                }}
                onAutoselectRow={(chainId) => {
                  const selected = balances?.find((b) => b.chainId === chainId);
                  const collateral = selected ? Number(selected.balance.value) / 1e18 : 0;
                  setSelectedChainId(chainId);
                  setCashOutChainId(chainId.toString());
                  setCollateralAmount(collateral.toFixed(6));
                  setInternalSelectedLoan(null);
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
                  <input
                    id="collateral-amount"
                    type="number"
                    step="0.0001"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    placeholder={
                      cashOutChainId && selectedBalance
                        ? (Number(selectedBalance.balance.value) / 1e18).toFixed(8)
                        : "Enter amount"
                    }
                    className="mt-2 w-full border rounded-md px-3 py-2 bg-white text-sm text-zinc-900 h-10"
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
                            const value = (Number(selectedBalance.balance.value) / 1e18) * (pct / 100);
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
                          const maxValue = Number(selectedBalance.balance.value) / 1e18;
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
                internalSelectedLoan && showOtherCollateral && selectedLoanReallocAmount
                  ? selectedLoanReallocAmount - BigInt(internalSelectedLoan.borrowAmount)
                  : estimatedBorrowFromInputOnly;
              const simulatedEthToWallet = effectiveBorrowableAmount
                ? Number(effectiveBorrowableAmount) / 1e18 * (1 - FIXEDLOANFEES)
                : 0;
              const simulatedGrossBorrowedEth = effectiveBorrowableAmount
                ? Number(effectiveBorrowableAmount) / 1e18
                : 0;

              if (collateralAmount && !isNaN(Number(collateralAmount))) {
                return (
                  <LoanSimulateCard
                    collateralAmount={collateralAmount}
                    tokenSymbol={tokenSymbol}
                    ethToWallet={simulatedEthToWallet}
                    prepaidPercent={prepaidPercent}
                    grossBorrowedEth={simulatedGrossBorrowedEth}
                    feeData={feeData}
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
            {showChart && (
              <LoanFeeChart
                prepaidPercent={prepaidPercent}
                setPrepaidPercent={setPrepaidPercent}
                feeData={feeData}
                ethToWallet={ethToWallet}
                grossBorrowedEth={grossBorrowedEth}
                collateralAmount={collateralAmount}
                tokenSymbol={tokenSymbol}
                displayYears={displayYears}
                displayMonths={displayMonths}
              />
            )}
            {/* Additional Collateral toggleable section (conditionally rendered) */}
            {showAddOnCollateralSection && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const next = !showOtherCollateral;
                    setShowOtherCollateral(next);
                    if (!next) setInternalSelectedLoan(null);
                  }}
                  className="flex items-center gap-2 text-left block text-gray-700 text-sm font-bold mt-6"
                >
                  <span>Add on Collateral (optional)</span>
                  <span
                    className={`transform transition-transform ${showOtherCollateral ? "rotate-90" : "rotate-0"}`}
                  >
                    ▶
                  </span>
                </button>
                {showOtherCollateral && (
                  <LoanDetailsTable
                    key={`${internalSelectedLoan?.id ?? "new"}-${collateralAmount}`}
                    revnetId={BigInt(projectId)}
                    address={address ?? ""}
                    chainId={cashOutChainId ? Number(cashOutChainId) : 0}
                    tokenSymbol={tokenSymbol}
                    onSelectLoan={(loanId, loanData) => setInternalSelectedLoan(loanData)}
                    selectedLoanId={internalSelectedLoan?.id}
                  />
                )}
               {internalSelectedLoan && showOtherCollateral && (
                  <div className="text-sm text-zinc-700 mt-4 space-y-1">
                    <div className="flex justify-between items-center">
                      <p>
                        This loan has unlocked <b>{(Number(collateralHeadroom) / 1e18).toFixed(6)}</b> ETH of appreciated value you can now access.
                      </p>
                      <button
                        onClick={() => setInternalSelectedLoan(null)}
                        className="text-xs text-red-600 hover:underline ml-4"
                      >
                        Remove
                      </button>
                    </div>
                    <p>
                      To access it, you're reusing <b>{(Number(collateralCountToTransfer) / 1e18).toFixed(6)}</b> {tokenSymbol} of that appreciated collateral.
                    </p>
                    <p>
                      You're also escrowing <b>{collateralAmount && Number(collateralAmount) > 0 ? collateralAmount : "0"}</b> {tokenSymbol} of new collateral.
                    </p>
                    <p>
                      Existing borrowed: <b>{(Number(internalSelectedLoan.borrowAmount) / 1e18).toFixed(6)}</b> ETH will be rolled into a new loan.
                    </p>

                    {selectedLoanReallocAmount &&
                      internalSelectedLoan &&
                      BigInt(selectedLoanReallocAmount) <= BigInt(internalSelectedLoan.borrowAmount) && (
                        <p className="text-red-600 text-sm font-medium">
                          ⚠️ Borrowable amount must exceed existing borrowed amount.
                        </p>
                    )}

                    <p>
                      Updated borrowable amount:{" "}
                      <b>
                        {selectedLoanReallocAmount && internalSelectedLoan
                          ? (Number(selectedLoanReallocAmount - BigInt(internalSelectedLoan.borrowAmount)) / 1e18).toFixed(6)
                          : "0.000000"}{" "}
                        ETH
                      </b>{" "}
                      after fees.
                    </p>
                  </div>
                )}
              </>
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
                    {borrowStatus === "permission-granted" && "Permission granted. Borrowing..."}
                    {showingWaitingMessage && "Waiting for wallet confirmation..."}
                    {borrowStatus === "pending" && "Borrowing..."}
                    {borrowStatus === "success" && "Loan successfully issued!"}
                    {borrowStatus === "error-permission-denied" && "Permission was not granted. Please approve to proceed."}
                    {borrowStatus === "error-loan-canceled" && "Loan creation was canceled."}
                    {borrowStatus === "error" && "Something went wrong."}
                  </p>
                )}
              </div>
              {/* Single borrow button for both reallocation and standard borrowing */}
              <ButtonWithWallet
                targetChainId={cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined}
                loading={internalSelectedLoan && collateralAmount && !isNaN(Number(collateralAmount)) ? isReallocating : false}
                onClick={async () => {
                  if (internalSelectedLoan && collateralAmount && !isNaN(Number(collateralAmount))) {
                    // Reallocation path
                    if (
                      !internalSelectedLoan ||
                      !primaryNativeTerminal?.data ||
                      !cashOutChainId ||
                      !address ||
                      !walletClient
                    ) {
                      console.error("Missing data for reallocation");
                      setBorrowStatus("error");
                      return;
                    }

                    const collateralCountToTransfer = internalSelectedLoan && currentBorrowableOnSelectedCollateral
                      ? BigInt(
                          Math.floor(
                            Number(collateralHeadroom) /
                              (Number(currentBorrowableOnSelectedCollateral) / Number(internalSelectedLoan.collateral))
                          )
                        )
                      : BigInt(0);
                    const collateralCountToAdd = toWei(collateralAmount);
                    const feePercent = BigInt(Math.round(parseFloat(prepaidPercent) * 10));
                    const minBorrowAmount = 0n;

                    try {
                      setBorrowStatus("waiting-signature");

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
                        setTimeout(() => setBorrowStatus("idle"), 5000);
                        return;
                      }
                    } catch (err) {
                      console.error(err);
                      setBorrowStatus("error");
                    }
                  }
                }}
              >
                {internalSelectedLoan && collateralAmount && !isNaN(Number(collateralAmount))
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