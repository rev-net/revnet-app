"use client";

import EtherscanLink from "@/components/EtherscanLink";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { JBChainId } from "@bananapus/nana-sdk-core";
import { effectiveTierPrice, isRevnetOperator } from "@bananapus/nana-sdk-core/v6";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { PublicClient } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { usePayShopCredits } from "../pay/usePayShop";
import { ProjectItem } from "../shared";
import { AddItemsModal } from "./AddItemsModal";
import {
  categoryLabel,
  discountLabel,
  formatShopAmount,
  ShopInventory,
  ShopTier,
  TierMedia,
  tierDisplayName,
  useTierCart,
} from "./shopLib";
import { TierDetailModal } from "./TierDetailModal";
import { TierMediaPreview } from "./TierMediaPreview";

/**
 * The Inventory subtab (website/ renderShopSection parity): category filter
 * chips, the category-grouped tier grid, the connected wallet's shop credit,
 * the shared-cart summary pointing at the Pay card, and the operator's
 * "+ Add items" entry.
 */
export function InventorySection({
  shop,
  chainId,
  projectId,
  projects,
  mediaById,
}: {
  shop: ShopInventory;
  chainId: JBChainId;
  projectId: bigint;
  projects: ProjectItem[];
  mediaById: Record<number, TierMedia> | undefined;
}) {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { hasPermission } = useUserPermissions();
  const { count, total } = useTierCart(shop, chainId);
  const { data: credits } = usePayShopCredits(chainId, shop.hook);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [detailTierId, setDetailTierId] = useState<number | null>(null);
  const [addItemsOpen, setAddItemsOpen] = useState(false);

  // Operator affordance: the ADJUST_721_TIERS permission (indexed) or the
  // revnet's live operator (covers indexer lag). The tx itself is gated again
  // by simulation + the hook's own permission check.
  const { data: isOperator } = useQuery({
    queryKey: ["v6RevnetOperator", chainId, projectId.toString(), address],
    enabled: !!address && !!publicClient,
    staleTime: 60_000,
    retry: 1,
    queryFn: () =>
      isRevnetOperator(publicClient as PublicClient, {
        chainId,
        revnetId: projectId,
        operator: address!,
      }),
  });
  const canAddItems =
    hasPermission("ADJUST_721_TIERS") || hasPermission("ROOT") || !!isOperator;

  const categories = useMemo(() => {
    const ids = [...new Set(shop.tiers.map((tier) => tier.category))].sort((a, b) => a - b);
    return ids.map((id) => ({ id, name: categoryLabel(id, shop.tiers, mediaById) }));
  }, [shop.tiers, mediaById]);

  const visibleCategories = useMemo(
    () =>
      categories
        .filter((category) => selectedCategory === null || category.id === selectedCategory)
        .map((category) => ({
          ...category,
          tiers: shop.tiers.filter((tier) => tier.category === category.id),
        })),
    [categories, selectedCategory, shop.tiers],
  );

  const detailTier =
    detailTierId == null ? null : shop.tiers.find((tier) => tier.id === detailTierId) ?? null;

  return (
    <div className="border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium text-zinc-900">Items</h2>
        {canAddItems ? (
          <button
            type="button"
            onClick={() => setAddItemsOpen(true)}
            className="text-sm text-teal-600 hover:text-teal-700"
            title="Add items for sale (operator only)"
          >
            + Add items
          </button>
        ) : null}
      </div>

      {address && (credits ?? 0n) > 0n ? (
        <p
          className="mt-3 bg-teal-50 px-3 py-2 text-sm text-teal-800"
          title="Overpayment becomes shop credit and is applied automatically to eligible items at checkout."
        >
          Your shop credit:{" "}
          <span className="font-medium">
            {formatShopAmount(credits!, shop.pricing.decimals)} {shop.pricing.symbol}
          </span>{" "}
          — applied automatically at checkout.
        </p>
      ) : null}

      {shop.tiers.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          No items being sold yet.
          {canAddItems ? " Add the first one with “+ Add items”." : ""}
        </p>
      ) : (
        <>
          {categories.length > 1 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[{ id: null as number | null, name: "All" }, ...categories].map((category) => (
                <button
                  key={category.id ?? "all"}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  aria-pressed={selectedCategory === category.id}
                  className={clsx(
                    "border px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedCategory === category.id
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-teal-300 hover:text-teal-600",
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-5">
            {visibleCategories.map((category) => (
              <div key={category.id}>
                {categories.length > 1 ? (
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {category.name}
                  </h3>
                ) : null}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {category.tiers.map((tier) => (
                    <TierCard
                      key={tier.id}
                      shop={shop}
                      chainId={chainId}
                      tier={tier}
                      media={mediaById?.[tier.id]}
                      onOpen={() => setDetailTierId(tier.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {count > 0 ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-4 flex w-full items-center justify-between gap-3 bg-teal-500 px-4 py-3 text-sm font-medium text-melon-950 hover:bg-teal-600"
        >
          <span>
            {count} item{count === 1 ? "" : "s"} selected —{" "}
            {formatShopAmount(total, shop.pricing.decimals)} {shop.pricing.symbol}
          </span>
          <span>Check out in the Pay card →</span>
        </button>
      ) : null}

      <div className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
        Collection:{" "}
        <EtherscanLink value={shop.hook} truncateTo={6} className="font-mono text-zinc-600" />
      </div>


      {detailTier ? (
        <TierDetailModal
          shop={shop}
          chainId={chainId}
          projects={projects}
          tier={detailTier}
          media={mediaById?.[detailTier.id]}
          onClose={() => setDetailTierId(null)}
        />
      ) : null}

      {addItemsOpen ? (
        <AddItemsModal
          shop={shop}
          chainId={chainId}
          projectId={projectId}
          onClose={() => setAddItemsOpen(false)}
        />
      ) : null}
    </div>
  );
}

function TierCard({
  shop,
  chainId,
  tier,
  media,
  onOpen,
}: {
  shop: ShopInventory;
  chainId: JBChainId;
  tier: ShopTier;
  media: TierMedia | undefined;
  onOpen: () => void;
}) {
  const { quantityOf, setTierQuantity } = useTierCart(shop, chainId);

  const name = tierDisplayName(media, tier.id);
  const quantity = quantityOf(tier.id);
  const soldOut = !tier.unlimited && tier.remaining <= 0;
  const cap = tier.unlimited ? 99 : tier.remaining;
  const discounted = tier.discountPercent > 0;
  const effective = effectiveTierPrice(tier.price, tier.discountPercent);

  return (
    <div
      data-tier-id={tier.id}
      className={clsx(
        "overflow-hidden border bg-white transition",
        quantity > 0 ? "border-teal-500" : "border-zinc-200",
        soldOut && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View details for ${name}`}
        className="relative block aspect-square w-full bg-white text-left"
      >
        <TierMediaPreview media={media} tierId={tier.id} alt={name} />
        {discounted ? (
          <span className="absolute left-2 top-2 rounded-full bg-teal-500 px-2 py-0.5 text-[11px] font-medium text-melon-950">
            {discountLabel(tier.discountPercent)}
          </span>
        ) : null}
        {soldOut ? (
          <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-zinc-900">
            Sold out
          </span>
        ) : null}
        {quantity > 0 ? (
          <span className="absolute bottom-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-teal-500 px-1.5 text-xs font-medium text-melon-950">
            {quantity}
          </span>
        ) : null}
      </button>

      <div className="border-t border-zinc-200 bg-melon-50 p-3">
        <button
          type="button"
          onClick={onOpen}
          className="block w-full truncate text-left text-sm font-medium text-zinc-900 hover:underline"
        >
          {name}
        </button>

        <p className="mt-1 text-sm text-zinc-900">
          <span className="font-medium">
            {formatShopAmount(effective, shop.pricing.decimals)} {shop.pricing.symbol}
          </span>
          {discounted ? (
            <span className="ml-1.5 text-xs text-zinc-400 line-through">
              {formatShopAmount(tier.price, shop.pricing.decimals)}
            </span>
          ) : null}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs text-zinc-500">
            {soldOut
              ? "None left"
              : tier.unlimited
                ? "Unlimited"
                : `${tier.remaining.toLocaleString("en-US")} left`}
          </p>
          {soldOut ? null : quantity === 0 ? (
            <button
              type="button"
              onClick={() => setTierQuantity(tier, media, 1)}
              className="border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 hover:border-teal-400 hover:text-teal-600"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTierQuantity(tier, media, quantity - 1)}
                aria-label={`Remove one ${name}`}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-300 text-xs text-zinc-700"
              >
                −
              </button>
              <span className="min-w-4 text-center text-xs tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setTierQuantity(tier, media, Math.min(cap, quantity + 1))}
                disabled={quantity >= cap}
                aria-label={`Add one ${name}`}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-300 text-xs text-zinc-700 disabled:opacity-40"
              >
                +
              </button>
            </div>
          )}
        </div>

        {tier.reserveFrequency > 0 || tier.votingUnits > 0n ? (
          <p className="mt-1 text-[11px] text-zinc-400">
            {tier.reserveFrequency > 0 ? `1 of every ${tier.reserveFrequency} reserved` : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}
