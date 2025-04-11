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
} from "juice-sdk-core";
import {
  JBChainId,
  NativeTokenValue,
  useJBContractContext,
  useSuckersUserTokenBalance,
  useTokenCashOutQuoteEth,
  useWriteJbMultiTerminalCashOutTokensOf,
} from "juice-sdk-react";
import { PropsWithChildren, useState } from "react";
import { Address, parseUnits } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";

export function RedeemDialog({
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
  const [redeemAmount, setRedeemAmount] = useState<string>();
  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { address } = useAccount();
  const { data: balances } = useSuckersUserTokenBalance();
  const [cashOutChainId, setCashOutChainId] = useState<string>();

  /**
   *       address holder,
        uint256 projectId,
        address tokenToReclaim,
        uint256 cashOutCount,
        uint256 minTokensReclaimed,
        address payable beneficiary,
   */

  const redeemAmountBN = redeemAmount
    ? JBProjectToken.parse(redeemAmount, 18).value
    : 0n;

  const {
    writeContract,
    isPending: isWriteLoading,
    data,
  } = useWriteJbMultiTerminalCashOutTokensOf();

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

  return (
    <Dialog open={disabled === true ? false : undefined}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cash out</DialogTitle>
          <DialogDescription>
            <div className="my-4">
              {isSuccess ? (
                <div>Success! You can close this window.</div>
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
                      Cash out amount
                    </Label>
                    <div className="grid grid-cols-7 gap-2">
                      <div className="col-span-4">
                        <div className="relative">
                          <Input
                            id="amount"
                            name="amount"
                            value={redeemAmount}
                            onChange={(e) => setRedeemAmount(e.target.value)}
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
                  </div>

                  {redeemAmount && cashOutChainId && !valid ? (
                    <div className="text-red-500 mt-4">
                      Insuffient {tokenSymbol} on{" "}
                      {JB_CHAINS[Number(cashOutChainId) as JBChainId].name}
                    </div>
                  ) : null}

                  {redeemAmount && redeemAmountBN > 0n && valid ? (
                    <div className="text-base mt-4">
                      You'll get:{" "}
                      {redeemQuote ? (
                        <span className="font-medium">
                          <NativeTokenValue wei={redeemQuote} decimals={8} />
                        </span>
                      ) : (
                        <>...</>
                      )}
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
                onClick={() => {
                  if (!primaryNativeTerminal?.data) {
                    console.error("no terminal");
                    return;
                  }

                  if (!(address && redeemAmountBN)) {
                    console.error("incomplete args");
                    return;
                  }

                  const args = [
                    address, // holder
                    projectId, // project id
                    redeemAmount
                      ? parseUnits(redeemAmount, NATIVE_TOKEN_DECIMALS)
                      : 0n, // cash out count
                    NATIVE_TOKEN, // token to reclaim
                    0n, // min tokens reclaimed
                    address, // beneficiary
                    DEFAULT_METADATA, // metadata
                  ] as const;

                  console.log("⏩ redeem args", args);

                  writeContract?.({
                    chainId: Number(cashOutChainId) as JBChainId,
                    address: primaryNativeTerminal?.data,
                    args,
                  });
                }}
              >
                Cash out
              </ButtonWithWallet>
            ) : null}
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
