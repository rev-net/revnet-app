import { TokenAmount } from "@/components/TokenAmount";
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
import { Stat } from "@/components/ui/stat";
import { useJbMultiTerminalPay } from "@/lib/juicebox/hooks/contract";
import { NATIVE_TOKEN, TokenAmountType } from "juice-sdk-core";
import { useJBContractContext } from "juice-sdk-react";
import { PropsWithChildren } from "react";
import { Address } from "viem";
import { useAccount, useWaitForTransaction } from "wagmi";

export function PayDialog({
  amountA,
  amountB,
  projectId,
  primaryTerminalEth,
  disabled,
  children,
}: PropsWithChildren<{
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  projectId: bigint;
  primaryTerminalEth: Address;
  disabled?: boolean;
}>) {
  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { address } = useAccount();
  const value = amountA.amount.val;
  const {
    write,
    isLoading: isWriteLoading,
    data,
  } = useJbMultiTerminalPay({
    // address: primaryNativeTerminal?.data, // TODO fix wagmi typegen for txs
    args: address
      ? [
          projectId,
          NATIVE_TOKEN,
          value,
          address,
          0n,
          `Joined REVNET ${projectId}`,
          "0x0",
        ]
      : undefined,
    value,
  });

  const txHash = data?.hash;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransaction({
    hash: txHash,
  });

  const loading = isWriteLoading || isTxLoading;

  return (
    <Dialog open={disabled === true ? false : undefined}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Join network</DialogTitle>
          <DialogDescription>
            <div className="my-8">
              {isSuccess ? (
                <div>Success! You can close this window.</div>
              ) : (
                <>
                  <div className="flex flex-col gap-6">
                    <Stat label="You pay">
                      <TokenAmount amount={amountA} />
                    </Stat>
                    <Stat label="You receive">
                      <TokenAmount amount={amountB} />
                    </Stat>
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
                Buy and Join
              </Button>
            ) : null}
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
