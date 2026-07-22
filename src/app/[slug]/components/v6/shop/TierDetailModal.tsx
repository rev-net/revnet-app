"use client";

import { ChainLogo } from "@/components/ChainLogo";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SkeletonLines } from "@/components/ui/skeleton";
import { JB_CHAINS, JBChainId } from "@bananapus/nana-sdk-core";
import { effectiveTierPrice, getProject721Shop } from "@bananapus/nana-sdk-core/v6";
import { useQuery } from "@tanstack/react-query";
import { PublicClient } from "viem";
import { useConfig } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { ProjectItem } from "../shared";
import {
  discountLabel,
  formatShopAmount,
  ShopInventory,
  ShopTier,
  TIER_UNLIMITED_SUPPLY,
  tierDisplayName,
  TierMedia,
  useTierCart,
} from "./shopLib";
import { TierMediaPreview } from "./TierMediaPreview";

const FLAG_DESCRIPTIONS: [keyof NonNullable<ShopTier["flags"]>, string, string][] = [
  [
    "allowOwnerMint",
    "Operator can mint",
    "The revnet operator can mint this item for free, without a payment.",
  ],
  ["transfersPausable", "Transfers pausable", "Transfers of this item can be paused."],
  ["cantBeRemoved", "Cannot be removed", "This item can never be removed from the shop."],
  [
    "cantIncreaseDiscountPercent",
    "Discount capped",
    "This item's discount can only be lowered, never increased.",
  ],
  [
    "cantBuyWithCredits",
    "No credit buys",
    "Buyers can't use shop credits to mint this item — only a fresh payment.",
  ],
];

/**
 * The tier detail popup (website/ openTierDetail parity): media, price,
 * supply remaining per chain, quantity stepper feeding the shared cart, and
 * the tier's immutable facts + flags.
 */
