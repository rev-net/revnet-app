import { chainSortOrder } from "@/app/constants";
import { PermissionHolder, PermissionHolderFilter } from "@/generated/graphql";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { JB_CHAINS, JBChainId, jbContractAddress } from "@bananapus/nana-sdk-core";
import { getAccount, getPublicClient, switchChain } from "@wagmi/core";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import gql from "graphql-tag";
import { Abi, Address, PublicClient } from "viem";
import { ProjectItem } from "../shared";

/** A sucker-group project on a chain this UI understands. */
export type ChainProjectRow = { chainId: JBChainId; projectId: number };

/** JB_CHAINS-known rows, in the app's canonical chain order. */
export function chainProjectRows(projects: ProjectItem[]): ChainProjectRow[] {
  return projects
    .filter((p) => Boolean(JB_CHAINS[p.chainId as JBChainId]))
    .map((p) => ({ chainId: p.chainId as JBChainId, projectId: p.projectId }))
    .sort(
      (a, b) => (chainSortOrder.get(a.chainId) ?? 0) - (chainSortOrder.get(b.chainId) ?? 0),
    );
}

export function chainName(chainId: number): string {
  return JB_CHAINS[chainId as JBChainId]?.name ?? String(chainId);
}

/** A v6 contract's address on a chain, or undefined where it isn't deployed. */
export function v6ContractAddress(
  contract: keyof (typeof jbContractAddress)["6"],
  chainId: JBChainId,
): Address | undefined {
  const deployments = jbContractAddress["6"][contract] as Partial<
    Record<number, Address>
  >;
  return deployments?.[chainId];
}

// Typed as a plain viem PublicClient: wagmi's per-chain client union makes
// simulateContract's generics explode past TS's union-size limit (TS2590).
export function publicClientFor(chainId: JBChainId): PublicClient {
  return getPublicClient(wagmiConfig, { chainId }) as unknown as PublicClient;
}

// ---------------------------------------------------------------------------
// Bendystraw permission holders (no generated document covers this shape).
// ---------------------------------------------------------------------------

export type PermissionHolderRow = Pick<
  PermissionHolder,
  "chainId" | "projectId" | "account" | "operator" | "permissions" | "isRevnetOperator"
>;

export type PermissionHoldersQuery = {
  permissionHolders: { items: PermissionHolderRow[] } | null;
};
export type PermissionHoldersQueryVariables = { where: PermissionHolderFilter };

export const PermissionHoldersDocument = gql`
  query V6PermissionHolders($where: PermissionHolderFilter) {
    permissionHolders(where: $where, limit: 500) {
      items {
        chainId
        projectId
        account
        operator
        permissions
        isRevnetOperator
      }
    }
  }
` as unknown as TypedDocumentNode<PermissionHoldersQuery, PermissionHoldersQueryVariables>;

/** Per-project (chainId, projectId) filter, version-scoped on every branch. */
export function permissionHoldersWhere(
  rows: ChainProjectRow[],
  version: number,
  extra?: Partial<PermissionHolderFilter>,
): PermissionHolderFilter {
  return {
    OR: rows.map((row) => ({
      chainId: row.chainId,
      projectId: row.projectId,
      version,
      ...extra,
    })),
  };
}

// ---------------------------------------------------------------------------
// Sequential, simulate-first multi-chain writes from the connected wallet.
// ---------------------------------------------------------------------------

export type ChainWrite = {
  chainId: JBChainId;
  address: Address;
  abi: Abi;
  functionName: string;
  args: readonly unknown[];
};

/**
 * Runs each write in order: switch the wallet chain, simulate the exact call
 * (a failed simulation never becomes an unprotected write), send, and wait for
 * the receipt. Throws on the first failure; `onProgress` reports each step.
 */
export async function runSequentialWrites({
  writes,
  account,
  writeContractAsync,
  onProgress,
}: {
  writes: ChainWrite[];
  account: Address;
  writeContractAsync: (variables: any) => Promise<`0x${string}`>;
  onProgress: (message: string) => void;
}): Promise<number> {
  let done = 0;
  for (const write of writes) {
    const name = chainName(write.chainId);
    if (getAccount(wagmiConfig).chainId !== write.chainId) {
      onProgress(`Switch your wallet to ${name}…`);
      await switchChain(wagmiConfig, { chainId: write.chainId });
    }
    const client = publicClientFor(write.chainId);
    onProgress(`Simulating on ${name}…`);
    await client.simulateContract({
      account,
      address: write.address,
      abi: write.abi,
      functionName: write.functionName,
      args: write.args as unknown[],
    });
    onProgress(`Confirm the transaction on ${name} in your wallet…`);
    const hash = await writeContractAsync({
      chainId: write.chainId,
      address: write.address,
      abi: write.abi,
      functionName: write.functionName,
      args: write.args as unknown[],
    });
    onProgress(`Waiting for confirmation on ${name}…`);
    await client.waitForTransactionReceipt({ hash });
    done += 1;
  }
  return done;
}
