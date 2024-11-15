import Image from "next/image";
import {
  useAccount,
  useWaitForTransactionReceipt
} from "wagmi";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { TokenAmount } from "@/components/TokenAmount";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stat } from "@/components/ui/stat";
import { JBChainId, NATIVE_TOKEN, TokenAmountType } from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useSuckers,
  useWriteJbMultiTerminalPay,
} from "juice-sdk-react";
import { useToast } from "@/components/ui/use-toast";
import { chainNames } from "@/app/constants";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChainLogo } from "@/components/ChainLogo";

type Sucker = {
  peerChainId: JBChainId;
  projectId: bigint;
}

export function PayDialog({
  amountA,
  amountB,
  disabled,
}: {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  primaryTerminalEth: Address;
  disabled?: boolean;
}) {
  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { address } = useAccount();
  const value = amountA.amount.value;
  const {
    isError,
    error,
    writeContract,
    isPending: isWriteLoading,
    data,
  } = useWriteJbMultiTerminalPay();
  const chainId = useJBChainId();
  const [memo, setMemo] = useState<string>();
  const [selectedSucker, setSelectedSucker] = useState<Sucker>();
  const txHash = data;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const { toast } = useToast();
  const loading = isWriteLoading || isTxLoading;
  const { data: suckers } = useSuckers() as { data: Sucker[] };

  useEffect(() => {
    if (isError && error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while processing your contribution",
      });
    }
  }, [isError, error, toast]);

  useEffect(() => {
    if (chainId && suckers && !suckers.find((s) => s.peerChainId === chainId)) {
      suckers.push({ projectId, peerChainId: chainId });
    }
    if (suckers && !selectedSucker) {
      const i = suckers.findIndex((s) => s.peerChainId === chainId);
      setSelectedSucker(suckers[i])
    }
  }, [suckers, chainId, projectId, selectedSucker]);

  const handlePay = () => {
    if (!primaryNativeTerminal?.data || !address || !selectedSucker) {
      return;
    }

    writeContract?.({
      chainId: selectedSucker.peerChainId,
      address: primaryNativeTerminal?.data,
      args: [
        selectedSucker.projectId,
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
          Pay
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
                    <Stat label="You pay">
                      <TokenAmount amount={amountA} />
                    </Stat>
                    <Stat label="You get">
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
          {!isSuccess ? (
            <div className="flex flex-row justify-between">
              {suckers?.length > 1 ? (
                <div className="flex flex-col -mt-5">
                  <div className="text-sm text-zinc-500">
                    {amountB.symbol} is available on:
                  </div>
                <Select
                  onValueChange={(v) => setSelectedSucker(suckers[parseInt(v)])}
                  value={selectedSucker ? String(suckers.indexOf(selectedSucker)) : undefined}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select chain">
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {suckers.map((s, index) => (
                      <SelectItem
                        key={s.peerChainId}
                        value={String(index)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <ChainLogo chainId={s.peerChainId} />
                          <span>{chainNames[s.peerChainId]}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
              ) : (
                selectedSucker && (
                  <div className="flex flex-col -mt-4">
                    <div className="text-xs text-slate-500">{amountB.symbol} is only on:</div>
                    <div className=" flex flex-row items-center gap-2 pl-3 min-w-fit pr-5 py-2 border rounded-sm ring-offset-white">
                      <ChainLogo chainId={selectedSucker.peerChainId} />
                      {chainNames[selectedSucker.peerChainId]}
                    </div>
                  </div>
                )
              )}
              <ButtonWithWallet
                targetChainId={selectedSucker?.peerChainId}
                loading={loading}
                onClick={handlePay}
              >
                Confirm Contribution
              </ButtonWithWallet>
            </div>
          ) : null}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
