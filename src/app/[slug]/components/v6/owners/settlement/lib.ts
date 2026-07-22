import { getViemPublicClient } from "@/lib/wagmiConfig";
import {
  JB_CHAINS,
  JBChainId,
  jbContractAddress,
  JBCoreContracts,
  jbDirectoryAbi,
  jbControllerAbi,
  jbMultiTerminalAbi,
  jbSuckerRegistryAbi,
  jbTerminalStoreAbi,
  JBSuckerContracts,
  NATIVE_TOKEN,
} from "@bananapus/nana-sdk-core";
import { getAccountingContexts, getV6SuckerPairs } from "@bananapus/nana-sdk-core/v6";
import {
  Address,
  Chain,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  PublicClient,
  zeroAddress,
} from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
} from "viem/chains";
import { ProjectItem } from "../../shared";

/** One (chainId, projectId) leg of the omnichain project group. */
export interface ChainProject {
  chainId: JBChainId;
  projectId: bigint;
}

export function toChainProjects(projects: ProjectItem[]): ChainProject[] {
  return projects
    .filter((p) => p.chainId != null && p.projectId != null)
    .map((p) => ({ chainId: p.chainId as JBChainId, projectId: BigInt(p.projectId) }));
}

export function chainProjectsKey(chains: ChainProject[]): string {
  return chains
    .map((c) => `${c.chainId}:${c.projectId}`)
    .sort()
    .join(",");
}

const VIEM_CHAINS: Chain[] = [
  mainnet,
  optimism,
  arbitrum,
  base,
  sepolia,
  optimismSepolia,
  baseSepolia,
  arbitrumSepolia,
];

export function viemChainOf(chainId: JBChainId): Chain | undefined {
  return VIEM_CHAINS.find((c) => c.id === Number(chainId));
}

export function chainName(chainId: JBChainId): string {
  return JB_CHAINS[chainId]?.name ?? `Chain ${chainId}`;
}

