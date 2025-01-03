import {
  JBProjectToken,
  readJbTokensTotalBalanceOf,
  SuckerPair,
} from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useReadJbTokensTotalBalanceOf,
  useSuckers,
} from "juice-sdk-react";
import { useAccount, useConfig } from "wagmi";
import { useQuery } from "wagmi/query";

/**
 * Return the user's project token balance across each sucker on all chains for the current project.
 */
export function useSuckersUserTokenBalance() {
  const config = useConfig();

  const chainId = useJBChainId();
  const { projectId } = useJBContractContext();
  const { address: userAddress } = useAccount();

  const currentChainQuery = useReadJbTokensTotalBalanceOf({
    chainId,
    args: userAddress ? [userAddress, projectId] : undefined,
    query: {
      select(data) {
        return new JBProjectToken(data);
      },
    },
  });
  const suckersQuery = useSuckers();
  const pairs = (suckersQuery.data as { suckers: SuckerPair[] | null })
    ?.suckers;

  const balanceQuery = useQuery({
    queryKey: [
      "suckersUserTokenBalance",
      projectId.toString(),
      chainId?.toString(),
      currentChainQuery.data?.value.toString(),
      pairs?.map((pair) => pair.peerChainId).join(","),
    ],
    queryFn: async () => {
      if (!chainId || !userAddress) return null;

      const currentChain = {
        balance: currentChainQuery.data ?? new JBProjectToken(0n),
        chainId,
        projectId,
      };

      if (!pairs || pairs.length === 0) {
        return [currentChain];
      }

      const balances = await Promise.all(
        pairs.map(async (pair) => {
          const { peerChainId, projectId } = pair;
          const balance = await readJbTokensTotalBalanceOf(config, {
            chainId: Number(peerChainId) as JBChainId,
            args: [userAddress, projectId],
          });

          return {
            balance: new JBProjectToken(balance),
            chainId: peerChainId,
            projectId,
          };
        })
      );

      if (
        !balances.some((balance) => balance.chainId === currentChain.chainId)
      ) {
        // Add the current chain's balance to the list.
        balances.push(currentChain);
      }

      return balances;
    },
  });

  return {
    isLoading: balanceQuery.isLoading || suckersQuery.isLoading,
    isError: balanceQuery.isError || suckersQuery.isError,
    data: balanceQuery.data as
      | { balance: JBProjectToken; chainId: number; projectId: bigint }[]
      | undefined,
  };
}
