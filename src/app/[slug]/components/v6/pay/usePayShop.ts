"use client";

import {
  payTokenKey,
  TIER_UNLIMITED_SUPPLY,
  V6PayTokenOption,
} from "@/lib/v6/pay";
import {
  JBChainId,
  jbContractAddress,
  JBCoreContracts,
  jb721TiersHookAbi,
  jb721TiersHookStoreAbi,
  jbPricesAbi,
  NATIVE_TOKEN,
} from "@bananapus/nana-sdk-core";
import {
  BASE_CURRENCY_ETH,
  BASE_CURRENCY_USD,
  getProject721Shop,
} from "@bananapus/nana-sdk-core/v6";
import { useQuery } from "@tanstack/react-query";
import { Address, PublicClient } from "viem";
import { useAccount, usePublicClient } from "wagmi";

export interface V6PayShopTier {
  id: number;
  /** Full (undiscounted) price in the shop's pricing units. */
  price: bigint;
  /** Out of 200 (DISCOUNT_DENOMINATOR). */
  discountPercent: number;
  remaining: number;
  unlimited: boolean;
  /** True when shop credits can't fund this tier — fresh payment required. */
  cantBuyWithCredits: boolean;
  /** tokenUriResolver output (data URI), "" when the hook has no resolver. */
  resolvedUri: string;
  encodedIpfsUri: `0x${string}`;
}

export interface V6PayShop {
  hook: Address;
  /**
   * The metadata id target — the hook's METADATA_ID_TARGET (the shared
   * implementation), NOT the clone. Keying by the clone address makes the
   * hook miss the tier ids entirely: payment goes through, no NFT mints.
   */
  idTarget: Address;
  pricingCurrency: number;
  pricingDecimals: number;
  tiers: V6PayShopTier[];
}

export interface V6ShopPayRoute {
  supported: boolean;
  /** Payment-token units per one whole shop-pricing unit. */
  pricePerUnit: bigint | null;
  reason?: string;
}

/** The project's 721 shop (hook + tiers) on the selected chain, or null. */
export function usePayShop(chainId: JBChainId, projectId: bigint) {
  const publicClient = usePublicClient({ chainId });

  return useQuery({
    queryKey: ["v6PayShop", chainId, projectId.toString()],
    enabled: !!publicClient,
    staleTime: 120_000,
    retry: 1,
    queryFn: async (): Promise<V6PayShop | null> => {
      const client = publicClient as PublicClient;
      // Everything in revnet-app is a revnet — hook resolution goes through REVOwner.
      const resolved = await getProject721Shop(client, {
        chainId,
        projectId,
        isRevnet: true,
        tierLimit: 200,
      });
      if (!resolved) return null;
      const rawTiers = await client
        .readContract({
          address: resolved.store,
          abi: jb721TiersHookStoreAbi,
          functionName: "tiersOf",
          args: [resolved.hook, [], true, 0n, 200n],
        })
        .catch(() => []);
      const flagsById = new Map(rawTiers.map((rawTier) => [rawTier.id, rawTier.flags] as const));
      return {
        hook: resolved.hook,
        idTarget: resolved.metadataIdTarget,
        pricingCurrency: resolved.pricing.currency,
        pricingDecimals: resolved.pricing.decimals,
        tiers: resolved.tiers.map((t) => ({
          id: t.id,
          price: t.price,
          discountPercent: t.discountPercent,
          remaining: t.remainingSupply,
          unlimited: t.initialSupply >= TIER_UNLIMITED_SUPPLY,
          // Fail closed if the store doesn't return flags: charging fresh
          // funds is safer than underfunding a credit-restricted mint.
          cantBuyWithCredits: flagsById.get(t.id)?.cantBuyWithCredits ?? true,
          // Display metadata resolves through the shared useTierMedia chain.
          resolvedUri: t.resolvedUri ?? "",
          encodedIpfsUri: t.encodedIpfsUri,
        })),
      };
    },
  });
}

/** The connected wallet's shop credits (`payCreditsOf`) on the hook. */
export function usePayShopCredits(chainId: JBChainId, hook: Address | undefined) {
  const publicClient = usePublicClient({ chainId });
  const { address } = useAccount();

  return useQuery({
    queryKey: ["v6PayShopCredits", chainId, hook, address],
    enabled: !!publicClient && !!hook && !!address,
    staleTime: 15_000,
    retry: 1,
    queryFn: () =>
      (publicClient as PublicClient).readContract({
        address: hook!,
        abi: jb721TiersHookAbi,
        functionName: "payCreditsOf",
        args: [address!],
      }),
  });
}

/**
 * Verify every accepted token against the shop's pricing context. JBPrices
 * returns payment-token units per one whole shop-pricing unit; router inputs
 * stay unsupported because the hook only sees the post-swap token.
 */
export function usePayShopRoutes(
  chainId: JBChainId,
  projectId: bigint,
  shop: V6PayShop | null | undefined,
  tokens: V6PayTokenOption[],
) {
  const publicClient = usePublicClient({ chainId });

  return useQuery({
    queryKey: [
      "v6PayShopRoutes",
      chainId,
      projectId.toString(),
      shop?.pricingCurrency,
      shop?.pricingDecimals,
      tokens.map(payTokenKey).join(","),
    ],
    enabled: !!publicClient && !!shop && tokens.length > 0,
    staleTime: 60_000,
    retry: 1,
    queryFn: async (): Promise<Record<string, V6ShopPayRoute>> => {
      const prices = jbContractAddress[6][JBCoreContracts.JBPrices][chainId];
      const entries = await Promise.all(
        tokens.map(async (payToken) => {
          const key = payTokenKey(payToken);
          if (payToken.viaRouter) {
            return [
              key,
              {
                supported: false,
                pricePerUnit: null,
                reason: "Item checkout requires a directly accepted token.",
              },
            ] as const;
          }

          const sameCurrency =
            payToken.currency === shop!.pricingCurrency ||
            (shop!.pricingCurrency === BASE_CURRENCY_ETH &&
              payToken.token.toLowerCase() === NATIVE_TOKEN.toLowerCase());
          if (sameCurrency) {
            return [
              key,
              { supported: true, pricePerUnit: 10n ** BigInt(payToken.decimals) },
            ] as const;
          }

          if (!prices) {
            return [
              key,
              {
                supported: false,
                pricePerUnit: null,
                reason: "No price contract is available on this chain.",
              },
            ] as const;
          }
          const pricePerUnit = await (publicClient as PublicClient)
            .readContract({
              address: prices,
              abi: jbPricesAbi,
              functionName: "pricePerUnitOf",
              args: [
                projectId,
                BigInt(payToken.currency),
                BigInt(shop!.pricingCurrency),
                BigInt(payToken.decimals),
              ],
            })
            .catch(() => 0n);
          return [
            key,
            pricePerUnit > 0n
              ? { supported: true, pricePerUnit }
              : {
                  supported: false,
                  pricePerUnit: null,
                  reason: "No price feed converts this payment token.",
                },
          ] as const;
        }),
      );
      return Object.fromEntries(entries);
    },
  });
}

export { BASE_CURRENCY_ETH, BASE_CURRENCY_USD };