export function explorerAddressUrl(chainId: JBChainId, address: string): string | null {
  const chain = viemChainOf(chainId);
  const base = chain?.blockExplorers?.default?.url;
  return base ? `${base.replace(/\/$/, "")}/address/${address}` : null;
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function fmtUnits(value: bigint, decimals: number): string {
  const neg = value < 0n;
  const v = neg ? -value : value;
  const n = Number(formatUnits(v, decimals));
  if (!isFinite(n)) return formatUnits(value, decimals);
  let out: string;
  if (n === 0) out = "0";
  else if (n < 0.0001) out = n.toExponential(2);
  else if (n >= 1_000_000)
    out = Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(n);
  else out = Intl.NumberFormat("en", { maximumFractionDigits: n >= 1 ? 4 : 6 }).format(n);
  return (neg ? "-" : "") + out;
}

/** Share of `total` as "12.3%", or null when the total is unknown/zero. */
export function pctOf(part: bigint, total: bigint | null): string | null {
  if (total == null || total <= 0n) return null;
  const bps = Number((part * 10000n) / total);
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 1)}%`;
}

export function timeAgo(ts?: number): string {
  if (!ts) return "—";
  const s = Math.floor(Date.now() / 1000) - ts;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

// ── Token identity ────────────────────────────────────────────────────────────

export function isNativeToken(token: string): boolean {
  const lc = token.toLowerCase();
  return lc === NATIVE_TOKEN.toLowerCase() || lc === zeroAddress;
}

const symbolCache = new Map<string, string>();

/** ERC-20 symbol on a chain; native sentinel → ETH; unreadable → "tokens". */
export async function tokenSymbolOf(chainId: JBChainId, token: Address): Promise<string> {
  if (isNativeToken(token)) return "ETH";
  const key = `${chainId}:${token.toLowerCase()}`;
  const cached = symbolCache.get(key);
  if (cached) return cached;
  try {
    const client = getViemPublicClient(chainId) as PublicClient;
    const symbol = await client.readContract({ address: token, abi: erc20Abi, functionName: "symbol" });
    symbolCache.set(key, symbol);
    return symbol;
  } catch {
    return "tokens";
  }
}

/** The project's ERC-20 symbol (same address on every chain of the group). */
export async function projectTokenSymbol(projects: ProjectItem[]): Promise<string> {
  const withToken = projects.find((p) => p.token);
  if (!withToken?.token) return "tokens";
  return tokenSymbolOf(withToken.chainId as JBChainId, withToken.token as Address);
}

// ── Shared reads ──────────────────────────────────────────────────────────────

function directoryOf(chainId: JBChainId): Address {
  return jbContractAddress[6][JBCoreContracts.JBDirectory][chainId] as Address;
}

/** The project's controller, resolved from the directory (never hardcoded). */
async function controllerOf(client: PublicClient, chainId: JBChainId, projectId: bigint) {
  return client.readContract({
    address: directoryOf(chainId),
    abi: jbDirectoryAbi,
    functionName: "controllerOf",
    args: [projectId],
  });
}

async function readSupply(
  client: PublicClient,
  chainId: JBChainId,
  projectId: bigint,
): Promise<bigint | null> {
  try {
    const controller = await controllerOf(client, chainId, projectId);
    if (!controller || controller === zeroAddress) return null;
    return await client.readContract({
      address: controller,
      abi: jbControllerAbi,
      functionName: "totalTokenSupplyWithReservedTokensOf",
      args: [projectId],
    });
  } catch {
    return null;
  }
}

// ── Across-chains card data ───────────────────────────────────────────────────

export interface AcrossChainBalance {
  token: Address;
  symbol: string;
  decimals: number;
  balance: bigint;
}

export interface AcrossChainRow {
  chainId: JBChainId;
  /** Total token supply incl. pending reserved, or null when unreadable. */
  supply: bigint | null;
  /** Terminal surplus per accounting context, or null when unreadable. */
  balances: AcrossChainBalance[] | null;
  /** Cash-out value of ONE project token, in the primary accounting token. */
  unitValue: { value: bigint; symbol: string; decimals: number } | null;
}

export async function fetchAcrossChains(chains: ChainProject[]): Promise<AcrossChainRow[]> {
  return Promise.all(
    chains.map(async ({ chainId, projectId }): Promise<AcrossChainRow> => {
      const client = getViemPublicClient(chainId) as PublicClient;
      const [supply, contexts] = await Promise.all([
        readSupply(client, chainId, projectId),
        getAccountingContexts(client, { chainId, projectId }).catch(() => null),
      ]);

      let balances: AcrossChainBalance[] | null = null;
      let unitValue: AcrossChainRow["unitValue"] = null;
      if (contexts && contexts.length) {
        balances = await Promise.all(
          contexts.map(async (ctx) => {
            const symbol = await tokenSymbolOf(chainId, ctx.token);
            try {
              const terminal = await client.readContract({
                address: directoryOf(chainId),
                abi: jbDirectoryAbi,
                functionName: "primaryTerminalOf",
                args: [projectId, ctx.token],
              });
              const surplus = await client.readContract({
                address: terminal,
                abi: jbMultiTerminalAbi,
                functionName: "currentSurplusOf",
                args: [projectId, [ctx.token], BigInt(ctx.decimals), BigInt(ctx.currency)],
              });
              return { token: ctx.token, symbol, decimals: ctx.decimals, balance: surplus };
            } catch {
              return { token: ctx.token, symbol, decimals: ctx.decimals, balance: -1n };
            }
          }),
        );
        // A -1 marker means that context's surplus was unreadable — drop to null-safe form.
        if (balances.some((b) => b.balance < 0n)) balances = balances.filter((b) => b.balance >= 0n);

        // Unit value: what a 1M-token cash out reclaims, scaled back down — a
        // single-token probe floors to 0 against big supplies on 6-dec tokens.
        const primary = contexts[0];
        try {
          const supplyNow = supply ?? 0n;
          const probe = supplyNow > 0n ? (supplyNow < 10n ** 24n ? supplyNow : 10n ** 24n) : 0n;
          if (probe > 0n) {
            const store = jbContractAddress[6][JBCoreContracts.JBTerminalStore][chainId] as Address;
            const reclaim = await client.readContract({
              address: store,
              abi: jbTerminalStoreAbi,
              functionName: "currentReclaimableSurplusOf",
              args: [
                projectId,
                probe,
                [],
                [primary.token],
                BigInt(primary.decimals),
                BigInt(primary.currency),
              ],
            });
            unitValue = {
              value: (reclaim * 10n ** 18n) / probe,
              symbol: await tokenSymbolOf(chainId, primary.token),
              decimals: primary.decimals,
            };
          }
        } catch {
          unitValue = null;
        }
      }

      return { chainId, supply, balances, unitValue };
    }),
  );
}

// ── Bridges card data ─────────────────────────────────────────────────────────

export type SuckerInfra = "ccip" | "native" | "unknown";

const INFRA_PROBE_ABI = [
  { type: "function", name: "CCIP_ROUTER", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "OPMESSENGER", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "ARBINBOX", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
] as const;

const infraCache = new Map<string, SuckerInfra>();

/**
 * Which bridge family a sucker routes through. CCIP suckers expose CCIP_ROUTER;
 * native suckers are identified positively via their bridge getters (a CCIP_ROUTER
 * revert alone could just be an RPC failure).
 */
export async function classifySuckerInfra(chainId: JBChainId, sucker: Address): Promise<SuckerInfra> {
  const key = `${chainId}:${sucker.toLowerCase()}`;
  const cached = infraCache.get(key);
  if (cached) return cached;
  const client = getViemPublicClient(chainId) as PublicClient;
  const probe = (fn: "CCIP_ROUTER" | "OPMESSENGER" | "ARBINBOX") =>
    client.readContract({ address: sucker, abi: INFRA_PROBE_ABI, functionName: fn });
  let infra: SuckerInfra = "unknown";
  try {
    await probe("CCIP_ROUTER");
    infra = "ccip";
  } catch {
    try {
      await probe("OPMESSENGER");
      infra = "native";
    } catch {
      try {
        await probe("ARBINBOX");
        infra = "native";
      } catch {
        infra = "unknown";
      }
    }
  }
  if (infra !== "unknown") infraCache.set(key, infra);
  return infra;
}

export interface BridgeEdge {
  a: JBChainId;
  b: JBChainId;
  infra: SuckerInfra;
}

/**
 * One row per distinct bridge edge, deduped by (sorted chain pair + infra) so the
 * two chain-side readings of the same sucker collapse — but a native edge and a
 * CCIP edge on the same pair both stay (the redundant-cohort wiring).
 */
export async function fetchBridges(chains: ChainProject[]): Promise<BridgeEdge[]> {
  const all: { a: JBChainId; b: JBChainId; local: Address }[] = [];
  await Promise.all(
    chains.map(async ({ chainId, projectId }) => {
      const client = getViemPublicClient(chainId) as PublicClient;
      const pairs = await getV6SuckerPairs(client, { chainId, projectId }).catch(() => []);
      for (const p of pairs) {
        all.push({ a: chainId, b: Number(p.remoteChainId) as JBChainId, local: p.local });
      }
    }),
  );
  const classified = await Promise.all(
    all.map(async (s) => ({ ...s, infra: await classifySuckerInfra(s.a, s.local) })),
  );
  const seen = new Set<string>();
  const edges: BridgeEdge[] = [];
  for (const s of classified) {
    const [lo, hi] = [Number(s.a), Number(s.b)].sort((x, y) => x - y);
    const key = `${lo}-${hi}:${s.infra}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push({ a: lo as JBChainId, b: hi as JBChainId, infra: s.infra });
  }
  edges.sort((x, y) => Number(x.a) - Number(y.a) || Number(x.b) - Number(y.b));
  return edges;
}

