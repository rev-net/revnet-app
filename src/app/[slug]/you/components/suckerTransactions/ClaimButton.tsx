"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { toast } from "@/components/ui/use-toast";
import { SuckerTransaction } from "@/generated/graphql";
import { jbSuckerAbi } from "@/generated/jbSuckerAbi";
import { revalidateCacheTag } from "@/lib/cache";
import { formatClaimForContract, getClaimProofs } from "@/lib/juicerkle";
import { formatWalletError } from "@/lib/utils";
import { JBChainId } from "juice-sdk-core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface Props {
  transaction: Pick<
    SuckerTransaction,
    "chainId" | "peerChainId" | "sucker" | "peer" | "token" | "beneficiary" | "index"
  >;
}

export function ClaimButton(props: Props) {
  const { transaction } = props;
  const { writeContractAsync, isPending, data: hash, reset } = useWriteContract();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [callbackCalled, setCallbackCalled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isSuccess || callbackCalled) return;
    toast({ title: "Success! Tokens claimed." });
    setCallbackCalled(true);
    revalidateCacheTag("suckerTransactions", 8000).then(router.refresh);
  }, [isSuccess, callbackCalled, router]);

  return (
    <ButtonWithWallet
      targetChainId={transaction.peerChainId as JBChainId}
      onClick={async () => {
        try {
          reset();
          setIsSubmitting(true);

          const claims = await getClaimProofs(transaction);
          const claim = claims.find((claim) => claim.Leaf.Index === transaction.index);

          if (!claim) {
            console.debug({ claims });
            throw new Error("No claim proof available yet. Please try in a few minutes.");
          }

          await writeContractAsync({
            abi: jbSuckerAbi,
            functionName: "claim",
            chainId: transaction.peerChainId as JBChainId,
            address: transaction.peer as `0x${string}`,
            args: [formatClaimForContract(claim)],
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
      Claim
    </ButtonWithWallet>
  );
}
