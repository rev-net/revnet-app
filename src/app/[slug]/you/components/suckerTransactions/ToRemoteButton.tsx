"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { toast } from "@/components/ui/use-toast";
import { jbSuckerAbi } from "@/generated/jbSuckerAbi";
import { revalidateCacheTag } from "@/lib/cache";
import { formatWalletError } from "@/lib/utils";
import { JBChainId } from "juice-sdk-core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatUnits, parseEther } from "viem";
import { useAccount, useBalance, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface Props {
  chainId: JBChainId;
  sucker: `0x${string}`;
  token: `0x${string}`;
}

const payableAmount = parseEther("0.005"); // Fee for the bridge

export function ToRemoteButton(props: Props) {
  const { chainId, sucker, token } = props;
  const { writeContractAsync, isPending, data: hash, reset } = useWriteContract();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [callbackCalled, setCallbackCalled] = useState(false);
  const router = useRouter();
  const { address } = useAccount();
  const { data: balance } = useBalance({ address, chainId });

  useEffect(() => {
    if (!isSuccess || callbackCalled) return;
    toast({ title: "Success! Bridge transaction executed." });
    setCallbackCalled(true);
    revalidateCacheTag("suckerTransactions", 5000).then(router.refresh);
  }, [isSuccess, callbackCalled, router]);

  return (
    <ButtonWithWallet
      targetChainId={chainId}
      onClick={async () => {
        try {
          reset();
          setIsSubmitting(true);
          if (!balance || balance.value < payableAmount) {
            throw new Error(
              `Insufficient balance. You need at least ${formatUnits(payableAmount, 18)} ETH to bridge.`,
            );
          }
          await writeContractAsync({
            abi: jbSuckerAbi,
            functionName: "toRemote",
            chainId,
            address: sucker,
            args: [token],
            value: payableAmount,
          });
        } catch (error) {
          console.error(error);
          toast({ variant: "destructive", title: "Error", description: formatWalletError(error) });
        } finally {
          setIsSubmitting(false);
        }
      }}
      type="button"
      size="sm"
      loading={isSubmitting || isPending || isLoading}
      variant="outline"
      forceChildren
    >
      Execute
    </ButtonWithWallet>
  );
}