// ── Gossip card data ──────────────────────────────────────────────────────────

export type GossipLevel = "synced" | "slight" | "danger" | "never" | "unknown";

export interface GossipPeerRow {
  peerChainId: JBChainId;
  /** What the viewing chain believes the peer's supply is. */
  supply: bigint;
  balances: { token: Address; symbol: string; decimals: number; balance: bigint }[];
  /** Unix seconds of the accepted snapshot; 0 = never. */
  snapshot: number;
  level: GossipLevel;
  label: string;
  /** The PEER-side sucker to run syncAccountingData on (it re-pushes here). */
  syncSucker: Address | null;
}

export interface GossipChainView {
  chainId: JBChainId;
  peers: GossipPeerRow[];
}

function relDrift(a: bigint, b: bigint): number {
  if (a === 0n && b === 0n) return 0;
  const hi = a > b ? a : b;
  if (hi === 0n) return 0;
  const d = a > b ? a - b : b - a;
  return Number((d * 10000n) / hi) / 10000;
}

function levelFromDrift(worst: number): { level: GossipLevel; label: string } {
  if (worst === 0) return { level: "synced", label: "In sync" };
  const label = `${Math.round(worst * 10000) / 100}% stale`;
  // Drift under the keeper's 5% sync threshold is healthy — the % is what matters.
  return worst <= 0.05 ? { level: "slight", label } : { level: "danger", label };
}

/** native@18 or symbol@decimals — token ADDRESSES differ per chain (USDC), symbols don't. */
function balanceBucketKey(symbol: string, decimals: number, native: boolean): string {
  return native ? "native@18" : `${symbol.toLowerCase()}@${decimals}`;
}

