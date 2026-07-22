import { JBChainId, revLoansAbi, revLoansV5Abi } from "@bananapus/nana-sdk-core";
import { useJBContractContext } from "@bananapus/nana-sdk-react";
import { Address } from "viem";
import { useReadContract } from "wagmi";

/**
 * `REVLoans.borrowableAmountFrom` across versions. v6 returns
 * `(borrowableNow, borrowableCapacity)` — this returns `borrowableNow`, matching the v4/v5
 * single return value.
 */
export function useBorrowableAmountFrom({
  address,
  chainId,
  args,
}: {
  address: Address | undefined;
  chainId?: JBChainId;
  args?: readonly [bigint, bigint, bigint, bigint];
}) {
  const { version } = useJBContractContext();

  const v6Query = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address,
    chainId,
    args,
    query: { enabled: version === 6 },
  });

  const legacyQuery = useReadContract({
    abi: revLoansV5Abi,
    functionName: "borrowableAmountFrom",
    address,
    chainId,
    args,
    query: { enabled: version !== 6 },
  });

  if (version === 6) return { ...v6Query, data: v6Query.data?.[0] };
  return legacyQuery;
}
