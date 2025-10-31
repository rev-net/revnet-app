"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { toast } from "@/components/ui/use-toast";
import { SuckerTransaction } from "@/generated/graphql";
import { jbSuckerAbi } from "@/generated/jbSuckerAbi";
import { revalidateCacheTag } from "@/lib/cache";
import { getClaimProofs, JBClaim } from "@/lib/juicerkle";
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

function formatClaimForContract(claim: JBClaim) {
  const proof = claim.Proof.map((chunk) => {
    const hex = chunk.map((byte) => byte.toString(16).padStart(2, "0")).join("");
    return `0x${hex}` as `0x${string}`;
  });

  if (proof.length !== 32) {
    throw new Error(`Invalid proof length: expected 32, got ${proof.length}`);
  }

  return {
    token: claim.Token as `0x${string}`,
    leaf: {
      index: BigInt(claim.Leaf.Index),
      beneficiary: claim.Leaf.Beneficiary as `0x${string}`,
      projectTokenCount: BigInt(claim.Leaf.ProjectTokenCount),
      terminalTokenAmount: BigInt(claim.Leaf.TerminalTokenAmount),
    },
    proof: proof as unknown as readonly [
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
    ],
  };
}
