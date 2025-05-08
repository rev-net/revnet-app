/**
 * -----------------------------
 * 📌 Key State & Computed Values
 * -----------------------------
 *
 * collateralAmount: string
 *    - User-entered collateral input (in token units, e.g. "5.0")
 *
 * prepaidPercent: string
 *    - Percentage of interest paid upfront (e.g. "2.5" for 2.5%)
 *
 * ethToWallet: number
 *    - ETH sent to user after deducting fixed loan processing fee
 *
 * grossBorrowedEth: number
 *    - Total ETH borrowed based on user input before prepaid/fixed fees
 *
 * borrowStatus: "idle" | "checking" | "granting-permission" | "permission-granted" | "waiting-signature" | "pending" | "success" | "error"
 *    - Tracks lifecycle of the borrow transaction UI state (todo radix ui button)
 * */
import { PropsWithChildren, useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useWalletClient } from "wagmi";
import { Label } from "@/components/ui/label";

import {
  JB_CHAINS,
  jbPermissionsAbi,
  NATIVE_TOKEN_DECIMALS,
} from "juice-sdk-core";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
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
import { ChainLogo } from "@/components/ChainLogo";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { SimulatedLoanCard } from "../SimulatedLoanCard";
import { LoanFeeChart } from "../LoanFeeChart";
import { TokenBalanceTable } from "../TokenBalanceTable";
const FIXEDLOANFEES = 0.035; // TODO: get from onchain?


function useHasBorrowPermission({
  address,
  projectId,
  chainId,
  resolvedPermissionsAddress,
}: {
  address?: `0x${string}`;
  projectId: bigint;
  chainId?: number;
  resolvedPermissionsAddress?: `0x${string}`;
}) {
  const [hasPermission, setHasPermission] = useState<boolean | undefined>();

  // TODO: add from peris snippet
  useEffect(() => {
    async function checkPermission() {
      // Temporarily skipping permission check – always grant
      return;
      /*
      if (
        !address ||
        !chainId ||
        !resolvedPermissionsAddress ||
        !revLoansAddress[chainId as JBChainId]
      ) {
        return;
      }

      try {
        const result = await readContract({
          address: resolvedPermissionsAddress,
          abi: jbPermissionsAbi,
          functionName: "hasPermission",
          args: [
            revLoansAddress[chainId as JBChainId],
            address,
            projectId,
            1,
            true,
            true,
          ],
          chainId,
        });

        setHasPermission(result as boolean);
      } catch (err) {
        console.error("Permission check failed:", err);
        setHasPermission(undefined);
      }
      */
    }

    checkPermission();
  }, [address, chainId, projectId, resolvedPermissionsAddress]);

  return hasPermission;
}

