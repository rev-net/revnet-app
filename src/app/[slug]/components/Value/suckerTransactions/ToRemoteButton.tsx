"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { toast } from "@/components/ui/use-toast";
import { jbSuckerAbi } from "@/generated/jbSuckerAbi";
import { revalidateCacheTag } from "@/lib/cache";
import { formatWalletError } from "@/lib/utils";
import { JBChainId } from "juice-sdk-core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { getPayableAmount } from "../../../getPayableAmount";

interface Props {
  chainId: JBChainId;
  sucker: `0x${string}`;
  token: `0x${string}`;
}

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
    revalidateCacheTag("suckerTransactions", 8000).then(router.refresh);
  }, [isSuccess, callbackCalled, router]);

  return (
    <ButtonWithWallet
      targetChainId={chainId}
      onClick={async () => {
        try {
          reset();
          setIsSubmitting(true);

          const payableAmount = await getPayableAmount(chainId, sucker, token);
          if (!payableAmount) {
            throw new Error("Bridging can happen as soon as 0.01 ETH is in the queue.");
          }

          if (!balance || balance.value < BigInt(payableAmount)) {
            throw new Error(
              `Insufficient balance. You need at least ${formatUnits(BigInt(payableAmount), 18)} ETH to bridge.`,
            );
          }
          await writeContractAsync({
            abi: jbSuckerAbi,
            functionName: "toRemote",
            chainId,
            address: sucker,
            args: [token],
            value: BigInt(payableAmount),
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
