"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
import {
  Dialog,
  DialogContent,
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
import { toast } from "@/components/ui/use-toast";
import { Project } from "@/generated/graphql";
import { jbSuckerAbi } from "@/generated/jbSuckerAbi";
import { useAllowance } from "@/hooks/useAllowance";
import { useSuckerPairs } from "@/hooks/useSuckerPairs";
import { revalidateCacheTag } from "@/lib/cache";
import { getTokenAddress } from "@/lib/token";
import { cn, formatTokenSymbol, formatWalletError } from "@/lib/utils";
import { FixedInt } from "fpnum";
import { JB_CHAINS, JB_TOKEN_DECIMALS, JBChainId } from "juice-sdk-core";
import {
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { formatUnits, getAddress, parseUnits } from "viem";
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface Props {
  projects: Array<Pick<Project, "projectId" | "chainId" | "token">>;
}

export function BridgeDialog(props: PropsWithChildren<Props>) {
  const { children, projects } = props;
  const { version } = useJBContractContext();
  const sourceChains = useMemo(() => projects.map((p) => p.chainId as JBChainId), [projects]);
  const [sourceChainId, setSourceChainId] = useState<JBChainId>(sourceChains[0]);
  const [targetChainId, setTargetChainId] = useState<JBChainId>();
  const [amount, setAmount] = useState<string>();
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);
  const { ensureAllowance, isApproving } = useAllowance(sourceChainId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address } = useAccount();
  const router = useRouter();
  const publicClient = usePublicClient({ chainId: sourceChainId });
  const { writeContractAsync, data: hash, reset } = useWriteContract();
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });
  const { data: balances, isLoading: isBalanceLoading } = useSuckersUserTokenBalance();
  const { balance } = balances?.find((b) => b.chainId === sourceChainId) || {
    balance: { value: 0n },
  };
  const tokenDecimals = JB_TOKEN_DECIMALS;
  const maxAmount = balance ? formatUnits(balance.value, tokenDecimals) : "0";

  const project = projects.find((p) => p.chainId === sourceChainId)!;
  const { suckerPairs } = useSuckerPairs(project.projectId, sourceChainId);

  const targetChains = useMemo(
    () =>
      suckerPairs
        .map((s) => Number(s.remoteChainId))
        .filter((id) => id !== sourceChainId) as JBChainId[],
    [sourceChainId, suckerPairs],
  );

  const isDisabled = isSubmitting || isLoading || isSuccess;

  const moveTokens = useCallback(async () => {
    try {
      setIsSubmitting(true);

      if (!address) {
        throw new Error("Please connect your wallet");
      }

      if (!amount || Number(amount) <= 0) {
        throw new Error("Please enter an amount");
      }

      if (Number(amount) > Number(maxAmount)) {
        throw new Error("Insufficient balance");
      }

      const projectId = projects.find((p) => p.chainId === sourceChainId)?.projectId;

      if (!publicClient || !projectId || !writeContractAsync || !project.token) {
        throw new Error("Please try again");
      }

      const tokenAddress = await getTokenAddress(publicClient, sourceChainId, projectId, version);

      if (!tokenAddress) {
        throw new Error("Couldn't determine token address. Please try again");
      }

      const suckerPair = suckerPairs.find(
        (sucker) => Number(sucker.remoteChainId) === targetChainId,
      );

      if (!suckerPair) {
        throw new Error("Couldn't determine sucker pair. Please try again");
      }

      const amountObj = new FixedInt(parseUnits(amount, tokenDecimals), tokenDecimals);

      await ensureAllowance(tokenAddress, suckerPair.local, amountObj.value);

      const minTokens = 0n; // ToDo

      await writeContractAsync({
        abi: jbSuckerAbi,
        functionName: "prepare",
        address: suckerPair.local,
        args: [amountObj.value, address, minTokens, getAddress(project.token)],
        chainId: sourceChainId,
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: formatWalletError(error) });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    amount,
    maxAmount,
    projects,
    publicClient,
    sourceChainId,
    version,
    tokenDecimals,
    ensureAllowance,
    targetChainId,
    suckerPairs,
    writeContractAsync,
    address,
    project.token,
  ]);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          reset();
          setAmount(undefined);
          setSourceChainId(sourceChains[0]);
          setTargetChainId(undefined);
          revalidateCacheTag("suckerTransactions").then(router.refresh);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Move between chains</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            moveTokens();
          }}
        >
          <fieldset className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sourceChainId" className="text-zinc-900">
                From chain
              </Label>
              <Select
                value={sourceChainId.toString()}
                onValueChange={(v) => {
                  const newId = Number(v) as JBChainId;
                  setSourceChainId(newId);
                  setTargetChainId(undefined);
                }}
                disabled={isDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chain..." id="sourceChainId">
                    <div className="flex items-center gap-2">
                      <ChainLogo chainId={sourceChainId} />
                      {JB_CHAINS[sourceChainId].name}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sourceChains.map((chainId) => {
                    return (
                      <SelectItem
                        value={chainId.toString()}
                        key={chainId}
                        className="[&>*:last-child]:flex [&>*:last-child]:w-full"
                      >
                        <div className="flex items-center gap-2 grow">
                          <ChainLogo chainId={chainId} />
                          {JB_CHAINS[chainId].name}
                        </div>
                        <span className="shrink-0 pl-2">
                          {balances?.find((b) => b.chainId === chainId)?.balance.format(2)}{" "}
                          {tokenSymbol}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetChainId" className="text-zinc-900">
                To chain
              </Label>
              <Select
                value={targetChainId?.toString() ?? ""}
                onValueChange={(v) => {
                  if (!v) return;
                  setTargetChainId(Number(v) as JBChainId);
                }}
                disabled={isDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chain..." id="targetChainId">
                    {targetChainId && (
                      <div className="flex items-center gap-2">
                        <ChainLogo chainId={targetChainId} />
                        {JB_CHAINS[targetChainId].name}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {targetChains
                    .filter((chainId) => chainId !== sourceChainId)
                    .map((chainId) => {
                      return (
                        <SelectItem
                          value={chainId.toString()}
                          key={chainId}
                          className="[&>*:last-child]:flex [&>*:last-child]:w-full"
                        >
                          <div className="flex items-center gap-2 grow">
                            <ChainLogo chainId={chainId as JBChainId} />
                            {JB_CHAINS[chainId as JBChainId].name}
                          </div>
                          <span className="shrink-0 pl-2">
                            {balances?.find((b) => b.chainId === chainId)?.balance.format(2)}{" "}
                            {tokenSymbol}
                          </span>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
            <div className="">
              <Label htmlFor="amount" className="text-zinc-900">
                Amount
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  name="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value?.trim())}
                  disabled={isDisabled}
                  autoComplete="off"
                  type="text"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 z-10">
                  <span className="text-zinc-500 sm:text-md">{tokenSymbol}</span>
                </div>
              </div>
              <div className="flex gap-1 mt-1 mb-2 justify-end">
                {[10, 25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    disabled={isBalanceLoading || isDisabled}
                    onClick={() => {
                      setAmount(
                        pct === 100 ? maxAmount : (Number(maxAmount) * (pct / 100)).toFixed(8),
                      );
                    }}
                    className="h-10 px-3 text-sm text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100"
                  >
                    {pct === 100 ? "Max" : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>

          <DialogFooter className="flex items-center sm:justify-between w-full gap-4">
            <div
              className={cn("text-sm text-zinc-700", {
                "animate-pulse": isApproving || isLoading,
              })}
            >
              {isApproving && "Please wait for approval confirmation..."}
              {isLoading && "Please wait for transaction confirmation..."}
              {isSuccess &&
                "Success! Close the dialog and check transactions in the table to complete."}
            </div>
            <ButtonWithWallet targetChainId={sourceChainId} disabled={isDisabled}>
              Move {tokenSymbol}
            </ButtonWithWallet>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
