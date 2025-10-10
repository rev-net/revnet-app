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
import { Token } from "@/lib/token";
import { formatWalletError } from "@/lib/utils";
import {
  JB_CHAINS,
  JBCoreContracts,
  jbDirectoryAbi,
  jbSwapTerminalAbi,
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

interface Props {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  memo: string | undefined;
  token: Token;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function PayDialog(props: Props) {
  const { amountA, amountB, memo, token, disabled, onSuccess } = props;
  const { contractAddress } = useJBContractContext();
  const { address } = useAccount();
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { data: suckers } = useSuckers();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();
  const { peerChainId: chainId, projectId } = selectedSucker;
  const { isLoading: isTxLoading, isSuccess, error } = useWaitForTransactionReceipt({ hash });
  const { toast } = useToast();

  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const [isApproving, setIsApproving] = useState(false);

  const value = amountA.amount.value;

  // Auto-reset after successful payment
  useEffect(() => {
    if (isSuccess && onSuccess) {
      const timer = setTimeout(onSuccess, 3000); // Show success message for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  useEffect(() => {
    if (!error) return;
    toast({ variant: "destructive", title: "Error", description: formatWalletError(error) });
  }, [error, toast]);

  const loading = isPending || isTxLoading || isApproving;

  const handlePay = async () => {
    if (!address || !selectedSucker || !walletClient || !publicClient) return;

    try {
      const directory = getContract({
        address: contractAddress(JBCoreContracts.JBDirectory, chainId),
        abi: jbDirectoryAbi,
        client: publicClient,
      });

      const terminal = await directory.read.primaryTerminalOf([projectId, token.address]);
      if (!terminal) throw new Error(`No terminal found for ${token.symbol}`);

      if (!token.isNative) {
        const allowance = await publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, terminal],
        });

        if (BigInt(allowance) < BigInt(value)) {
          setIsApproving(true);
          const hash = await walletClient.writeContract({
            address: token.address,
            abi: erc20Abi,
            functionName: "approve",
            args: [terminal, value],
          });
          await publicClient.waitForTransactionReceipt({ hash });
          setIsApproving(false);
        }
      }

      await writeContractAsync?.({
        abi: jbSwapTerminalAbi,
        functionName: "pay",
        chainId,
        address: terminal,
        args: [projectId, token.address, value, address, 0n, memo || "", "0x0"],
        value: token.isNative ? value : 0n,
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
