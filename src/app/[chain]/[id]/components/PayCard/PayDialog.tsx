import { ChainSelector } from "@/components/ChainSelect";
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
import { JBChainId, NATIVE_TOKEN, TokenAmountType } from "juice-sdk-core";
import {
  useJBContractContext,
  useWriteJbMultiTerminalPay,
} from "juice-sdk-react";
import { useState } from "react";
import { Address } from "viem";
import { useAccount, useChainId, useWaitForTransactionReceipt } from "wagmi";

export function PayDialog({
  amountA,
  amountB,
  projectId,
  disabled,
}: {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  projectId: bigint;
  primaryTerminalEth: Address;
  disabled?: boolean;
}) {
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
  const [contributeChain, setContributeChain] = useState<JBChainId>(11155111);
  const txHash = data;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const loading = isWriteLoading || isTxLoading;

  const handleContribute = () => {
    if (!primaryNativeTerminal?.data || !address) {
      return;
    }

    writeContract?.({
      chainId,
      address: primaryNativeTerminal?.data,
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
  };

  return (
    <Dialog open={disabled === true ? false : undefined}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="w-full"
        >
          Contribute
        </Button>
      </DialogTrigger>
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
            <ChainSelector value={contributeChain} onChange={setContributeChain} />
            {!isSuccess ? (
              <Button
                loading={loading}
                onClick={handleContribute}
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
