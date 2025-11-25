"use server";

import { jbSuckerAbi } from "@/generated/jbSuckerAbi";
import { getViemPublicClient } from "@/lib/wagmiConfig";
import { JBChainId } from "juice-sdk-core";
import { unstable_cache } from "next/cache";
import { formatEther, parseEther } from "viem";

async function getPayableAmountUncached(
  chainId: JBChainId,
  sucker: `0x${string}`,
  token: `0x${string}`,
) {
  const client = getViemPublicClient(chainId);

  let validAmount: bigint | null = null;
  let left = 0n;
  let right = parseEther("0.04");

  for (let i = 0; i < 10 && left <= right; i++) {
    const mid = i === 0 ? 0n : (left + right) / 2n;

    try {
      console.debug("Testing bridge fee", formatEther(mid));
      await client.simulateContract({
        address: sucker,
        abi: jbSuckerAbi,
        functionName: "toRemote",
        args: [token],
        value: mid,
      });
      validAmount = mid;
      if (mid === 0n) return "0";
      right = mid - 1n;
    } catch {
      left = mid + 1n;
    }
  }
  console.debug("Bridge fee result", {
    validAmount: validAmount ? formatEther(validAmount) : null,
  });
  return validAmount?.toString() || null;
}

export const getPayableAmount = unstable_cache(getPayableAmountUncached, ["payableAmount"], {
  revalidate: 600,
});
