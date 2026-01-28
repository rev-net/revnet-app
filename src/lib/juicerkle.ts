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
) {
  const { peerChainId, sucker, token, beneficiary } = transaction;

  try {
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
      const error = await response.text();
      return { success: false, error };
    }

    const proofs = (await response.json()) as JBClaim[];
    return { success: true, claims: proofs };
  } catch (err) {
    const message = Error.isError(err) ? err.message : "Failed to fetch claim proofs";
    return { success: false, error: message };
  }
}