export function TierDetailModal({
  shop,
  chainId,
  projects,
  tier,
  media,
  onClose,
}: {
  shop: ShopInventory;
  chainId: JBChainId;
  projects: ProjectItem[];
  tier: ShopTier;
  media: TierMedia | undefined;
  onClose: () => void;
}) {
  const config = useConfig();
  const { quantityOf, setTierQuantity } = useTierCart(shop, chainId);

  const name = tierDisplayName(media, tier.id);
  const quantity = quantityOf(tier.id);
  const soldOut = !tier.unlimited && tier.remaining <= 0;
  const cap = tier.unlimited ? 99 : tier.remaining;
  const discounted = tier.discountPercent > 0;
  const effective = effectiveTierPrice(tier.price, tier.discountPercent);

  // Remaining supply for this tier id on every linked deployment. Per-chain
  // failures stay local so one flaky RPC never hides the chains that read.
  const supply = useQuery({
    queryKey: ["v6Shop721TierSupply", tier.id, projects.map((p) => `${p.chainId}:${p.projectId}`)],
    staleTime: 30_000,
    retry: 1,
    queryFn: async () =>
      Promise.all(
        projects.map(async (project) => {
          const targetChainId = project.chainId as JBChainId;
          try {
            if (targetChainId === chainId) {
              return {
                chainId: targetChainId,
                state: "ready" as const,
                remaining: tier.remaining,
                initial: tier.initial,
              };
            }
            const client = getPublicClient(config, { chainId: targetChainId }) as
              | PublicClient
              | undefined;
            if (!client) return { chainId: targetChainId, state: "unavailable" as const };
            const targetShop = await getProject721Shop(client, {
              chainId: targetChainId,
              projectId: BigInt(project.projectId),
              isRevnet: true,
              tierLimit: 200,
            });
            const targetTier = targetShop?.tiers.find((candidate) => candidate.id === tier.id);
            if (!targetTier) return { chainId: targetChainId, state: "missing" as const };
            return {
              chainId: targetChainId,
              state: "ready" as const,
              remaining: targetTier.remainingSupply,
              initial: targetTier.initialSupply,
            };
          } catch {
            return { chainId: targetChainId, state: "unavailable" as const };
          }
        }),
      ),
  });

  const setFlags = tier.flags ? FLAG_DESCRIPTIONS.filter(([flag]) => tier.flags![flag]) : [];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex min-h-56 items-center justify-center bg-white p-4">
            <TierMediaPreview media={media} tierId={tier.id} alt={name} detail />
          </div>

          <div className="bg-melon-50 p-5">
            <DialogTitle className="pr-8 text-xl font-medium text-zinc-900">{name}</DialogTitle>
            {media?.description ? (
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{media.description}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-lg font-medium text-zinc-900">
                {formatShopAmount(effective, shop.pricing.decimals)} {shop.pricing.symbol}
              </span>
              {discounted ? (
                <>
                  <span className="text-sm text-zinc-500 line-through">
                    {formatShopAmount(tier.price, shop.pricing.decimals)} {shop.pricing.symbol}
                  </span>
                  <span className="rounded-full bg-teal-500 px-2 py-0.5 text-[11px] font-medium text-melon-950">
                    {discountLabel(tier.discountPercent)}
                  </span>
                </>
              ) : null}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTierQuantity(tier, media, quantity - 1)}
                disabled={quantity <= 0}
                aria-label={`Remove one ${name}`}
                className="flex h-9 w-9 items-center justify-center border border-zinc-300 text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-8 text-center font-medium tabular-nums text-zinc-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setTierQuantity(tier, media, Math.min(cap, quantity + 1))}
                disabled={soldOut || quantity >= cap}
                aria-label={`Add one ${name}`}
                className="flex h-9 min-w-9 items-center justify-center bg-melon-500 px-3 text-melon-950 hover:bg-melon-600 disabled:opacity-40"
              >
                +
              </button>
              <span className="ml-1 text-xs text-zinc-500">
                {soldOut
                  ? "Sold out"
                  : tier.unlimited
                    ? "Unlimited inventory"
                    : `${tier.remaining.toLocaleString("en-US")} left on ${JB_CHAINS[chainId]?.name ?? "this chain"}`}
              </span>
            </div>

            <div className="mt-5 border-t border-zinc-200 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Supply by chain
              </p>
              <div className="mt-2 space-y-1.5">
                {supply.isLoading ? (
                  <SkeletonLines lines={Math.max(projects.length, 2)} />
                ) : (
                  supply.data?.map((row) => (
                    <div
                      key={row.chainId}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="inline-flex items-center gap-1.5 text-zinc-600">
                        <ChainLogo chainId={row.chainId} width={15} height={15} />
                        {JB_CHAINS[row.chainId]?.name ?? `Chain ${row.chainId}`}
                      </span>
                      <span className="tabular-nums text-zinc-900">
                        {row.state === "missing"
                          ? "Not on this chain"
                          : row.state === "unavailable"
                            ? "Unavailable"
                            : row.initial >= TIER_UNLIMITED_SUPPLY
                              ? "Unlimited"
                              : `${row.remaining.toLocaleString("en-US")} / ${row.initial.toLocaleString("en-US")} left`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <dl className="mt-4 space-y-1.5 border-t border-zinc-200 pt-4 text-xs">
              <Fact label="Item ID" value={`#${tier.id}`} />
              <Fact
                label="Category"
                value={
                  media?.categoryName ??
                  (tier.category === 0 ? "General" : `Category ${tier.category}`)
                }
              />
              {discounted ? (
                <Fact label="Current discount" value={discountLabel(tier.discountPercent)} />
              ) : null}
              {tier.reserveFrequency > 0 ? (
                <Fact label="Reserve mint" value={`1 per ${tier.reserveFrequency} sold`} />
              ) : null}
              {tier.votingUnits > 0n ? (
                <Fact label="Voting units" value={tier.votingUnits.toLocaleString("en-US")} />
              ) : null}
              {tier.splitPercent > 0 ? (
                <Fact label="Split" value={`${tier.splitPercent / 1e7}% of sales`} />
              ) : null}
            </dl>

            {setFlags.length > 0 ? (
              <div className="mt-4 border-t border-zinc-200 pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Flags</p>
                <div className="mt-2 space-y-2">
                  {setFlags.map(([flag, label, description]) => (
                    <div key={flag}>
                      <p className="text-xs font-medium text-zinc-900">{label}</p>
                      <p className="text-xs text-zinc-500">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right text-zinc-900">{value}</dd>
    </div>
  );
}
