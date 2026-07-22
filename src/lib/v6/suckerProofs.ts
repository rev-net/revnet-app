import { getViemPublicClient } from "@/lib/wagmiConfig";
import { getJBContractAddress, JBChainId, JBSuckerContracts } from "@bananapus/nana-sdk-core";
import {
  buildBridgeClaimTx,
  getAccountingContexts,
  getV6SuckerPairs,
} from "@bananapus/nana-sdk-core/v6";
import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  Hex,
  keccak256,
  PublicClient,
  zeroHash,
} from "viem";

/**
 * Local (juicerkle-free) v6 sucker claim support, ported from website/'s
 * bridge-transactions reconstruction: enumerate each sucker's outbox leaves from
 * `InsertToOutboxTree` logs, rebuild the depth-32 MerkleLib incremental tree, derive
 * per-leaf status from the source outbox and destination inbox, and hand back
 * locally VERIFIED merkle proofs for claimable leaves. Everything is checked against
 * on-chain roots before a claim is offered — a wrong proof can't leave this module.
 */

const SUCKER_VIEW_ABI = [
  {
    type: "function",
    name: "outboxOf",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "nonce", type: "uint64" },
          { name: "numberOfClaimsSent", type: "uint192" },
          { name: "balance", type: "uint256" },
          {
            name: "tree",
            type: "tuple",
            components: [
              { name: "branch", type: "bytes32[32]" },
              { name: "count", type: "uint256" },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "inboxOf",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "nonce", type: "uint64" },
          { name: "root", type: "bytes32" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "executedLeafHashOf",
    stateMutability: "view",
    inputs: [
      { name: "token", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    name: "remoteTokenFor",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "enabled", type: "bool" },
          { name: "emergencyHatch", type: "bool" },
          { name: "minGas", type: "uint32" },
          { name: "addr", type: "bytes32" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "toRemote",
    stateMutability: "payable",
    inputs: [{ name: "token", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "CCIP_ROUTER",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;

const INSERT_TO_OUTBOX_EVENT = {
  type: "event",
  name: "InsertToOutboxTree",
  inputs: [
    { name: "beneficiary", type: "bytes32", indexed: true },
    { name: "token", type: "address", indexed: true },
    { name: "hashed", type: "bytes32", indexed: false },
    { name: "index", type: "uint256", indexed: false },
    { name: "root", type: "bytes32", indexed: false },
    { name: "projectTokenCount", type: "uint256", indexed: false },
    { name: "terminalTokenAmount", type: "uint256", indexed: false },
    { name: "metadata", type: "bytes32", indexed: false },
    { name: "caller", type: "address", indexed: false },
  ],
} as const;

const TREE_DEPTH = 32;

// MerkleLib depth-32 incremental tree (Z[i+1]=keccak(Z[i]‖Z[i]); leaf-left when index
// bit==0).
function hashPair(a: Hex, b: Hex): Hex {
  return keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "bytes32" }], [a, b]));
}

let zeroHashesCache: Hex[] | null = null;
function zeroHashes(): Hex[] {
  if (zeroHashesCache) return zeroHashesCache;
  const z: Hex[] = [zeroHash];
  for (let i = 0; i < TREE_DEPTH; i++) z.push(hashPair(z[i], z[i]));
  zeroHashesCache = z;
  return z;
}

/** Sibling path (32 elements) for the leaf at `index`, given the dense leaf-hash array. */
export function suckerLeafProof(leafHashes: Hex[], index: number): Hex[] {
  const Z = zeroHashes();
  let level = leafHashes.slice();
  const proof: Hex[] = [];
  let pos = index;
  for (let l = 0; l < TREE_DEPTH; l++) {
    const sib = pos ^ 1;
    proof.push(sib < level.length ? level[sib] : Z[l]);
    const next: Hex[] = [];
    for (let i = 0; i * 2 < level.length; i++) {
      const left = level[i * 2];
      const right = i * 2 + 1 < level.length ? level[i * 2 + 1] : Z[l];
      next.push(hashPair(left, right));
    }
    level = next;
    pos = Math.floor(pos / 2);
  }
  return proof;
}

/** Recompute the root from a leaf + proof (mirrors MerkleLib.branchRoot). */
export function suckerBranchRoot(leaf: Hex, proof: Hex[], index: number): Hex {
  let cur = leaf;
  let pos = index;
  for (let i = 0; i < TREE_DEPTH; i++) {
    cur = pos & 1 ? hashPair(proof[i], cur) : hashPair(cur, proof[i]);
    pos = Math.floor(pos / 2);
  }
  return cur;
}

export type V6BridgeRowStatus = "pending" | "claimable" | "claimed";

export interface V6BridgeRow {
  createdAt?: number;
  chainId: JBChainId;
  peerChainId: JBChainId;
  beneficiary: Address;
  beneficiary32: Hex;
  projectTokenCount: bigint;
  terminalTokenAmount: bigint;
  status: V6BridgeRowStatus;
  index: number;
  sourceSucker: Address;
  peerSucker: Address;
  metadata: Hex;
  /** Verified 32-element sibling path — present only when status is "claimable". */
  proof: Hex[] | null;
  /** True for pending leaves not yet shipped by `toRemote`. */
  canExecute: boolean;
  token: Address;
  remoteToken: Address;
  tokenDecimals: number;
  infra: "ccip" | "native" | "unknown";
}

type OutboxLeaf = {
  hashed: Hex;
  root: Hex;
  beneficiary: Hex;
  projectTokenCount: bigint;
  terminalTokenAmount: bigint;
  metadata: Hex;
};

const leafCache = new Map<
  string,
  { count: number; byIndex: Record<number, OutboxLeaf>; blockOf: Record<number, bigint>; ts: Record<number, number> }
>();

const infraCache = new Map<string, "ccip" | "native">();

async function classifySuckerInfra(chainId: JBChainId, sucker: Address) {
  const key = `${chainId}:${sucker.toLowerCase()}`;
  const cached = infraCache.get(key);
  if (cached) return cached;
  const client = getViemPublicClient(chainId) as PublicClient;
  try {
    // Only CCIP suckers expose CCIP_ROUTER — the cheapest reliable family probe.
    await client.readContract({ address: sucker, abi: SUCKER_VIEW_ABI, functionName: "CCIP_ROUTER" });
    infraCache.set(key, "ccip");
    return "ccip" as const;
  } catch {
    infraCache.set(key, "native");
    return "native" as const;
  }
}

function unpack32(value: Hex): Address {
  return `0x${value.slice(-40)}` as Address;
}

function isZero32(value: Hex | undefined | null): boolean {
  return !value || /^0x0+$/.test(value);
}

/** The token-identity key a context represents (native sentinel or the address). */
function contextKey(token: Address): string {
  return token.toLowerCase();
}

async function collectOutboxLeaves(args: {
  chainId: JBChainId;
  sucker: Address;
  token: Address;
  count: number;
}): Promise<{ byIndex: Record<number, OutboxLeaf>; blockOf: Record<number, bigint>; ts: Record<number, number> }> {
  const { chainId, sucker, token, count } = args;
  const client = getViemPublicClient(chainId) as PublicClient;
  const cacheKey = `${chainId}:${sucker.toLowerCase()}:${token.toLowerCase()}`;
  const cached = leafCache.get(cacheKey);

  const byIndex: Record<number, OutboxLeaf> =
    cached && cached.count <= count ? { ...cached.byIndex } : {};
  const blockOf: Record<number, bigint> =
    cached && cached.count <= count ? { ...cached.blockOf } : {};
  const ts: Record<number, number> = cached && cached.count <= count ? { ...cached.ts } : {};

  // The outbox tree is cumulative: scan log windows backwards until every leaf in
  // [0, count) is present. A fixed recent-window cap would strand older claimables.
  const WINDOW = 45_000n;
  let cursor = await client.getBlockNumber();
  while (Object.keys(byIndex).length < count && cursor >= 0n) {
    const windows: { lo: bigint; hi: bigint }[] = [];
    for (let n = 0; n < 4 && cursor >= 0n; n++) {
      const hi = cursor;
      const lo = hi >= WINDOW ? hi - WINDOW + 1n : 0n;
      windows.push({ lo, hi });
      cursor = lo === 0n ? -1n : lo - 1n;
    }
    const batches = await Promise.all(
      windows.map((w) =>
        client.getLogs({
          address: sucker,
          event: INSERT_TO_OUTBOX_EVENT,
          args: { token },
          fromBlock: w.lo,
          toBlock: w.hi,
        }),
      ),
    );
    for (const batch of batches) {
      for (const log of batch) {
        const index = Number(log.args.index);
        if (Number.isSafeInteger(index) && index >= 0 && index < count && byIndex[index] === undefined) {
          byIndex[index] = {
            hashed: log.args.hashed!,
            root: log.args.root!,
            beneficiary: log.args.beneficiary!,
            projectTokenCount: log.args.projectTokenCount!,
            terminalTokenAmount: log.args.terminalTokenAmount!,
            metadata: log.args.metadata!,
          };
          blockOf[index] = log.blockNumber;
        }
      }
    }
  }
  if (Object.keys(byIndex).length !== count) {
    throw new Error("The RPC could not return the complete bridge outbox history.");
  }

  const missingTs = Object.keys(blockOf)
    .map(Number)
    .filter((k) => ts[k] == null);
  const stamps = await Promise.all(
    missingTs.map(async (k) => {
      const block = await client.getBlock({ blockNumber: blockOf[k] });
      return [k, Number(block.timestamp)] as const;
    }),
  );
  for (const [k, t] of stamps) ts[k] = t;

  leafCache.set(cacheKey, { count, byIndex, blockOf, ts });
  return { byIndex, blockOf, ts };
}

/**
 * Reconstructs every cross-chain token movement for a v6 project group, with a
 * verified merkle proof attached to each claimable leaf.
 */
export async function fetchV6BridgeRows(
  chains: { chainId: JBChainId; projectId: bigint }[],
): Promise<V6BridgeRow[]> {
  const rows: V6BridgeRow[] = [];
  const projectIdByChain = new Map(chains.map((c) => [Number(c.chainId), c.projectId]));

  await Promise.all(
    chains.map(async ({ chainId: C, projectId }) => {
      const client = getViemPublicClient(C) as PublicClient;
      const [sourceContexts, pairs] = await Promise.all([
        getAccountingContexts(client, { chainId: C, projectId }),
        getV6SuckerPairs(client, { chainId: C, projectId }),
      ]);

      await Promise.all(
        pairs.map(async (pair) => {
          const R = Number(pair.remoteChainId) as JBChainId;
          const remoteProjectId = projectIdByChain.get(R);
          if (remoteProjectId === undefined) return;
          const remoteClient = getViemPublicClient(R) as PublicClient;
          const [infra, remoteContexts] = await Promise.all([
            classifySuckerInfra(C, pair.local),
            getAccountingContexts(remoteClient, { chainId: R, projectId: remoteProjectId }),
          ]);

          await Promise.all(
            sourceContexts.map(async (acct) => {
              const TOKEN = acct.token as Address;
              const outbox = await client.readContract({
                address: pair.local,
                abi: SUCKER_VIEW_ABI,
                functionName: "outboxOf",
                args: [TOKEN],
              });
              const count = Number(outbox.tree.count);
              const sentCount = Number(outbox.numberOfClaimsSent);
              if (
                !Number.isSafeInteger(count) ||
                count < 0 ||
                !Number.isSafeInteger(sentCount) ||
                sentCount < 0 ||
                sentCount > count
              ) {
                throw new Error("The bridge outbox returned invalid counters.");
              }
              if (count === 0) return;

              // The destination inbox is keyed by the sucker's exact token mapping — not
              // by whichever accounting context happens to be first on that chain.
              const mapping = await client.readContract({
                address: pair.local,
                abi: SUCKER_VIEW_ABI,
                functionName: "remoteTokenFor",
                args: [TOKEN],
              });
              let remoteToken: Address | null = isZero32(mapping.addr) ? null : unpack32(mapping.addr);

              // A mapping can be disabled after its cumulative tree has entries. Recover
              // only an unambiguous same-asset destination context; claiming against a
              // guessed token would be unsafe.
              if (!remoteToken) {
                const candidates = remoteContexts.filter(
                  (context) =>
                    context.decimals === acct.decimals &&
                    contextKey(context.token as Address) === contextKey(TOKEN),
                );
                if (candidates.length !== 1) {
                  throw new Error("A historical bridge token mapping could not be recovered safely.");
                }
                remoteToken = candidates[0].token as Address;
              }
              const remoteAcct = remoteContexts.find(
                (context) => (context.token as Address).toLowerCase() === remoteToken!.toLowerCase(),
              );
              if (!remoteAcct || remoteAcct.decimals !== acct.decimals) {
                throw new Error(
                  "The bridge token mapping does not match a verified destination accounting context.",
                );
              }

              const { byIndex, ts } = await collectOutboxLeaves({
                chainId: C,
                sucker: pair.local,
                token: TOKEN,
                count,
              });

              const leafHashes: Hex[] = [];
              for (let i = 0; i < count; i++) {
                if (!byIndex[i]) throw new Error("The bridge outbox history has a missing leaf.");
                leafHashes.push(byIndex[i].hashed);
              }
              // Sanity: the rebuilt tree must reproduce the latest emitted root.
              const latestProof = suckerLeafProof(leafHashes, count - 1);
              if (
                suckerBranchRoot(leafHashes[count - 1], latestProof, count - 1).toLowerCase() !==
                byIndex[count - 1].root.toLowerCase()
              ) {
                throw new Error("The reconstructed bridge outbox does not match its latest emitted root.");
              }

              const inbox = await remoteClient.readContract({
                address: pair.remote,
                abi: SUCKER_VIEW_ABI,
                functionName: "inboxOf",
                args: [remoteToken],
              });
              const inboxRoot = inbox.root ?? zeroHash;
              let deliveredCount = 0;
              if (!isZero32(inboxRoot)) {
                for (const key of Object.keys(byIndex).map(Number)) {
                  if (byIndex[key].root.toLowerCase() === inboxRoot.toLowerCase()) {
                    deliveredCount = key + 1;
                  }
                }
              }

              const executed = await Promise.all(
                Array.from({ length: count }, (_, index) =>
                  remoteClient
                    .readContract({
                      address: pair.remote,
                      abi: SUCKER_VIEW_ABI,
                      functionName: "executedLeafHashOf",
                      args: [remoteToken!, BigInt(index)],
                    })
                    .then((hash) => !isZero32(hash)),
                ),
              );

              for (let k = 0; k < count; k++) {
                const leaf = byIndex[k];
                let status: V6BridgeRowStatus;
                let proof: Hex[] | null = null;
                let canExecute = false;
                if (executed[k]) {
                  status = "claimed";
                } else if (k < deliveredCount) {
                  proof = suckerLeafProof(leafHashes.slice(0, deliveredCount), k);
                  if (suckerBranchRoot(leaf.hashed, proof, k).toLowerCase() !== inboxRoot.toLowerCase()) {
                    throw new Error(
                      "The locally reconstructed bridge proof does not match the destination inbox.",
                    );
                  }
                  status = "claimable";
                } else {
                  status = "pending";
                  canExecute = k >= sentCount;
                }
                rows.push({
                  createdAt: ts[k],
                  chainId: C,
                  peerChainId: R,
                  beneficiary: unpack32(leaf.beneficiary),
                  beneficiary32: leaf.beneficiary,
                  projectTokenCount: leaf.projectTokenCount,
                  terminalTokenAmount: leaf.terminalTokenAmount,
                  status,
                  index: k,
                  sourceSucker: pair.local,
                  peerSucker: pair.remote,
                  metadata: leaf.metadata,
                  proof,
                  canExecute,
                  token: TOKEN,
                  remoteToken,
                  tokenDecimals: acct.decimals,
                  infra,
                });
              }
            }),
          );
        }),
      );
    }),
  );

  rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return rows;
}

/** Builds the destination-chain claim tx for a claimable row (proof already verified). */
export function buildV6ClaimTxFromRow(row: V6BridgeRow) {
  if (row.status !== "claimable" || !row.proof || row.proof.length !== TREE_DEPTH) {
    throw new Error("Only claimable movements carry a verified proof.");
  }
  return buildBridgeClaimTx({
    chainId: row.peerChainId,
    sucker: row.peerSucker,
    claim: {
      token: row.remoteToken,
      leaf: {
        index: BigInt(row.index),
        beneficiary: row.beneficiary32,
        projectTokenCount: row.projectTokenCount,
        terminalTokenAmount: row.terminalTokenAmount,
        metadata: row.metadata,
      },
      proof: row.proof as unknown as Parameters<typeof buildBridgeClaimTx>[0]["claim"]["proof"],
    },
  });
}

/**
 * The msg.value `toRemote` needs. Native-bridge suckers: exactly the registry's
 * `toRemoteFee` (any extra reverts). CCIP suckers: fee + enough native ETH for the CCIP
 * message — discovered by simulating at escalating budgets (excess is refunded
 * on-chain; zero would flip the sucker into LINK-fee mode and revert on the missing
 * allowance). Returns null when no budget can be verified, so callers surface an error
 * instead of prompting a reverting tx.
 */
export async function findToRemoteValue(
  chainId: JBChainId,
  sucker: Address,
  token: Address,
  account: Address | undefined,
): Promise<bigint | null> {
  const client = getViemPublicClient(chainId) as PublicClient;
  let fee: bigint;
  try {
    const registry = getJBContractAddress(JBSuckerContracts.JBSuckerRegistry, 6, chainId);
    fee = BigInt(
      await client.readContract({
        address: registry,
        abi: [
          {
            type: "function",
            name: "toRemoteFee",
            stateMutability: "view",
            inputs: [],
            outputs: [{ type: "uint256" }],
          },
        ] as const,
        functionName: "toRemoteFee",
      }),
    );
  } catch {
    return null;
  }
  const infra = await classifySuckerInfra(chainId, sucker);
  if (infra === "native") return fee;
  if (!account) return null;

  const data = encodeFunctionData({ abi: SUCKER_VIEW_ABI, functionName: "toRemote", args: [token] });
  // 0.001 … 0.5 ETH of CCIP budget above the registry fee; the first simulating tier
  // wins (the contract refunds the excess over its internally computed getFee).
  const ladder = [
    1_000_000_000_000_000n,
    5_000_000_000_000_000n,
    20_000_000_000_000_000n,
    50_000_000_000_000_000n,
    200_000_000_000_000_000n,
    500_000_000_000_000_000n,
  ];
  for (const budget of ladder) {
    const value = fee + budget;
    try {
      await client.call({
        account,
        to: sucker,
        data,
        value,
        stateOverride: [{ address: account, balance: 10n ** 21n }],
      });
      return value;
    } catch {
      // Insufficient — try a larger budget.
    }
  }
  return null;
}
