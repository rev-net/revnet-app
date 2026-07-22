"use client";

import { formatPayAmount } from "@/lib/v6/pay";
import { JBChainId } from "@bananapus/nana-sdk-core";
import { effectiveTierPrice } from "@bananapus/nana-sdk-core/v6";
import { useShopCart } from "../ShopCartContext";
import { useTierMedia } from "../shop/shopLib";
import { TierMediaPreview } from "../shop/TierMediaPreview";
import { V6PayShop, V6PayShopTier } from "./usePayShop";

/**
 * The compact selectable NFT strip on the pay card (website/ renderPayShopStrip
 * parity). Selecting items feeds the shared shop cart, which the card turns
 * into 721 tier-mint metadata and a synced pay amount. Item art resolves
 * through the same useTierMedia chain (and query cache) as the Shop tab.
 */
export function V6PayShopStrip({
  shop,
  chainId,
  pricingSymbol,
  busy,
}: {
  shop: V6PayShop;
  chainId: JBChainId;
  pricingSymbol: string;
  busy: boolean;
}) {
  const cart = useShopCart();
  const { data: mediaById } = useTierMedia(chainId, shop);

  const quantityOf = (tierId: number) =>
    cart.items.find((i) => Number(i.tierId) === tierId && i.chainId === chainId)?.quantity ?? 0;

  const setTierQuantity = (tier: V6PayShopTier, quantity: number) => {
    const existing = cart.items.find(
      (i) => Number(i.tierId) === tier.id && i.chainId === chainId,
    );
    if (!existing && quantity > 0) {
      const media = mediaById?.[tier.id];
      cart.add({
        tierId: BigInt(tier.id),
        quantity,
        price: effectiveTierPrice(tier.price, tier.discountPercent),
        currency: shop.pricingCurrency,
        name: media?.name ?? `Item #${tier.id}`,
        imageUri: media?.image,
        hook: shop.hook,
        chainId,
      });
      return;
    }
    cart.setQuantity(BigInt(tier.id), chainId, quantity);
  };

  if (shop.tiers.length === 0) return null;

  return (
    <div>
      <div className="text-sm text-zinc-500 mb-1.5">Shop</div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {shop.tiers.slice(0, 12).map((tier) => {
          const qty = quantityOf(tier.id);
          const soldOut = !tier.unlimited && tier.remaining === 0;
          const cap = tier.unlimited ? 99 : tier.remaining;
          const price = effectiveTierPrice(tier.price, tier.discountPercent);
          const media = mediaById?.[tier.id];
          const name = media?.name ?? `Item #${tier.id}`;
          return (
            <div
              key={tier.id}
              className={`relative w-24 shrink-0 overflow-hidden border bg-white text-center transition ${
                qty > 0 ? "border-teal-500" : "border-zinc-200 hover:border-teal-300"
              } ${soldOut ? "opacity-40" : ""}`}
            >
              {qty > 0 ? (
                <span className="absolute right-1.5 top-1.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-500 px-1 text-[10px] font-medium text-melon-950">
                  {qty}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (soldOut || qty > 0) return;
                  setTierQuantity(tier, 1);
                }}
                disabled={busy || soldOut}
                className="block w-full disabled:cursor-not-allowed"
                title={soldOut ? `${name} is sold out` : `Add ${name} to cart`}
              >
                <span className="block aspect-square w-full overflow-hidden">
                  <TierMediaPreview media={media} tierId={tier.id} alt={name} />
                </span>
              </button>
              {soldOut ? (
                <p className="px-2 pb-2 text-[10px] text-zinc-500">Sold out</p>
              ) : qty === 0 ? (
                <button
                  type="button"
                  onClick={() => setTierQuantity(tier, 1)}
                  disabled={busy}
                  className="w-full px-2 pb-2 text-[11px] text-zinc-600 hover:text-zinc-900"
                >
                  {formatPayAmount(price, shop.pricingDecimals)} {pricingSymbol}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1.5 px-2 pb-2">
                  <button
                    type="button"
                    onClick={() => setTierQuantity(tier, qty - 1)}
                    disabled={busy}
                    aria-label={`Remove one ${name}`}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 text-xs text-zinc-700 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="min-w-4 text-center text-xs tabular-nums">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setTierQuantity(tier, Math.min(cap, qty + 1))}
                    disabled={busy || qty >= cap}
                    aria-label={`Add one ${name}`}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 text-xs text-zinc-700 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
