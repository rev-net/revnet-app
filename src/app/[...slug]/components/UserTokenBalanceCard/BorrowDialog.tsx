import { PropsWithChildren, useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
  useReadRevLoansTotalCollateralOf,
  useWriteRevLoansBorrowFrom,
  useReadRevLoansController,
  useReadRevDeployerHasMintPermissionFor,
  revLoansAddress,
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
import { LoanTableRow } from "./LoanTableRow";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { encodeAbiParameters } from "viem";


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
  const [borrowableAmount, setBorrowableAmount] = useState(0);
  const [rawBorrowableAmount, setRawBorrowableAmount] = useState(0);
  const [borrowStatus, setBorrowStatus] = useState<BorrowState>("idle");

  const [cashOutChainId, setCashOutChainId] = useState<string>();
  // Show/hide fee chart state
  const [showChart, setShowChart] = useState(false);
  // Show/hide important info section
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

const userProjectTokenBalance = balances?.find((b) => BigInt(b.projectId) === projectId)?.balance.value ?? 0n;

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

  // --- Permission Check for Borrowing ---
  const userHasPermission = useHasBorrowPermission({
    address: address as `0x${string}`,
    projectId,
    chainId: cashOutChainId ? Number(cashOutChainId) : undefined,
    resolvedPermissionsAddress: resolvedPermissionsAddress as `0x${string}`,
  });
  // --- Write and Transaction Hooks for Borrowing ---
  {/*
    function borrowFrom(
    uint256 revnetId,
    REVLoanSource calldata source,
    uint256 minBorrowAmount,
    uint256 collateralCount,
    address payable beneficiary,
    uint256 prepaidFeePercent
)
    public
    override
    returns (uint256 loanId, REVLoan memory);
  */}
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
      setBorrowableAmount(0);
      setRawBorrowableAmount(0);
      return;
    }

    const percent = Number(collateralAmount) / (Number(userProjectTokenBalance) / 1e18);
    const estimatedRaw = borrowableAmountRaw ? Number(borrowableAmountRaw) / 1e18 : 0;
    const adjusted = estimatedRaw * percent;
    const afterNetworkFee = adjusted * 0.95;
    setBorrowableAmount(afterNetworkFee);
    setRawBorrowableAmount(adjusted);
  }, [collateralAmount, userProjectTokenBalance, borrowableAmountRaw]);

  // Generate fee curve data with correct repayment logic
  const generateFeeData = () => {
    const MAX_YEARS = 10; // Can we get this from the contract?
    const prepaidFraction = parseFloat(prepaidPercent) / 100;
    const prepaidDuration = (prepaidFraction / 0.5) * MAX_YEARS;

    // Use the pre-network-fee borrowable amount for all fee calculations
    const rawBorrowable = rawBorrowableAmount;
    const prepaidFee = rawBorrowable * prepaidFraction;
    const fixedFee = rawBorrowable * 0.05;
    const decayingPortion = rawBorrowable - prepaidFee;
    const received = borrowableAmount - fixedFee - prepaidFee;

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

  // Calculate prepaidMonths using local variables, not window.__prepaidDuration
  const prepaidFraction = parseFloat(prepaidPercent) / 100;
  const prepaidDuration = (prepaidFraction / 0.5) * 10;
  const prepaidMonths = prepaidDuration * 12;
  const displayYears = Math.floor(prepaidMonths / 12);
  const displayMonths = Math.round(prepaidMonths % 12);

  // Reset internal state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCollateralAmount("");
      setPrepaidPercent("2.5");
      setBorrowableAmount(0);
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
          {/* Left side - Inputs */}
          <div>
            {/* Network selector and collateral input, new layout */}
            <div className="grid w-full gap-1.5">
              {/* Available Balances Table - restyled */}
              <div className="mb-5 w-full max-w-md">
                <span className="text-sm text-black font-medium">Your {tokenSymbol}</span>
                <div className="mt-1 border border-zinc-200 p-3 bg-zinc-50 rounded-md">
                  <div className="grid grid-cols-3 gap-3 text-right text-sm font-bold text-zinc-600 mb-1">
                    <div></div>
                    <div>Holding ({tokenSymbol})</div>
                    <div>Borrowable (ETH)</div>
                  </div>
                  <div className="flex flex-col gap-2 sm:gap-0">
                    {balances?.map((balance, index) => (
                      <LoanTableRow
                        key={index}
                        index={index}
                        revnetId={projectId}
                        chainId={balance.chainId}
                        terminalAddress={primaryNativeTerminal.data as `0x${string}`}
                        // terminalAddress={"0x50C8f58DAa6E92E2a8E4AeC5e530B717B4B1FfB3"}
                        tokenAddress={"0x000000000000000000000000000000000000EEEe"}
                        decimals={18}
                        currency={61166n}
                        collateralCount={balance.balance.value}
                        tokenSymbol={tokenSymbol}
                        // If LoanTableRow uses grid-cols-5, it should be updated to grid-cols-3
                      />
                    ))}
                  </div>
                </div>
              </div>
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
            {/* You'll Receive section - always visible, above the Fee Structure Over Time button */}
            <div className="mb-2 p-3 bg-zinc-50 rounded-md border border-zinc-200">
              <h3 className="text-sm font-medium text-zinc-700 mb-1">You'll Receive</h3>
              <p className="font-semibold text-md text-zinc-500 leading-tight">
                {borrowableAmount > 0
                  ? (borrowableAmount - (borrowableAmount * (parseFloat(prepaidPercent) / 100))).toFixed(8)
                  : "0.00000000"}{" "}
                ETH
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Borrowing {borrowableAmount.toFixed(8)} ETH minus {prepaidPercent}% prepaid fee
              </p>
            </div>
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
              <div className="mt-2">
                {/* Prepaid Fee Slider */}
                <div className="mt-2 mb-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Prepaid Fee: {prepaidPercent}%
                  </label>
                  <input
                    type="range"
                    min="2.5"
                    max="50"
                    step="2.5"
                    value={prepaidPercent}
                    onChange={(e) => setPrepaidPercent(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Less upfront cost</span>
                    <span>More upfront cost</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={feeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="year"
                        label={{ value: "Time (years)", position: "insideBottom", offset: -5 }}
                        type="number"
                        domain={[0, 10]}
                        ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                        tickFormatter={(year) => `${year}y`}
                      />
                      <YAxis
                        label={{
                          value: "Total Cost to Repay (ETH)",
                          angle: -90,
                          position: "insideLeft",
                          offset: 0,
                          style: { textAnchor: "middle" }
                        }}
                        domain={[0, (dataMax: number) => dataMax * 1.4]}
                        tick={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value.toFixed(6)} ETH`,
                          `Loan Cost (from full loan: ${(rawBorrowableAmount || 0).toFixed(4)} ETH)`
                        ]}
                        labelFormatter={(label: number) => {
                          const months = Math.round(label * 12);
                          const years = Math.floor(months / 12);
                          const remMonths = months % 12;
                          return `${months} months (${years}y ${remMonths}m)`;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalCost"
                        stroke="#71717a"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Fees increase after{" "}
                  {displayYears > 0
                    ? `${displayYears} year${displayYears > 1 ? "s" : ""}${displayMonths > 0 ? ` and ${displayMonths} month${displayMonths > 1 ? "s" : ""}` : ""}`
                    : `${displayMonths} month${displayMonths > 1 ? "s" : ""}`}
                </p>
                <p className="text-xs text-center text-zinc-500 mt-1">
                  Based on full loan amount before fixed fee: {(rawBorrowableAmount || 0).toFixed(6)} ETH
                </p>
              </div>
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

                  const feeBasisPoints = Math.round(parseFloat(prepaidPercent) * 100);

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

                  const args = [
                    projectId,
                    {
                      token: "0x000000000000000000000000000000000000EEEe",
                      terminal: primaryNativeTerminal.data as `0x${string}`,
                    },
                    0n,
                    BigInt(Math.floor(Number(collateralAmount) * 1e18)),
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