export function BorrowDialog({
  projectId,
  creditBalance,
  tokenSymbol,
  primaryTerminalEth,
  disabled,
  children,
}: PropsWithChildren<{
  projectId: bigint;
  creditBalance: FixedInt<number>;
  tokenSymbol: string;
  primaryTerminalEth: string;
  disabled?: boolean;
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
    | "error";

  const [collateralAmount, setCollateralAmount] = useState("");
  const [prepaidPercent, setPrepaidPercent] = useState("2.5");
  const [ethToWallet, setEthToWallet] = useState(0);
  const [grossBorrowedEth, setGrossBorrowedEth] = useState(0);
  const [borrowStatus, setBorrowStatus] = useState<BorrowState>("idle");
  const [cashOutChainId, setCashOutChainId] = useState<string>();
  const [showChart, setShowChart] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: balances } = useSuckersUserTokenBalance();
  const { data: resolvedPermissionsAddress } = useReadRevDeployerPermissions({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
  });
  console.log("sucker balances:", balances);
  const userProjectTokenBalance = balances?.find(
    (b) =>
      BigInt(b.projectId) === projectId &&
      b.chainId === Number(cashOutChainId)
  )?.balance.value ?? 0n;  console.log("userProjectTokenBalance:", userProjectTokenBalance);
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

  // --- Permission Check for Borrowing not implemented yet ---
  const userHasPermission = useHasBorrowPermission({
    address: address as `0x${string}`,
    projectId,
    chainId: cashOutChainId ? Number(cashOutChainId) : undefined,
    resolvedPermissionsAddress: resolvedPermissionsAddress as `0x${string}`,
  });

  const {
    writeContract,
    isPending: isWriteLoading,
    data,
  } = useWriteRevLoansBorrowFrom();

  const txHash = data;

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Track transaction status based on useWaitForTransactionReceipt
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

  // Auto-clear success status after 5 seconds. Can we move into the button
  useEffect(() => {
    if (borrowStatus === "success") {
      const timeout = setTimeout(() => setBorrowStatus("idle"), 5000);
      return () => clearTimeout(timeout);
    }
  }, [borrowStatus]);

  const loading = isWriteLoading || isTxLoading;

  // Update collateralAmount to full balance when cashOutChainId changes
  useEffect(() => {
    if (selectedBalance) {
      const maxValue = Number(selectedBalance.balance.value) / 1e18;
      setCollateralAmount(maxValue.toFixed(4));
    } else {
      setCollateralAmount("");
    }
  }, [cashOutChainId, selectedBalance]);

  useEffect(() => {
    if (!collateralAmount || isNaN(Number(collateralAmount))) {
      console.error("Invalid collateral amount");
      setEthToWallet(0);
      setGrossBorrowedEth(0);
      return;
    }
    // for ux buttons 25 50 75 100
    console.log("userProjectTokenBalance amount:", (Number(userProjectTokenBalance) / 1e18));
    const percent = Number(collateralAmount) / (Number(userProjectTokenBalance) / 1e18);
    const estimatedRaw = borrowableAmountRaw ? Number(borrowableAmountRaw) / 1e18 : 0;
    const adjusted = estimatedRaw * percent;
    const afterNetworkFee = adjusted * ( 1 - FIXEDLOANFEES); // get from onchain?
    setEthToWallet(afterNetworkFee);
    setGrossBorrowedEth(adjusted);
    console.log({
      collateralAmount,
      userProjectTokenBalance,
      borrowableAmountRaw,
      percent,
      estimatedRaw,
      adjusted,
      FIXEDLOANFEES
    });

    // --- Insert prepaid fee SDK calculation ---
    if (borrowableAmountRaw && prepaidPercent) {
      const monthsToPrepay = (parseFloat(prepaidPercent) / 50) * 120;
      const feeBpsBigInt = calcPrepaidFee(monthsToPrepay); // SDK returns bps as bigint
      const feeBps = Number(feeBpsBigInt);
      const fee = (borrowableAmountRaw * BigInt(feeBps)) / 1000n;
      console.log("calcPrepaidFee SDK result:", {
        monthsToPrepay,
        feeBps,
        fee: fee.toString(),
        feeEth: Number(fee) / 1e18,
      });
    }
  }, [collateralAmount, userProjectTokenBalance, borrowableAmountRaw]);

  // Generate fee curve data with correct repayment logic
  const generateFeeData = () => {
    const MAX_YEARS = 10; // Can we get this from the contract?

    // New prepaidFee and prepaidDuration calculation using SDK
    const monthsToPrepay = (parseFloat(prepaidPercent) / 50) * 120;
    const feeBps = Number(calcPrepaidFee(monthsToPrepay));
    const prepaidFee = (grossBorrowedEth * feeBps) / 1000;
    const prepaidDuration = monthsToPrepay / 12;
    console.log("Prepaid fee via SDK:", { monthsToPrepay, feeBps, prepaidFee, prepaidDuration });

    // Use the pre-network-fee borrowable amount for all fee calculations
    const rawBorrowable = grossBorrowedEth;
    const fixedFee = rawBorrowable * FIXEDLOANFEES; // 0.035 (2.5 nana, 1 rev, was 0.05 const onchain?
    const decayingPortion = rawBorrowable - prepaidFee;
    const received = ethToWallet - fixedFee - prepaidFee;
    console.log("Received amount:", received);
    const data = [];

    for (let year = 0; year <= MAX_YEARS; year += 0.1) {
      let variableFee = 0;

      if (year > prepaidDuration && year <= MAX_YEARS) {
        const elapsedAfterPrepaid = year - prepaidDuration;
        const remainingTime = MAX_YEARS - prepaidDuration;
        const percentElapsed = elapsedAfterPrepaid / remainingTime;
        variableFee = decayingPortion * percentElapsed;
      } else if (year > MAX_YEARS) {
        variableFee = decayingPortion;
      }

      // Clamp the variableFee so totalCost never exceeds the raw borrowable amount
      const clampedVariableFee = Math.min(variableFee, decayingPortion);
      const loanCost = fixedFee + clampedVariableFee;

      data.push({
        year,
        totalCost: loanCost,
      });
    }

    // Debug log for fee chart data and variables
    console.log("Fee chart data debug:", {
      rawBorrowable,
      prepaidFee,
      fixedFee,
      decayingPortion,
      data,
    });

    return data;
  };

  const feeData = generateFeeData();

  // Calculate prepaidMonths using new prepaidDuration logic
  const monthsToPrepay = (parseFloat(prepaidPercent) / 50) * 120;
  const prepaidMonths = monthsToPrepay;
  const displayYears = Math.floor(prepaidMonths / 12);
  const displayMonths = Math.round(prepaidMonths % 12);

  // Reset internal state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCollateralAmount("");
      setPrepaidPercent("2.5");
      setEthToWallet(0);
      setBorrowStatus("idle");
      setCashOutChainId(undefined);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Snag a Loan</DialogTitle>
          <DialogDescription asChild>
            <section className="my-4">
              {/* Dialog description content here, "Important Info" toggle moved below Fee Structure Over Time */}
            </section>
          </DialogDescription>
        </DialogHeader>
        {/* Main dialog content (inputs, preview, chart, actions) */}
        <div>
          <div>
            {/* Network selector and collateral input, new layout */}
            <div className="grid w-full gap-1.5">
              <TokenBalanceTable
                balances={balances}
                projectId={projectId}
                tokenSymbol={tokenSymbol}
                terminalAddress={primaryNativeTerminal.data as `0x${string}`}
              />
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-4">
                  <Label htmlFor="collateral-amount" className="block text-gray-700 text-sm font-bold">
                    Collateralize from
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
                <div className="col-span-3">
                  <Select onValueChange={(v) => setCashOutChainId(v)}>
                    <SelectTrigger className="h-10 border border-zinc-300 rounded-md bg-white px-3 text-sm text-zinc-900">
                      <SelectValue placeholder="Select chain" />
                    </SelectTrigger>
                    <SelectContent>
                      {balances?.filter((b) => b.balance.value > 0n).map((balance) => (
                        <SelectItem key={balance.chainId} value={balance.chainId.toString()}>
                          <div className="flex items-center gap-2">
                            <ChainLogo chainId={balance.chainId as JBChainId} />
                            {JB_CHAINS[balance.chainId as JBChainId].name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                            setCollateralAmount(value.toFixed(4));
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
                          setCollateralAmount(maxValue.toFixed(4));
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

            {collateralAmount && !isNaN(Number(collateralAmount)) && (
              <SimulatedLoanCard
                collateralAmount={collateralAmount}
                tokenSymbol={tokenSymbol}
                ethToWallet={ethToWallet}
                prepaidPercent={prepaidPercent}
              />
            )}
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
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <p>• Your {collateralAmount || "0"} {tokenSymbol} tokens will be burned as collateral</p>
                <p>• You'll receive an NFT to reclaim them when repaying</p>
                <p>• After 10 years, loan is liquidated and collateral is lost</p>
                <p>• Rules determine {tokenSymbol} issuance when payments are recieved</p>
              </div>
            )}
          </div>
          {/* Borrow Button and Status Message - horizontally aligned */}
          <DialogFooter className="flex flex-row items-center justify-between w-full gap-4">
            <div className="flex-1 text-left">
              {borrowStatus !== "idle" && (
                <p className="text-sm text-zinc-600">
                  {borrowStatus === "checking" && "Checking permissions..."}
                  {borrowStatus === "granting-permission" && "Granting permission..."}
                  {borrowStatus === "permission-granted" && "Permission granted. Borrowing..."}
                  {borrowStatus === "waiting-signature" && "Waiting for wallet confirmation..."}
                  {borrowStatus === "pending" && "Borrowing..."}
                  {borrowStatus === "success" && "Loan successfully issued!"}
                  {borrowStatus === "error" && "Something went wrong or was canceled."}
                </p>
              )}
            </div>
            <ButtonWithWallet
              targetChainId={cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined}
              loading={false}
              onClick={async () => {
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
                  console.log("Fee basis points:", feeBasisPoints);
                  if (!userHasPermission) {
                    setBorrowStatus("granting-permission");
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
                  } else {
                    setBorrowStatus("permission-granted");
                  }

                  const collateralBigInt = BigInt(Math.floor(Number(collateralAmount) * 1e18));
                  console.log("Collateral (user input):", collateralAmount);
                  console.log("Collateral (converted to wei):", collateralBigInt.toString());
                  const args = [
                    projectId,
                    {
                      token: "0x000000000000000000000000000000000000EEEe", // get from terminals base token
                      terminal: primaryNativeTerminal.data as `0x${string}`,
                    },
                    0n,
                    collateralBigInt,
                    address as `0x${string}`,
                    BigInt(feeBasisPoints),
                  ] as const;

                  // Log the contract args before calling writeContract
                  console.log("Borrow contract args:", args);

                  if (!writeContract) {
                    console.error("writeContract is not available");
                    setBorrowStatus("error");
                    return;
                  }

                  setBorrowStatus("waiting-signature");
                  try {
                    await writeContract({
                      chainId: Number(cashOutChainId) as JBChainId,
                      args,
                    });
                    // setBorrowStatus("pending"); // REMOVED: now managed by useEffect
                  } catch (err) {
                    console.warn("User rejected or tx failed", err);
                    setBorrowStatus("error");
                    return;
                  }
                } catch (err) {
                  console.error(err);
                  setBorrowStatus("error");
                }
              }}
            >
              Borrow some ETH
            </ButtonWithWallet>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}