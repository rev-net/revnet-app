"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stat } from "@/components/ui/stat";
import { useToast } from "@/components/ui/use-toast";
import { Currency } from "@/lib/currency";
import { formatWalletError } from "@/lib/utils";
import {
  JB_CHAINS,
  JBCoreContracts,
  jbDirectoryAbi,
  jbMultiTerminalAbi,
  TokenAmountType,
} from "juice-sdk-core";
import { useJBContractContext, useSuckers } from "juice-sdk-react";
import { useEffect, useState } from "react";
import { erc20Abi, getContract } from "viem";
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { useSelectedSucker } from "./SelectedSuckerContext";

export function PayDialog({
  amountA,
  amountB,
  memo,
  currency,
  disabled,
  onSuccess,
}: {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  memo: string | undefined;
  currency: Currency;
  disabled?: boolean;
  onSuccess?: () => void;
}) {
  const { contractAddress } = useJBContractContext();
  const { address } = useAccount();
  const { isError, error, writeContract, isPending, data: hash } = useWriteContract();

  const value = amountA.amount.value;

  const { selectedSucker, setSelectedSucker } = useSelectedSucker();
  const { peerChainId: chainId, projectId } = selectedSucker;
  const {
    isLoading: isTxLoading,
    isSuccess,
    isError: isTxError,
    error: txError,
  } = useWaitForTransactionReceipt({ hash });
  const { toast } = useToast();
  const { data: suckers } = useSuckers();

  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const [isApproving, setIsApproving] = useState(false);

  // Auto-reset after successful payment
  useEffect(() => {
    if (isSuccess && onSuccess) {
      const timer = setTimeout(onSuccess, 3000); // Show success message for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  useEffect(() => {
    if (isError && error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: formatWalletError(error),
      });
    }
  }, [isError, error, toast]);

  useEffect(() => {
    if (isTxError && txError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: formatWalletError(txError),
      });
    }
  }, [isTxError, txError, toast]);

  const loading = isPending || isTxLoading || isApproving;

  const handlePay = async () => {
    if (!address || !selectedSucker || !walletClient || !publicClient) return;

    try {
      const directory = getContract({
        address: contractAddress(JBCoreContracts.JBDirectory, chainId),
        abi: jbDirectoryAbi,
        client: publicClient,
      });

      const terminal = await directory.read.primaryTerminalOf([projectId, currency.address]);

      if (!terminal) throw new Error(`No terminal found for ${currency.symbol}`);

      if (!currency.isNative) {
        const allowance = await publicClient.readContract({
          address: currency.address,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, terminal],
        });

        if (BigInt(allowance) < BigInt(value)) {
          setIsApproving(true);
          const hash = await walletClient.writeContract({
            address: currency.address,
            abi: erc20Abi,
            functionName: "approve",
            args: [terminal, value],
          });
          await publicClient.waitForTransactionReceipt({ hash });
          setIsApproving(false);
        }
      }

      writeContract?.({
        abi: jbMultiTerminalAbi,
        functionName: "pay",
        chainId,
        address: terminal,
        args: [projectId, currency.address, value, address, 0n, memo || "", "0x0"],
        value: currency.isNative ? value : 0n,
      });
    } catch (err) {
      setIsApproving(false);
      console.error("Payment failed:", err);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: formatWalletError(err),
      });
    }
  };

  return (
    <Dialog open={disabled === true ? false : undefined}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="w-full bg-teal-500 hover:bg-teal-600">
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogTitle className="hidden">Pay</DialogTitle>
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
                  {isTxLoading ? <div>Transaction submitted, awaiting confirmation...</div> : null}
                </>
              )}
            </div>
          </DialogDescription>
          {!isSuccess ? (
            <div className="flex flex-row justify-between items-end">
              {suckers && suckers.length > 1 ? (
                <div className="flex flex-col mt-4">
                  <div className="text-sm text-zinc-500">{amountB.symbol} is available on:</div>
                  <Select
                    onValueChange={(v) =>
                      setSelectedSucker(suckers.find((s) => s.peerChainId === Number(v))!)
                    }
                    value={selectedSucker ? selectedSucker.peerChainId.toString() : undefined}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select chain" />
                    </SelectTrigger>
                    <SelectContent>
                      {suckers.map((s) => (
                        <SelectItem
                          key={s.peerChainId}
                          value={s.peerChainId.toString()}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <ChainLogo chainId={s.peerChainId} />
                            <span>{JB_CHAINS[s.peerChainId].name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex flex-col mt-4">
                  <div className="text-xs text-slate-500">{amountB.symbol} is only on:</div>
                  <div className="flex flex-row items-center gap-2 pl-3 min-w-fit pr-5 py-2 border ring-offset-white">
                    <ChainLogo chainId={chainId} />
                    {JB_CHAINS[chainId].name}
                  </div>
                </div>
              )}
              <ButtonWithWallet
                targetChainId={chainId}
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
