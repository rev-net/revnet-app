import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FixedInt } from "fpnum";
import {
  JB_CHAINS,
  JBProjectToken,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  jbPermissionsAbi,
} from "juice-sdk-core";
import {
  JBChainId,
  NativeTokenValue,
  useJBContractContext,
  useSuckersUserTokenBalance,
  useTokenCashOutQuoteEth,
} from "juice-sdk-react";
import {
  revLoansAddress,
  useReadRevLoansBorrowableAmountFrom,
  useWriteRevLoansBorrowFrom,
  useReadRevLoansController,
  useReadRevDeployerPermissions,
  useReadRevLoansTotalCollateralOf,
} from "revnet-sdk";
import { PropsWithChildren, useState, useEffect } from "react";
import { Address, encodeAbiParameters } from "viem";
import { useWalletClient } from "wagmi";

import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { LoanTableRow } from "./LoanTableRow";
import { LoanValueChart } from "@/components/charts/LoanValueChart";

export function BorrowDialog({
  projectId,
  creditBalance,
  tokenSymbol,
  primaryTerminalEth,
  disabled,
  children,
}: PropsWithChildren<{
  creditBalance: FixedInt<number>;
  tokenSymbol: string;
  projectId: bigint;
  primaryTerminalEth: Address;
  disabled?: boolean;
}>) {
  // Define revnetId as const
  const revnetId = projectId;
  const MAX_PREPAID_FEE_PERCENT_BIGINT = 50_00n;
  const MIN_PREPAID_FEE = 250n; // 2.5%
  const MIN_PREPAYMENT_MONTHS = 3n;
  // each month is about 0.04% extra on fee list duration tdc
  // The divisor (max months) as a BigInt for the calculation.
  const MAX_PREPAYMENT_MONTHS_BIGINT = 120n;
  // FEE SLIDER STATE & DERIVED MONTHS
  const [feeBasisPoints, setFeeBasisPoints] = useState<number>(250);
  const [loanDuration, setLoanDuration] = useState<number>(() => {
    // derive months from feeBasisPoints at initial mount
    return Math.round(
      ((250 - Number(MIN_PREPAID_FEE)) * (Number(MAX_PREPAYMENT_MONTHS_BIGINT) - Number(MIN_PREPAYMENT_MONTHS))) /
      Number(MAX_PREPAID_FEE_PERCENT_BIGINT - MIN_PREPAID_FEE)
    ) + Number(MIN_PREPAYMENT_MONTHS);
  });
  // Whenever feeBasisPoints changes, update loanDuration accordingly
  useEffect(() => {
    const months = Math.round(
      ((feeBasisPoints - Number(MIN_PREPAID_FEE)) * (Number(MAX_PREPAYMENT_MONTHS_BIGINT) - Number(MIN_PREPAYMENT_MONTHS))) /
      Number(MAX_PREPAID_FEE_PERCENT_BIGINT - MIN_PREPAID_FEE)
    ) + Number(MIN_PREPAYMENT_MONTHS);
    setLoanDuration(months);
  }, [feeBasisPoints]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: balances } = useSuckersUserTokenBalance();
  const rawBalance =
    balances?.find((b) => BigInt(b.projectId) === projectId)?.balance.value ?? 0n;
  const userTokenBalanceForProject = rawBalance;
  const [cashOutChainId, setCashOutChainId] = useState<string>();

  const { data: resolvedPermissionsAddress } = useReadRevDeployerPermissions({
    chainId: cashOutChainId ? Number(cashOutChainId) as JBChainId : undefined,
  });

  const {
    data: borrowableAmount,
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

  // Fetch and log total collateral for the project
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

  const redeemAmountBN = selectedBalance
    ? selectedBalance.balance.value
    : 61166n;

  const cappedRedeemAmountBN = borrowableAmount !== undefined
    ? redeemAmountBN > borrowableAmount
      ? borrowableAmount
      : redeemAmountBN
    : redeemAmountBN;


  const {
    writeContract,
    isPending: isWriteLoading,
    data,
  } = useWriteRevLoansBorrowFrom();

  const txHash = data;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { data: redeemQuote } = useTokenCashOutQuoteEth(redeemAmountBN, {
    chainId: Number(cashOutChainId) as JBChainId,
  });


  const loading = isWriteLoading || isTxLoading;
  const valid =
    redeemAmountBN > 0n &&
    (selectedBalance?.balance.value ?? 0n) >= redeemAmountBN;

  // feeBasisPoints is now state, clamped to 250-5000
  const clampedFee = Math.min(Math.max(feeBasisPoints, 250), 5000);
  const adjustedRedeemQuote = redeemQuote
    ? (redeemQuote * BigInt(10000 - clampedFee)) / 10000n
    : null;
  const loanCost =
    redeemQuote && adjustedRedeemQuote
      ? Number(redeemQuote - adjustedRedeemQuote) / 1e18
      : 0;
  console.log("borrowableAmount", (Number(borrowableAmount)).toFixed(5));
  console.log("redeemQuote", adjustedRedeemQuote?.toString());
  function calcPrepaidFee(monthsToPrePay: number): bigint {
    const calcd =
      (BigInt(monthsToPrePay) * MAX_PREPAID_FEE_PERCENT_BIGINT) /
        MAX_PREPAYMENT_MONTHS_BIGINT +
      MIN_PREPAID_FEE;

    if (calcd < MIN_PREPAID_FEE) {
      return MIN_PREPAID_FEE;
    } else if (calcd > MAX_PREPAID_FEE_PERCENT_BIGINT) {
      return MAX_PREPAID_FEE_PERCENT_BIGINT;
    } else {
      return calcd;
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Snag a loan</DialogTitle>
          <DialogDescription asChild>
            <section className="my-4">

              {/* Collateral input and chain selection */}
              <div className="grid w-full gap-1.5">
                <Label htmlFor="amount" className="mt-2 text-zinc-900">
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
                    <div className="relative hidden">
                      <Input
                        id="amount"
                        name="amount"
                        value={
                          selectedBalance
                            ? (Number(selectedBalance.balance.value) / 1e18).toFixed(4)
                            : ""
                        }
                        placeholder="Enter amount"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value)) {
                            // no setRedeemAmount since removed
                          }
                        }}
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 z-10">
                        <span className="text-zinc-500 sm:text-md">{tokenSymbol}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview section */}
              {redeemAmountBN > 0n && valid && (
                <div className="space-y-3 text-sm text-zinc-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Collateral Amount (tokens)</span>
                    <span className="font-semibold">
                      {selectedBalance ? `${(Number(selectedBalance.balance.value) / 1e18).toFixed(5)} ${tokenSymbol}` : ""}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Prepaid Fee</span>
                    <span className="font-semibold">{(feeBasisPoints / 100).toFixed(2)}%</span>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground italic">
                    <span>Less upfront cost</span>
                    <span>More upfront cost</span>
                  </div>
                  <Slider
                    min={250}
                    max={5000}
                    step={250}
                    value={[feeBasisPoints]}
                    onValueChange={([v]) => setFeeBasisPoints(v)}
                  />

                  <div className="pt-2">
                    <div className="font-medium text-zinc-700">You'll Receive</div>
                    <div className="text-lg font-semibold text-black">
                      {adjustedRedeemQuote !== null
                        ? `${(Number(adjustedRedeemQuote) / 1e18).toFixed(5)} ETH`
                        : ""}
                    </div>
                  <div className="text-xs text-muted-foreground">
                    Borrowing {borrowableAmount ? (Number(borrowableAmount) / 1e18).toFixed(5) : "—"} ETH minus {feeBasisPoints / 100}% prepaid fee
                  </div>
                  </div>
                  {/* Chart showing loan value based on months */}
                  <LoanValueChart
                    prepaidMonths={loanDuration}
                    borrowableAmount={borrowableAmount ? Number(borrowableAmount) / 1e18 : 0}
                  />
                </div>
              )}

              {/* Status & debug */}
              {isSuccess ? (
                <div className="mb-3 font-medium">Success! Loan created.</div>
              ) : (
                <>
                  <div className="mb-5 mt-4 w-full">
                    <span className="text-sm mt-8 text-black font-medium">Your {tokenSymbol}</span>
                    <div className="mt-1 border border-zinc-200 p-3 bg-zinc-50">
                      <div className="grid grid-cols-5 gap-3 text-sm font-medium text-zinc-600 mb-1">
                        <div></div>
                        <div>Holding ({tokenSymbol})</div>
                        <div>Borrowable (ETH)</div>
{/*                         <div>Active Loans</div>
                        <div>Oustanding Debt</div> */}
                      </div>
                      {balances?.map((balance, index) => (
                        <LoanTableRow
                          key={index}
                          index={index}
                          revnetId={revnetId}
                          chainId={balance.chainId}
                          terminalAddress={"0x50C8f58DAa6E92E2a8E4AeC5e530B717B4B1FfB3"}
                          tokenAddress={"0x000000000000000000000000000000000000EEEe"}
                          decimals={18}
                          currency={61166n}
                          collateralCount={balance.balance.value}
                          tokenSymbol={tokenSymbol}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center space-x-1 text-sm text-muted-foreground">
                    <span>[ ? ]</span>
                    <span>▶</span>
                  </div>
                  </div>
                  {cashOutChainId && !valid && (
                    <div className="text-red-500 mt-4">
                      Insuffient {tokenSymbol} on {JB_CHAINS[Number(cashOutChainId) as JBChainId].name}
                    </div>
                  )}
                  {isTxLoading && (
                    <div>Transaction submitted, awaiting confirmation...</div>
                  )}
                </>
              )}
            </section>
          </DialogDescription>
          <DialogFooter>
            {!isSuccess && (
              <ButtonWithWallet
                targetChainId={Number(cashOutChainId) as JBChainId}
                loading={loading}
                onClick={async () => {
                  if (!primaryNativeTerminal?.data) return console.error("no terminal");
                  if (!(address && redeemAmountBN)) return console.error("incomplete args");

                  const metadata = encodeAbiParameters(
                    [{ name: "feePercent", type: "uint256" }],
                    [BigInt(feeBasisPoints)]
                  );

                  const args = [
                    projectId,
                    {
                      token: NATIVE_TOKEN as `0x${string}`,
                      terminal: primaryNativeTerminal.data as `0x${string}`,
                    },
                    0n,
                    redeemAmountBN,

                    address as `0x${string}`,
                    BigInt(feeBasisPoints),
                  ] as const;

                  if (!borrowableAmount || borrowableAmount === 0n) {
                    console.error("No collateral or nothing borrowable");
                    return;
                  }

                  await walletClient?.writeContract({
                    account: address,
                    address: resolvedPermissionsAddress as `0x${string}`,
                    abi: jbPermissionsAbi,
                    functionName: "setPermissionsFor",
                    args: [
                      address as `0x${string}`,
                      {
                        operator: revLoansAddress[Number(cashOutChainId) as JBChainId],
                        projectId: projectId,
                        permissionIds: [1],
                      },
                    ],
                  });

                  writeContract?.({
                    chainId: Number(cashOutChainId) as JBChainId,
                    args,
                  });
                }}
              >
                Snag a loan
              </ButtonWithWallet>
            )}
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
