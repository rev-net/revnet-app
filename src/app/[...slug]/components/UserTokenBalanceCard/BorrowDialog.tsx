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
  DEFAULT_METADATA,
  JB_CHAINS,
  JBProjectToken,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  jbPermissionsAbi,
  readJbPermissionsHasPermission
} from "juice-sdk-core";

const jbPermissionsAddress: Record<number, `0x${string}`> = {
  8453: "0xF5CA295dc286A176E35eBB7833031Fd95550eb14", // Base Mainnet
  1: "0xF5CA295dc286A176E35eBB7833031Fd95550eb14", // Ethereum Mainnet
  10: "0xF5CA295dc286A176E35eBB7833031Fd95550eb14", // Optimism Mainnet
  42161: "0xF5CA295dc286A176E35eBB7833031Fd95550eb14", // Arbitrum Mainnet
};

import {
  JBChainId,
  NativeTokenValue,
  useJBContractContext,
  useSuckersUserTokenBalance,
  useTokenCashOutQuoteEth,
} from "juice-sdk-react";
import { revLoansAddress } from "revnet-sdk";
import { useReadRevLoansBorrowableAmountFrom, useWriteRevLoansBorrowFrom, useReadRevLoansLoanOf } from "revnet-sdk";
import { useWalletClient } from "wagmi";
import { PropsWithChildren, useState, useEffect } from "react";
import { Address, parseUnits, encodeAbiParameters } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";

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
  const [redeemAmount, setRedeemAmount] = useState<string>("");
  const [loanDuration, setLoanDuration] = useState<string>("12");
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: balances } = useSuckersUserTokenBalance();
  const rawBalance =
    balances?.find((b) => BigInt(b.projectId) === projectId)?.balance.value ?? 0n;
  //const userTokenBalanceForProject = rawBalance / 10n ** 18n;
  const userTokenBalanceForProject = rawBalance;

  console.log("📥 User collateral count:", userTokenBalanceForProject.toString());

  const [cashOutChainId, setCashOutChainId] = useState<string>();
  console.log(
    "💎 Selected chainId:",
    cashOutChainId,
    " ",
    "User token balance:",          projectId,
    userTokenBalanceForProject);

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
  console.log("💥 borrowableAmountFrom error:", borrowableError);
  console.log(
    "💎 Borrowable amount KMAC:", borrowableAmount?.toString());
  useEffect(() => {
    if (!cashOutChainId && !disabled && (balances?.length ?? 0) > 0) {
      const chainWithTokens = balances?.find((b) => b.balance.value > 0n);
      if (chainWithTokens) {
        setCashOutChainId(chainWithTokens.chainId.toString());
      }
    }
  }, [balances, cashOutChainId, disabled]);

  useEffect(() => {
    if (
      cashOutChainId &&
      !JB_CHAINS[Number(cashOutChainId) as JBChainId]?.chain // ?? terminal
    ) {
      console.warn("Selected chain may not have a valid terminal");
    }
  }, [cashOutChainId]);

  const redeemAmountBN = redeemAmount
    ? JBProjectToken.parse(redeemAmount, 18).value
    : 61166n;

  const cappedRedeemAmountBN = borrowableAmount !== undefined
    ? redeemAmountBN > borrowableAmount
      ? borrowableAmount
      : redeemAmountBN
    : redeemAmountBN;

  const MAX_PREPAID_FEE_PERCENT_BIGINT = 500n;
  const MIN_PREPAID_FEE = 25n;
  // each month is about 0.04% extra on fee list duration tdc
  // The divisor (max months) as a BigInt for the calculation.
  const MAX_PREPAYMENT_MONTHS_BIGINT = 120n;

  const {
    writeContract,
    isPending: isWriteLoading,
    data,
  } = useWriteRevLoansBorrowFrom();

  // After borrowing, fetch the loan details if loanId is available
  const loanId = data ? BigInt(data) : undefined;

  const { data: loanData } = useReadRevLoansLoanOf({
    chainId: Number(cashOutChainId) as JBChainId,
    args: [loanId ?? 0n],
  });

  const txHash = data;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { data: redeemQuote } = useTokenCashOutQuoteEth(redeemAmountBN, {
    chainId: Number(cashOutChainId) as JBChainId,
  });


  const loading = isWriteLoading || isTxLoading;
  const selectedBalance = balances?.find(
    (b) => b.chainId === Number(cashOutChainId)
  );
  const valid =
    redeemAmountBN > 0n &&
    (selectedBalance?.balance.value ?? 0n) >= redeemAmountBN;

  const lockMonths = loanDuration;
  const feePercent = Number(calcPrepaidFee(Number(lockMonths)));
  console.log("📈 Calculated feePercent:", feePercent);
  const clampedFee = Math.min(Math.max(feePercent, 0), 100);
  const adjustedRedeemQuote = redeemQuote
    ? (redeemQuote * BigInt(100 - clampedFee)) / 100n
    : null;

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
          <DialogDescription>
            <div className="my-4">
              {isSuccess ? (
                <div>
                  <div className="mb-3 font-medium">Success! Loan created.</div>
                </div>
              ) : (
                <>
                  <div className="mb-5 w-[65%]">
                    <span className="text-sm text-black font-medium">
                      {" "}
                      Your {tokenSymbol}
                    </span>
                    <div className="mt-1 border border-zinc-200 p-3 bg-zinc-50">
                      {balances?.map((balance, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          {JB_CHAINS[balance.chainId as JBChainId].name}
                          <span className="font-medium">
                            {balance.balance?.format(6)} {tokenSymbol}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="amount" className="text-zinc-900">
                      Pledge collateral
                    </Label>
                    <div className="grid grid-cols-7 gap-2">
                      <div className="col-span-4">
                        <div className="relative">
                          <Input
                            id="amount"
                            name="amount"
                            value={redeemAmount}
                            placeholder="Enter amount"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*\.?\d*$/.test(value)) {
                                setRedeemAmount(value);
                                const floatVal = parseFloat(value);
                                if (!isNaN(floatVal)) {
                                  const newRedeemAmountBN = JBProjectToken.parse(value, 18).value;
                                }
                                if (
                                  !isNaN(floatVal) &&
                                  borrowableAmount !== undefined &&
                                  floatVal > Number(borrowableAmount) / 1e18
                                ) {
                                  console.warn("🔴 Input exceeds borrowable amount");
                                }
                              }
                            }}
                          />
                          <div
                            className={
                              "pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 z-10"
                            }
                          >
                            <span className="text-zinc-500 sm:text-md">
                              {tokenSymbol}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <Select onValueChange={(v) => setCashOutChainId(v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select chain" />
                          </SelectTrigger>
                          <SelectContent>
                            {balances
                              ?.filter((b) => b.balance.value > 0n)
                              .map((balance) => {
                                return (
                                  <SelectItem
                                    value={balance.chainId.toString()}
                                    key={balance.chainId}
                                  >
                                    <div className="flex items-center gap-2">
                                      <ChainLogo
                                        chainId={balance.chainId as JBChainId}
                                      />
                                      {
                                        JB_CHAINS[balance.chainId as JBChainId]
                                          .name
                                      }
                                    </div>
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="border-t border-zinc-200 pt-4 mt-4 text-zinc-600 text-sm">
                      {redeemAmount && redeemAmountBN > 0n && valid ? (
                        <div className="text-base">
                        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-zinc-700">Payback loan in {lockMonths} months</span>
                          </div>
                          <Slider
                            min={3}
                            max={120}
                            step={1}
                            value={[Number(lockMonths)]}
                            onValueChange={([v]) => {
                              setLoanDuration(v.toString());
                            }}
                          />
                          {borrowableAmount !== undefined && (
                            <div className="font-medium mt-2 text-zinc-700">
                              Maximum borrowable amount: <NativeTokenValue wei={borrowableAmount} decimals={18} />
                            </div>
                          )}
                          <div>
                            Based on current terms, you’ll receive{" "}
                            {adjustedRedeemQuote !== null && (
                              <span className="font-semibold">
                                <NativeTokenValue wei={adjustedRedeemQuote} decimals={8} /> {tokenSymbol}
                              </span>
                            )}
                          </div>
                        </div>
                        </div>
                      ) : null}
                      <div className="mt-2 text-sm text-muted-foreground">
                        Any more time will cost increasingly more over time. After 10 years, you can't get your {tokenSymbol} back
                      </div>
                      <div className="mt-2 flex items-center space-x-1 text-sm text-muted-foreground">
                        <span>[ ? ]</span>
                        <span>▶</span>
                      </div>
                    </div>
                  </div>

                  {redeemAmount && cashOutChainId && !valid ? (
                    <div className="text-red-500 mt-4">
                      Insuffient {tokenSymbol} on{" "}
                      {JB_CHAINS[Number(cashOutChainId) as JBChainId].name}
                    </div>
                  ) : null}

                  {isTxLoading ? (
                    <div>Transaction submitted, awaiting confirmation...</div>
                  ) : null}
                </>
              )}
            </div>
          </DialogDescription>
          <DialogFooter>
            {!isSuccess ? (
              <ButtonWithWallet
                targetChainId={Number(cashOutChainId) as JBChainId}
                loading={loading}
                onClick={async () => {
                  if (!primaryNativeTerminal?.data) {
                    console.error("no terminal");
                    return;
                  }

                  if (!(address && redeemAmountBN)) {
                    console.error("incomplete args");
                    return;
                  }

                  const prepaidFeePercent = feePercent;
                  const metadata = encodeAbiParameters(
                    [{ name: "feePercent", type: "uint256" }],
                    [BigInt(prepaidFeePercent)]
                  );

                  console.log("📝 user input redeemAmount:", redeemAmount);
                  console.log("🔢 requested tokenCount:", redeemAmountBN.toString());
                  console.log("💰 capped tokenCount:", cappedRedeemAmountBN.toString());
                  console.log("📊 borrowableAmount:", borrowableAmount?.toString());

                  const args = [
                    projectId,
                    {
                      token: NATIVE_TOKEN as `0x${string}`,
                      terminal: primaryNativeTerminal.data as `0x${string}`,
                    },
                    0n, //cappedRedeemAmountBN, // minBorrowAmount
                    redeemAmountBN,        // collateralCount (from 'pledge' input)
                    address as `0x${string}`,
                    BigInt(feePercent),
                  ] as const;

                  // Logging for checking borrowable amount context just before the hook is used.
                  console.log("💎 Checking borrowableAmount for project", projectId.toString(), "with", userTokenBalanceForProject.toString(), "collateral");

                  // Guard the contract write execution by checking if borrowableAmount exists and is greater than 0n.
                  if (!borrowableAmount || borrowableAmount === 0n) {
                    console.error("No collateral or nothing borrowable");
                    return;
                  }

                  // ---- Grant burn permission to RevLoans ----
                  const permissionIds = [1]; // BURN_TOKENS
                  const permissionsData = {
                    operator: revLoansAddress[Number(cashOutChainId) as JBChainId],
                    projectId: projectId,
                    permissionIds: permissionIds as readonly number[],
                  };

                  console.log("🔐 Granting burn permission to", permissionsData.operator);

                  await walletClient?.writeContract({
                    account: address,
                    address: jbPermissionsAddress[Number(cashOutChainId) as JBChainId],
                    abi: jbPermissionsAbi,
                    functionName: "setPermissionsFor",
                    args: [address as `0x${string}`, permissionsData],
                  });

                  console.log("✅ Permission granted!");
                  // ---- End permission logic ----

                  console.log("⏩ redeem args", args);
                  console.log("🏁 writeContract ready?", !!writeContract);
                  console.log("📦 args", args);
                  console.log("🔗 chainId", cashOutChainId);

                  writeContract?.({
                    chainId: Number(cashOutChainId) as JBChainId,
                    args,
                  });
                }}
              >
                Snag a loan
              </ButtonWithWallet>
            ) : null}
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
