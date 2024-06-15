import { Button } from "@/components/ui/button";
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
import { Stat } from "@/components/ui/stat";
import { FixedInt } from "fpnum";
import { JBProjectToken, NATIVE_TOKEN } from "juice-sdk-core";
import {
  useJBContractContext,
  useWriteJbMultiTerminalRedeemTokensOf,
} from "juice-sdk-react";
import { PropsWithChildren, useState } from "react";
import { Address, parseEther } from "viem";
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
  /**
   *       address holder,
        uint256 projectId,
        address tokenToReclaim,
        uint256 redeemCount,
        uint256 minTokensReclaimed,
        address payable beneficiary,
   */

  const redeemAmountBN = redeemAmount
    ? JBProjectToken.parse(redeemAmount, 18).value
    : 0n;

  const {
    write,
    isLoading: isWriteLoading,
    data,
  } = useWriteJbMultiTerminalRedeemTokensOf({
    // address: primaryNativeTerminal?.data, // TODO fix wagmi typegen for txs
    args:
      address && redeemAmountBN
        ? [
            address,
            projectId,
            NATIVE_TOKEN,
            redeemAmount ? parseEther(redeemAmount) : 0n,
            0n,
            address,
            "0x0",
          ]
        : undefined,
  });

  const txHash = data?.hash;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const loading = isWriteLoading || isTxLoading;

  return (
    <Dialog open={disabled === true ? false : undefined}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cash out</DialogTitle>
          <DialogDescription>
            <div className="my-8">
              {isSuccess ? (
                <div>Success! You can close this window.</div>
              ) : (
                <>
                  <div className="mb-5">
                    <Stat label="Total tokens">
                      {creditBalance.format()} {tokenSymbol}
                    </Stat>
                  </div>
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="amount" className="text-zinc-900">
                      Tokens to cash out
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                    />
                  </div>
                  {isTxLoading ? (
                    <div>Transaction submitted, awaiting confirmation...</div>
                  ) : null}
                </>
              )}
            </div>
          </DialogDescription>
          <DialogFooter>
            {!isSuccess ? (
              <Button
                loading={loading}
                onClick={() => {
                  write?.();
                }}
              >
                Cash out
              </Button>
            ) : null}
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
