import { applyNanaFee, applyRevFee } from "@/lib/feeHelpers";
import {
  getProjectTerminalStore,
  JBChainId,
  jbTerminalStoreAbi,
  jbTerminalStoreV5Abi,
  JBVersion,
} from "@bananapus/nana-sdk-core";
import { useReadContract } from "wagmi";

export function useReclaimableSurplus(params: {
  chainId: JBChainId | undefined;
  projectId: bigint | undefined;
  tokenAmount: bigint | undefined;
  version: JBVersion | undefined;
  decimals: number;
  currencyId: number;
}) {
  const { chainId, projectId, tokenAmount, version, decimals, currencyId } = params;

  // The two array args are empty either way, but the selector differs: v6 takes
  // (address[], address[]) where v4/v5 take (address[], tuple[]).
  const { data: raw, ...rest } = useReadContract({
    abi: version === 6 ? jbTerminalStoreAbi : jbTerminalStoreV5Abi,
    address: chainId && version ? getProjectTerminalStore(chainId, version) : undefined,
    functionName: "currentReclaimableSurplusOf",
    chainId,
    args:
      projectId && tokenAmount
        ? [projectId, applyRevFee(tokenAmount), [], [], BigInt(decimals), BigInt(currencyId)]
        : undefined,
  });

  const afterFees = raw ? applyNanaFee(raw) : undefined;

  return { data: afterFees, raw, ...rest };
}
