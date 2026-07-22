import { jbRouterTerminalRegistryAbi, NATIVE_TOKEN } from "@bananapus/nana-sdk-core";
import { Address, formatUnits, PublicClient } from "viem";

/** The v6 pay card's modes: mint tokens, or top up the balance minting nothing. */
export type V6PayMode = "pay" | "addbalance";

/** A token the pay card can pay with, resolved on-chain per selected chain. */
export interface V6PayTokenOption {
  token: Address;
  decimals: number;
  /** Accounting-context currency id (`uint32(uint160(token))` for router tokens). */
  currency: number;
  symbol: string;
  /**
   * True when the token is NOT accepted directly and is paid through the
   * JBRouterTerminalRegistry (which swaps it into the accounting token).
   */
  viaRouter: boolean;
}

/**
 * A stable identity for a pay token — the same token can appear both directly
 * AND via-router, so the key must include the route (website/ fund-loss fix).
 */
export function payTokenKey(t: Pick<V6PayTokenOption, "token" | "viaRouter">): string {
  return `${t.token.toLowerCase()}:${t.viaRouter}`;
}

export function isNativePayToken(address: string): boolean {
  return address.toLowerCase() === NATIVE_TOKEN.toLowerCase();
}

/** Accounting-context currency id for a token (`uint32(uint160(token))`). */
export function payTokenCurrencyId(token: Address): number {
  return Number(BigInt(token) & 0xffffffffn);
}

const ROUTER_PROBE_BENEFICIARY: Address = "0x0000000000000000000000000000000000000001";

/**
 * Whether the router registry can actually route a pay of `token` into
 * `projectId` right now (direct forward, swap, or cash-out loop). A listed
 * router with no pool/feed path reverts at pay time — offering ETH/USDC there
 * is a trap, not a convenience — so a dead route previews an all-zero ruleset
 * (ruleset.id == 0). Cached (as a promise) per (chain, project, token), exactly
 * like website/'s _payRouteCache. Fail-soft: any error resolves false.
 */
const payRouteCache = new Map<string, Promise<boolean>>();
export function routerPayRouteWorks(
  client: PublicClient,
  chainId: number,
  projectId: bigint,
  registry: Address,
  token: Address,
  decimals: number,
): Promise<boolean> {
  const key = `${chainId}:${projectId}:${token.toLowerCase()}`;
  let cached = payRouteCache.get(key);
  if (!cached) {
    cached = client
      .readContract({
        address: registry,
        abi: jbRouterTerminalRegistryAbi,
        functionName: "previewPayFor",
        args: [projectId, token, 10n ** BigInt(decimals), ROUTER_PROBE_BENEFICIARY, "0x"],
      })
      .then((out) => {
        // previewPayFor returns [ruleset, ...]; a dead route yields ruleset.id == 0.
        const ruleset = (out as readonly [{ id: number | bigint }, ...unknown[]])[0];
        return Number(ruleset?.id ?? 0) !== 0;
      })
      .catch(() => false);
    payRouteCache.set(key, cached);
  }
  return cached;
}

/** Initial supply at/above this sentinel means unlimited inventory (website/ parity). */
export const TIER_UNLIMITED_SUPPLY = 999_999_999;

/**
 * Parse a `data:application/json[;base64],…` URI into its JSON object.
 * Null for non-data URIs, non-object JSON, or any decode failure —
 * metadata is cosmetic, so callers fall back rather than throw.
 */
