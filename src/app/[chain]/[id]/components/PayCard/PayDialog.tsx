import { chainNames } from "@/app/constants";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
import { TokenAmount } from "@/components/TokenAmount";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stat } from "@/components/ui/stat";
import { useToast } from "@/components/ui/use-toast";
import {
  JBChainId,
  NATIVE_TOKEN,
  SuckerPair,
  TokenAmountType,
} from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useSuckers,
  useWriteJbMultiTerminalPay,
} from "juice-sdk-react";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";

export function PayDialog({
  amountA,
  amountB,
  memo,
  disabled,
}: {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  memo: string | undefined;
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
  const [selectedSucker, setSelectedSucker] = useState<SuckerPair>();
  const txHash = data;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const { toast } = useToast();
  const loading = isWriteLoading || isTxLoading;
  const suckersQuery = useSuckers();
  const suckers = (suckersQuery.data as { suckers: SuckerPair[] | null })
    ?.suckers;

  useEffect(() => {
    if (isError && error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message ||
          "An error occurred while processing your contribution",
      });
    }
  }, [isError, error, toast]);

  useEffect(() => {
    if (chainId && suckers && !suckers.find((s) => s.peerChainId === chainId)) {
      suckers.push({ projectId, peerChainId: chainId });
    }
    if (suckers && !selectedSucker) {
      const i = suckers.findIndex((s) => s.peerChainId === chainId);
      setSelectedSucker(suckers[i]);
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
        memo || "",
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
          className="w-full bg-teal-500 hover:bg-teal-600"
        >
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogDescription>
            <div>
              {isSuccess ? (
                <div>Success! You can close this window.</div>
              ) : (
                <>
                  <div className="flex flex-col gap-6">
                    <Stat label="Pay">
                      <TokenAmount amount={amountA} />
                    </Stat>
                    <Stat label="Get">
                      <TokenAmount amount={amountB} />
                    </Stat>
                    {memo && <Stat label="Memo">{memo}</Stat>}
                  </div>
                  {isTxLoading ? (
                    <div>Transaction submitted, awaiting confirmation...</div>
                  ) : null}
                </>
              )}
            </div>
          </DialogDescription>
          {!isSuccess ? (
            <div className="flex flex-row justify-between items-end">
              {suckers && suckers.length > 1 ? (
                <div className="flex flex-col mt-4">
                  <div className="text-sm text-zinc-500">
                    {amountB.symbol} is available on:
                  </div>
                  <Select
                    onValueChange={(v) =>
                      setSelectedSucker(suckers[parseInt(v)])
                    }
                    value={
                      selectedSucker
                        ? String(suckers.indexOf(selectedSucker))
                        : undefined
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select chain"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {suckers.map((s, index) => (
                        <SelectItem
                          key={s.peerChainId}
                          value={String(index)}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <ChainLogo chainId={s.peerChainId as JBChainId} />
                            <span>
                              {chainNames[s.peerChainId as JBChainId]}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                selectedSucker && (
                  <div className="flex flex-col mt-4">
                    <div className="text-xs text-slate-500">
                      {amountB.symbol} is only on:
                    </div>
                    <div className=" flex flex-row items-center gap-2 pl-3 min-w-fit pr-5 py-2 border rounded-sm ring-offset-white">
                      <ChainLogo
                        chainId={selectedSucker.peerChainId as JBChainId}
                      />
                      {chainNames[selectedSucker.peerChainId as JBChainId]}
                    </div>
                  </div>
                )
              )}
              <ButtonWithWallet
                targetChainId={
                  selectedSucker?.peerChainId as JBChainId | undefined
                }
                loading={loading}
                onClick={handlePay}
                className="bg-teal-500 hover:bg-teal-600"
              >
                Pay
              </ButtonWithWallet>
            </div>
          ) : null}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
