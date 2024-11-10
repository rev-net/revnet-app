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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stat } from "@/components/ui/stat";
import { NATIVE_TOKEN, TokenAmountType } from "juice-sdk-core";
import {
  useJBContractContext,
  useWriteJbMultiTerminalPay,
} from "juice-sdk-react";
import { PropsWithChildren, useState } from "react";
import { Address } from "viem";
import { useAccount, useChainId, useWaitForTransactionReceipt } from "wagmi";

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
  const chainId = useChainId();
  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { address } = useAccount();
  const value = amountA.amount.value;
  const {
    writeContract,
    isPending: isWriteLoading,
    data,
  } = useWriteJbMultiTerminalPay();
  const [memo, setMemo] = useState<string>();
  const txHash = data;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const loading = isWriteLoading || isTxLoading;

  return (
    <Dialog open={disabled === true ? false : undefined}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Contribution</DialogTitle>
          <DialogDescription>
            <div className="my-8">
              {isSuccess ? (
                <div>Success! You can close this window.</div>
              ) : (
                <>
                  <div className="flex flex-col gap-6">
                    <Stat label="You contribute">
                      <TokenAmount amount={amountA} />
                    </Stat>
                    <Stat label="You receive">
                      <TokenAmount amount={amountB} />
                    </Stat>
                  </div>
                  {isTxLoading ? (
                    <div>Transaction submitted, awaiting confirmation...</div>
                  ) : null}
                  <div className="grid w-full gap-1.5 my-8">
                    <Label htmlFor="amount" className="text-zinc-500">
                      Onchain memo (optional)
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      value={memo}
                      autoComplete="off"
                      className="text-zinc-800"
                      onChange={(e) => setMemo(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </DialogDescription>
          <DialogFooter>
            {!isSuccess ? (
              <Button
                loading={loading}
                onClick={() => {
                  if (!primaryNativeTerminal?.data) {
                    return;
                  }
                  if (!address) {
                    return;
                  }

                  writeContract?.({
                    chainId,
                    address: primaryNativeTerminal?.data ?? undefined,
                    args: [
                      projectId,
                      NATIVE_TOKEN,
                      value,
                      address,
                      0n,
                      memo || `Joined REVNET ${projectId}`,
                      "0x0",
                    ],
                    value,
                  });
                }}
              >
                Confirm contribution
              </Button>
            ) : null}
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