/**
 * What each chain knows about its peers' accounting records, read from the
 * REGISTRY's aggregated `peerChainAccountsOf` (a transitively-gossiped record can
 * live on a different sucker than the direct pair, so per-sucker reads miss it).
 * Snapshot timestamps come packed `(ts << 128 | seq)` — unpacked here.
 *
 * Freshness compares the snapshot against the peer's ACTUAL current supply and raw
 * terminal balances. When token buckets can't be matched across chains the row is
 * "Unverified" — a differing custom-token address may be a legitimate sucker
 * mapping, and inventing drift would make users pay for needless syncs.
 */
export async function fetchGossip(chains: ChainProject[]): Promise<GossipChainView[]> {
  if (chains.length < 2) return [];

  // Live actuals per chain: supply + raw terminal-store balances per context.
  const live = new Map<
    number,
    { supply: bigint | null; buckets: Map<string, bigint> | null }
  >();
  // Peer-side sync suckers: pairs of B keyed by remote chain A.
  const pairsByChain = new Map<number, { local: Address; remoteChainId: number }[]>();

  await Promise.all(
    chains.map(async ({ chainId, projectId }) => {
      const client = getViemPublicClient(chainId) as PublicClient;
      const [supply, pairs] = await Promise.all([
        readSupply(client, chainId, projectId),
        getV6SuckerPairs(client, { chainId, projectId }).catch(() => []),
      ]);
      pairsByChain.set(
        Number(chainId),
        pairs.map((p) => ({ local: p.local, remoteChainId: Number(p.remoteChainId) })),
      );
      let buckets: Map<string, bigint> | null = null;
      try {
        const contexts = await getAccountingContexts(client, { chainId, projectId });
        const store = jbContractAddress[6][JBCoreContracts.JBTerminalStore][chainId] as Address;
        buckets = new Map();
        for (const ctx of contexts) {
          const terminal = await client.readContract({
            address: directoryOf(chainId),
            abi: jbDirectoryAbi,
            functionName: "primaryTerminalOf",
            args: [projectId, ctx.token],
          });
          const balance = await client.readContract({
            address: store,
            abi: jbTerminalStoreAbi,
            functionName: "balanceOf",
            args: [terminal, projectId, ctx.token],
          });
          const symbol = await tokenSymbolOf(chainId, ctx.token);
          const key = balanceBucketKey(symbol, ctx.decimals, isNativeToken(ctx.token));
          // Snapshots cap each source context to uint128; saturate to compare like-for-like.
          const U128 = (1n << 128n) - 1n;
          const prev = buckets.get(key) ?? 0n;
          const sum = prev + (balance > U128 ? U128 : balance);
          buckets.set(key, sum > U128 ? U128 : sum);
        }
      } catch {
        buckets = null;
      }
      live.set(Number(chainId), { supply, buckets });
    }),
  );

  return Promise.all(
    chains.map(async ({ chainId: A, projectId }): Promise<GossipChainView> => {
      const client = getViemPublicClient(A) as PublicClient;
      const registry = jbContractAddress[6][JBSuckerContracts.JBSuckerRegistry][A] as Address;
      const records = new Map<
        number,
        { supply: bigint; snapshot: number; contexts: { token: Address; decimals: number; balance: bigint }[] }
      >();
      let registryReadable = true;
      try {
        const accounts = await client.readContract({
          address: registry,
          abi: jbSuckerRegistryAbi,
          functionName: "peerChainAccountsOf",
          args: [projectId, BigInt(A)],
        });
        for (const a of accounts) {
          records.set(Number(a.chainId), {
            supply: a.totalSupply,
            snapshot: Number(BigInt(a.timestamp) >> 128n), // packed (ts << 128 | seq)
            contexts: a.contexts.map((c) => ({
              token: `0x${String(c.token).slice(-40)}` as Address,
              decimals: Number(c.decimals),
              balance: BigInt(c.balance),
            })),
          });
        }
      } catch {
        registryReadable = false;
      }

      const peers = await Promise.all(
        chains
          .filter((c) => Number(c.chainId) !== Number(A))
          .map(async ({ chainId: B }): Promise<GossipPeerRow> => {
            const record = records.get(Number(B));
            const syncSucker =
              (pairsByChain.get(Number(B)) ?? []).find((p) => p.remoteChainId === Number(A))
                ?.local ?? null;

            const balances = await Promise.all(
              (record?.contexts ?? []).map(async (c) => ({
                token: c.token,
                // Registry records are keyed in the VIEWING chain's local token namespace.
                symbol: await tokenSymbolOf(A, c.token),
                decimals: c.decimals,
                balance: c.balance,
              })),
            );

            if (!registryReadable) {
              return { peerChainId: B, supply: 0n, balances: [], snapshot: 0, level: "unknown", label: "Unverified", syncSucker };
            }
            if (!record || record.snapshot === 0) {
              return {
                peerChainId: B,
                supply: record?.supply ?? 0n,
                balances,
                snapshot: 0,
                level: "never",
                label: "Never synced",
                syncSucker,
              };
            }

            const actual = live.get(Number(B));
            if (!actual || actual.supply == null) {
              return { peerChainId: B, supply: record.supply, balances, snapshot: record.snapshot, level: "unknown", label: "Unverified", syncSucker };
            }

            let worst = relDrift(record.supply, actual.supply);
            if (actual.buckets) {
              const snapBuckets = new Map<string, bigint>();
              for (const b of balances) {
                const key = balanceBucketKey(b.symbol, b.decimals, isNativeToken(b.token));
                snapBuckets.set(key, (snapBuckets.get(key) ?? 0n) + b.balance);
              }
              const keys = new Set([...snapBuckets.keys(), ...actual.buckets.keys()]);
              let unmatched = false;
              for (const key of keys) {
                const snap = snapBuckets.get(key);
                const act = actual.buckets.get(key);
                if (snap == null || act == null) {
                  // Present on one side only with real value → can't verify the mapping.
                  if ((snap ?? act ?? 0n) > 0n) unmatched = true;
                  continue;
                }
                worst = Math.max(worst, relDrift(snap, act));
              }
              if (unmatched) {
                return { peerChainId: B, supply: record.supply, balances, snapshot: record.snapshot, level: "unknown", label: "Unverified", syncSucker };
              }
            }

            const { level, label } = levelFromDrift(worst);
            return { peerChainId: B, supply: record.supply, balances, snapshot: record.snapshot, level, label, syncSucker };
          }),
      );

      return { chainId: A, peers };
    }),
  );
}

