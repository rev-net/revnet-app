import { SuckerTransaction } from "@/generated/graphql";

const JUICERKLE_API_URL = "https://juicerkle-production.up.railway.app";

interface JBClaim {
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

export function formatClaimForContract(claim: JBClaim) {
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
