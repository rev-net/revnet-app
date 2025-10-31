"use server";

import { SuckerTransaction } from "@/generated/graphql";

const JUICERKLE_API_URL = "https://juicerkle-production.up.railway.app";

export interface JBClaim {
  Token: string;
  Leaf: {
    Index: number;
    Beneficiary: string;
    ProjectTokenCount: string;
    TerminalTokenAmount: string;
  };
  Proof: number[][];
}

export async function getClaimProofs(
  transaction: Pick<
    SuckerTransaction,
    "chainId" | "sucker" | "token" | "beneficiary" | "peerChainId"
  >,
): Promise<JBClaim[]> {
  const { peerChainId, sucker, token, beneficiary } = transaction;
  const response = await fetch(`${JUICERKLE_API_URL}/claims`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chainId: peerChainId,
      sucker: sucker.toLowerCase(),
      token: token.toLowerCase(),
      beneficiary: beneficiary.toLowerCase(),
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const proofs = (await response.json()) as JBClaim[];

  return proofs;
}