// ── Gossip sync (syncAccountingData) ─────────────────────────────────────────

export const suckerSyncAbi = [
  { type: "function", name: "syncAccountingData", stateMutability: "payable", inputs: [], outputs: [] },
] as const;

/**
 * The msg.value `syncAccountingData` needs, discovered by simulating the call
 * itself at escalating budgets (excess is refunded on-chain). Native bridges
 * usually take 0; a CCIP sucker with value 0 flips into LINK-fee mode and pulls
 * unapproved LINK — so CCIP never gets offered 0. Null = nothing simulated
 * cleanly; the caller must surface an error instead of prompting a reverting tx.
 */
export async function findSyncValue(
  chainId: JBChainId,
  sucker: Address,
  account: Address | undefined,
): Promise<bigint | null> {
  if (!account) return null;
  const infra = await classifySuckerInfra(chainId, sucker);
  if (infra === "unknown") return null;
  const client = getViemPublicClient(chainId) as PublicClient;
  const ladder =
    infra === "ccip"
      ? [1_000_000_000_000_000n, 5_000_000_000_000_000n, 20_000_000_000_000_000n, 50_000_000_000_000_000n, 200_000_000_000_000_000n]
      : [0n, 1_000_000_000_000_000n, 10_000_000_000_000_000n];
  for (const value of ladder) {
    try {
      await client.call({
        account,
        to: sucker,
        data: encodeFunctionData({ abi: suckerSyncAbi, functionName: "syncAccountingData" }),
        value,
        stateOverride: [{ address: account, balance: 10n ** 21n }],
      });
      return value;
    } catch {
      // Insufficient / sim limitation — try a larger budget.
    }
  }
  return null;
}

// ── Movement helpers ─────────────────────────────────────────────────────────

/**
 * Rough delivery estimate (from when the message is SENT) by route — CCIP needs
 * source finality + relay; native L2→L1 withdrawals wait out the challenge
 * period; native L1→L2 deposits land in a few minutes.
 */
export function bridgeEtaHint(args: {
  chainId: JBChainId;
  peerChainId: JBChainId;
  infra: SuckerInfra;
}): string | null {
  const isL1 = (id: number) => id === 1 || id === 11155111;
  if (args.infra === "ccip") return "20–30 min";
  if (args.infra !== "native") return null;
  if (!isL1(Number(args.chainId)) && isL1(Number(args.peerChainId))) return "7 days (challenge period)";
  return "a few min";
}

/** Track link for an in-flight bridge message. */
export function bridgeTrackUrl(args: {
  chainId: JBChainId;
  sourceSucker: Address;
  infra: SuckerInfra;
}): string | null {
  if (args.infra === "ccip") return `https://ccip.chain.link/address/${args.sourceSucker}`;
  return explorerAddressUrl(args.chainId, args.sourceSucker);
}