export function parseTierMetadataJson(uri: string): Record<string, unknown> | null {
  if (!uri.startsWith("data:application/json")) return null;
  try {
    const json = JSON.parse(
      uri.includes("base64,")
        ? // decodeURIComponent(escape(...)) round-trips UTF-8 through atob.
          decodeURIComponent(escape(atob(uri.split("base64,")[1])))
        : decodeURIComponent(uri.split(",").slice(1).join(",")),
    ) as unknown;
    return json && typeof json === "object" ? (json as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export interface PickedTierMetadata {
  name?: string;
  description?: string;
  /** Raw image value (`image` ?? `imageUri`) — callers map ipfs:// etc. */
  image?: string;
}

/** The shared field mapping: productName/name, productDescription/description, image/imageUri. */
export function pickTierMetadata(json: Record<string, unknown>): PickedTierMetadata {
  return {
    name: str(json.productName) ?? str(json.name),
    description: str(json.productDescription) ?? str(json.description),
    image: str(json.image) ?? str(json.imageUri),
  };
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

/** Display-ready tier metadata: shared field mapping + renderable media URLs. */
export interface TierDisplayMetadata {
  name?: string;
  description?: string;
  image?: string;
  animationUrl?: string;
  mediaType?: string;
  categoryName?: string;
}

/**
 * The one tier-media resolution chain (shop tab AND pay strip): pick the
 * shared fields, then normalize `image`/`animation_url` into URLs an <img>
 * can actually load (SVG-wrapper unwrapping + IPFS gateway routing).
 */
export function tierDisplayMetadata(json: Record<string, unknown>): TierDisplayMetadata {
  const meta = pickTierMetadata(json);
  return {
    name: meta.name,
    description: meta.description,
    image: tierMediaImageUrl(meta.image),
    animationUrl: tierMediaAssetUrl(json.animationUrl ?? json.animation_url),
    mediaType: str(json.mediaType),
    categoryName: str(json.categoryName),
  };
}

/** `<cid>[/path]` from an ipfs:// URI or any https gateway's /ipfs/ URL. */
function ipfsAssetPath(url: string): string | null {
  if (url.startsWith("ipfs://")) return url.slice("ipfs://".length);
  const gateway = /^https?:\/\/[^/]+\/ipfs\/(.+)$/.exec(url);
  return gateway ? gateway[1] : null;
}

/**
 * Make a tier media URL loadable from the browser. IPFS-addressed URLs —
 * ipfs:// URIs AND ones hot-linked to somebody else's gateway host (Banny
 * resolver SVGs point at bannyverse.infura-ipfs.io) — are re-routed through
 * the app's open gateway: the CID path is immutable, so it serves the same
 * bytes without depending on a third-party host staying up (juicy-vision/
 * website parity; public gateways 504 on cold DHT lookups for these CIDs).
 */
export function tierMediaAssetUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  if (value.startsWith("data:")) return value;
  const path = ipfsAssetPath(value);
  // Serve through the app's own immutable IPFS cache: the upstream gateway
  // throttles a page's worth of parallel cold fetches, and CIDs never change.
  return path ? `/api/ipfs/${path}` : value;
}

/** Decoded markup of a `data:image/svg+xml…` URI (base64 or URL-encoded), else null. */
function svgDataUriMarkup(uri: string): string | null {
  const match = /^data:image\/svg\+xml([^,]*),([\s\S]*)$/.exec(uri);
  if (!match) return null;
  try {
    return match[1].includes("base64")
      ? // decodeURIComponent(escape(...)) round-trips UTF-8 through atob.
        decodeURIComponent(escape(atob(match[2])))
      : decodeURIComponent(match[2]);
  } catch {
    return null;
  }
}

/**
 * Make a metadata image renderable in an <img>. Resolvers sometimes return an
 * SVG data URI that merely wraps an external `<image href="…">` (Banny
 * accessories) — browsers block external loads inside an <img> data URI, so
 * pull the href out and load the bitmap directly (through the gateway, see
 * tierMediaAssetUrl). Self-contained SVGs pass through untouched.
 */
export function tierMediaImageUrl(image: unknown): string | undefined {
  if (typeof image !== "string" || !image) return undefined;
  const markup = svgDataUriMarkup(image);
  if (markup) {
    // Also matches xlink:href, single or double quoted.
    const href = /<image[^>]+href=["']([^"']+)["']/.exec(markup)?.[1];
    if (href && !href.startsWith("data:")) return tierMediaAssetUrl(href);
    return image;
  }
  return tierMediaAssetUrl(image);
}

/** "3d 4h" / "2h 10m" / "5m" countdown label for a ruleset that hasn't started. */
export function formatStartCountdown(secs: number): string {
  if (secs <= 0) return "moments";
  const d = Math.floor(secs / 86400);
  if (d >= 1) return `${d}d ${Math.floor((secs % 86400) / 3600)}h`;
  const h = Math.floor(secs / 3600);
  if (h >= 1) return `${h}h ${Math.floor((secs % 3600) / 60)}m`;
  return `${Math.max(1, Math.floor(secs / 60))}m`;
}

/** Localized token-amount label with sensible fraction digits for the pay card. */
export function formatPayAmount(value: bigint, decimals: number): string {
  const num = Number(formatUnits(value, decimals));
  if (!Number.isFinite(num)) return formatUnits(value, decimals);
  return num.toLocaleString("en-US", {
    maximumFractionDigits: num !== 0 && num < 1 ? 6 : 4,
  });
}
