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
  const [collateralAmount, setCollateralAmount] = useState("");
  const [prepaidPercent, setPrepaidPercent] = useState("2.5");
  const [borrowableAmount, setBorrowableAmount] = useState(0);

  const [cashOutChainId, setCashOutChainId] = useState<string>();

  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: balances } = useSuckersUserTokenBalance();

  const rawBalance =
    balances?.find((b) => BigInt(b.projectId) === projectId)?.balance.value ?? 0n;
  const userTokenBalanceForProject = rawBalance;

  const { data: resolvedPermissionsAddress } = useReadRevDeployerPermissions({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
  });

  const { data: totalCollateralRaw } = useReadRevLoansTotalCollateralOf({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
    args: cashOutChainId ? [projectId] : undefined,
  });

  useEffect(() => {
    if (totalCollateralRaw !== undefined) {
      const totalCollateralEth = Number(totalCollateralRaw) / 1e18;
      console.log("Total Collateral for project:", totalCollateralEth.toFixed(5), "ETH");
    }
  }, [totalCollateralRaw]);

  const selectedBalance = balances?.find(
    (b) => b.chainId === Number(cashOutChainId)
  );

  useEffect(() => {
    console.log("projectId:", projectId);
    console.log("cashOutChainId:", cashOutChainId);
    console.log("userTokenBalanceForProject:", userTokenBalanceForProject);
    console.log("NATIVE_TOKEN_DECIMALS:", NATIVE_TOKEN_DECIMALS);
  }, [cashOutChainId]);

  // Borrowable amount hook (expanded version)
  const {
    data: borrowableAmountRaw,
    error: borrowableError,
    isLoading: isBorrowableLoading,
  } = useReadRevLoansBorrowableAmountFrom({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
    args: cashOutChainId
      ? [
          projectId,
          userTokenBalanceForProject,
          BigInt(NATIVE_TOKEN_DECIMALS),
          61166n,
        ] as const
      : undefined,
  });

  // --- Write and Transaction Hooks for Borrowing ---
  const {
    writeContract,
    isPending: isWriteLoading,
    data,
  } = useWriteRevLoansBorrowFrom();

  const txHash = data;

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const loading = isWriteLoading || isTxLoading;

  useEffect(() => {
    if (borrowableAmountRaw !== undefined) {
      console.log("Borrowable amount (wei):", borrowableAmountRaw.toString());
      console.log("Borrowable amount (ETH):", (Number(borrowableAmountRaw) / 1e18).toFixed(5));
    }
  }, [borrowableAmountRaw]);

  useEffect(() => {
    if (borrowableAmountRaw === undefined) {
      console.warn("borrowableAmount is undefined");
    } else {
      console.log("borrowableAmount:", borrowableAmountRaw);
      setBorrowableAmount(Number(borrowableAmountRaw) / 1e18);
    }
  }, [borrowableAmountRaw]);

  // Calculate net capital after prepaid fee
  const netCapital = borrowableAmount - (borrowableAmount * (parseInt(prepaidPercent || "0") / 100));

  // Generate fee curve data with actual bug behavior
  const generateFeeData = () => {
    const MAX_YEARS = 10;
    const prepaidDuration = (parseInt(prepaidPercent) / 50) * MAX_YEARS;
    const prepaidAmount = borrowableAmount * (parseInt(prepaidPercent) / 100);
    const unprepaidAmount = borrowableAmount - prepaidAmount;

    const data = [];
    for (let year = 0; year <= MAX_YEARS; year += 0.1) { // Finer granularity
      let totalCost;

      if (year < prepaidDuration) {
        // During prepaid period, only the original amount (no additional fees)
        totalCost = borrowableAmount;
      } else if (year < MAX_YEARS) {
        // After prepaid but before liquidation
        const timeAfterPrepaid = year - prepaidDuration;
        const remainingTime = MAX_YEARS - prepaidDuration;
        const feeRate = timeAfterPrepaid / remainingTime;
        const fullSourceFeeAmount = unprepaidAmount * feeRate;

        // This is the bug! amountInFull should just be loan.amount
        // But the code adds fullSourceFeeAmount to it
        const amountInFull = borrowableAmount + fullSourceFeeAmount;

        // Calculate the proportional fee using the buggy calculation
        const additionalFee = (fullSourceFeeAmount * borrowableAmount) / amountInFull;
        totalCost = borrowableAmount + additionalFee;
      } else {
        // At or after liquidation, full unprepaid amount is lost
        totalCost = borrowableAmount + unprepaidAmount;
      }

      data.push({
        year: year,
        totalCost: totalCost
      });
    }
    return data;
  };

  const handleBorrow = () => {
    const borrowParams = {
      revnetId: 123,
      source: {
        terminal: "0x...",
        token: "0x...",
      },
      minBorrowAmount: netCapital * 0.95, // Allow for 5% slippage
      collateralCount: parseInt(collateralAmount),
      beneficiary: "0x...",
      prepaidFeePercent: parseInt(prepaidPercent) * 10,
    };

    console.log("Calling borrowFrom with:", borrowParams);
  };

  const feeData = generateFeeData();

  const prepaidMonths = (parseInt(prepaidPercent || "0") / 50 * 10) * 12;
  const displayYears = Math.floor(prepaidMonths / 12);
  const displayMonths = Math.round(prepaidMonths % 12);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Snag a Loan</DialogTitle>
          <DialogDescription asChild>
            <section className="my-4">
              <div className="space-y-6">
                {/* Left side - Inputs */}
                <div>
                  {/* Network selector and collateral input, new layout */}
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="amount" className="block text-gray-700 text-sm font-bold mt-2">
                      Collateralize from
                    </Label>
                    <div className="grid grid-cols-7 gap-2">
                      <div className="col-span-3">
                        <Select onValueChange={(v) => setCashOutChainId(v)}>
                          <SelectTrigger>
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
                      <div className="col-span-4">
                        <div className="w-full border rounded-md px-3 py-2 bg-white text-sm text-zinc-900 flex items-center h-10">
                          {cashOutChainId && selectedBalance
                            ? (Number(selectedBalance.balance.value) / 1e18).toFixed(4) + ` ${tokenSymbol}`
                            : "Enter amount"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prepaid Fee Slider */}
                  <div className="mt-6 mb-6">
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

                  {/* Loan Preview */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-md">
                    <h3 className="font-bold mb-2">You'll Receive</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {borrowableAmount > 0
                        ? (borrowableAmount - (borrowableAmount * (parseFloat(prepaidPercent) / 100))).toFixed(4)
                        : "0.0000"}{" "}
                      ETH
                    </p>
                    <p className="text-sm text-gray-600">
                      Escrow: {borrowableAmount.toFixed(4)} ETH minus {prepaidPercent}% prepaid fee
                    </p>
                  </div>

                  {/* Borrow Button */}
                  <DialogFooter>
                    <ButtonWithWallet
                      targetChainId={cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined}
                      loading={false}
                      onClick={async () => {
                        if (!walletClient) {
                          console.error("walletClient not ready");
                          return;
                        }

                        if (!primaryNativeTerminal?.data) {
                          console.error("No terminal");
                          return;
                        }

                        if (!address || !borrowableAmountRaw || !resolvedPermissionsAddress) {
                          console.error("Missing address, borrowable amount, or permissions address");
                          return;
                        }

                        const feeBasisPoints = Math.round(parseFloat(prepaidPercent) * 100);

                        console.log("Setting permissions via setPermissionsFor...");

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

                        console.log("Permissions set. Now calling borrowFrom...");

                        const args = [
                          projectId,
                          {
                            token: "0x000000000000000000000000000000000000EEEe",
                            terminal: primaryNativeTerminal.data as `0x${string}`,
                          },
                          0n,
                          borrowableAmountRaw,
                          address as `0x${string}`,
                          BigInt(feeBasisPoints),
                        ] as const;

                        if (!writeContract) {
                          console.error("writeContract is not available");
                          return;
                        }
                        console.log("Calling writeContract with args:", {
                          chainId: Number(cashOutChainId),
                          args
                        });
                        writeContract({
                          chainId: Number(cashOutChainId) as JBChainId,
                          args,
                        });
                      }}
                    >
                      Borrow some ETH
                      {/* Borrow {netCapital.toFixed(2)} ETH */}
                    </ButtonWithWallet>
                  </DialogFooter>

                    <div>
                      <h3 className="font-bold mb-2">Fee Structure Over Time</h3>
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
                              label={{ value: "Total Cost (ETH)", angle: -90, position: "insideLeft" }}
                              domain={[0, "dataMax"]}
                            />
                            <Tooltip
                              formatter={(value: number, name: string) => [`${value.toFixed(4)} ETH`, "Total Cost"]}
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
                              stroke="#2563eb"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Fees increase after{" "}
                        {displayYears > 0
                          ? `${displayYears} year${displayYears > 1 ? "s" : ""}${displayMonths > 0 ? ` and ${displayMonths} month${displayMonths > 1 ? "s" : ""}` : ""}`
                          : `${displayMonths} month${displayMonths > 1 ? "s" : ""}`}
                      </p>
                    </div>
                </div>

              </div>

              {/* Key Information */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-md">
                <h3 className="font-bold mb-2">Important Information</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    • Your{" "}
                    {cashOutChainId && selectedBalance
                      ? `${(Number(selectedBalance.balance.value) / 1e18).toFixed(4)} ${tokenSymbol}`
                      : "0"} tokens will be burned as collateral
                  </li>
                  <li>• You'll receive an NFT to reclaim them when repaying</li>
                  <li>• After 10 years, loan is liquidated and collateral is lost</li>
                </ul>
              </div>

              {/* Chain Detail Information - might remove */}
                {/* Available Balances Table */}
                <div className="mt-6">
                    <h3 className="font-bold mb-2">Available Balances</h3>
                    <div className="mt-1 border border-zinc-200 p-3 bg-zinc-50">
                    <div className="grid grid-cols-5 gap-3 text-sm font-medium text-zinc-600 mb-1">
                        <div></div>
                        <div>Holding ({tokenSymbol})</div>
                        <div>Borrowable (ETH)</div>
                    </div>
                    </div>
                </div>
              {balances?.map((balance, index) => (
                <LoanTableRow
                  key={index}
                  index={index}
                  revnetId={projectId}
                  chainId={balance.chainId}
                  terminalAddress={"0x50C8f58DAa6E92E2a8E4AeC5e530B717B4B1FfB3"}
                  tokenAddress={"0x000000000000000000000000000000000000EEEe"}
                  decimals={18}
                  currency={61166n}
                  collateralCount={balance.balance.value}
                  tokenSymbol={tokenSymbol}
                />
              ))}
            </section>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}