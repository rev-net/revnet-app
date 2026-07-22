"use client";

import { EthereumAddress } from "@/components/EthereumAddress";
import { SkeletonLines } from "@/components/ui/skeleton";
import EtherscanLink from "@/components/EtherscanLink";
import { DateRelative } from "@/components/DateRelative";
import { useOwnedShopItems, useShopPurchases } from "@bananapus/nana-sdk-react";
import { useMemo } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { ShopInventory, TierMedia, tierDisplayName } from "./shopLib";

/**
 * The Customers subtab (website/ renderShopCustomers parity): You (the
 * connected wallet's owned items), All (customers ranked by items bought),
 * and a recent-purchases feed. Backed by the SDK's indexed shop hooks, which
 * read mint events for the project in context — redemptions surface elsewhere
 * as cash-out events with an item count of 0, so rows without a real tier are
 * filtered out defensively.
 */
export function CustomersSection({
  shop,
  mediaById,
}: {
  shop: ShopInventory;
  mediaById: Record<number, TierMedia> | undefined;
}) {
  const { address } = useAccount();

  const names = useMemo(
    () =>
      Object.fromEntries(
        shop.tiers.map((tier) => [tier.id, tierDisplayName(mediaById?.[tier.id], tier.id)]),
      ) as Record<number, string>,
    [shop.tiers, mediaById],
  );

  const owned = useOwnedShopItems({ owner: address, enabled: !!address });
  const purchases = useShopPurchases({ limit: 100 });

  // Mint rows only — anything without a real tier/token is a non-purchase
  // artifact (e.g. an indexed redemption) and never counts as a sale.
  const purchaseRows = useMemo(
    () => (purchases.data ?? []).filter((purchase) => purchase.tierId > 0 && !!purchase.tokenId),
    [purchases.data],
  );

  const customers = useMemo(() => {
    const byCustomer = new Map<string, typeof purchaseRows>();
    for (const purchase of purchaseRows) {
      const key = purchase.beneficiary.toLowerCase();
      const rows = byCustomer.get(key);
      if (rows) rows.push(purchase);
      else byCustomer.set(key, [purchase]);
    }
    return [...byCustomer.values()].sort((a, b) => b.length - a.length);
  }, [purchaseRows]);

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-zinc-200 bg-white p-4">
        <h2 className="font-medium text-zinc-900">You</h2>
        {!address ? (
          <p className="mt-2 text-sm text-zinc-500">
            Connect your wallet to see the items you own.
          </p>
        ) : owned.isLoading ? (
          <SkeletonLines lines={2} className="mt-3" />
        ) : owned.isError ? (
          <p className="mt-2 text-sm text-zinc-600">
            Couldn&apos;t load your items right now.
          </p>
        ) : (owned.data?.length ?? 0) > 0 ? (
          <>
            <p className="mt-2 text-sm font-medium text-zinc-900">
              {owned.totalCount || owned.data!.length}{" "}
              {(owned.totalCount || owned.data!.length) === 1 ? "item" : "items"} owned
            </p>
            <div className="mt-2 divide-y divide-zinc-100">
              {tallyItems(owned.data!, names).map((item) => (
                <div
                  key={item.tierId}
                  className="flex items-baseline justify-between gap-3 py-1.5 text-sm"
                >
                  <span className="font-medium text-zinc-900">{item.label}</span>
                  <span className="text-zinc-500">×{item.count}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">
            You don&apos;t own any items from this shop yet.
          </p>
        )}
      </div>

      <div className="border border-zinc-200 bg-white p-4">
        <h2 className="font-medium text-zinc-900">All</h2>
        {purchases.isLoading ? (
          <SkeletonLines lines={4} className="mt-3" />
        ) : purchases.isError ? (
          <p className="mt-2 text-sm text-zinc-600">Couldn&apos;t load customers right now.</p>
        ) : customers.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No items have been bought yet.</p>
        ) : (
          <>
            <p className="mt-2 text-sm font-medium text-zinc-900">
              {customers.length.toLocaleString("en-US")}{" "}
              {customers.length === 1 ? "customer" : "customers"} ·{" "}
              {(purchases.totalCount || purchaseRows.length).toLocaleString("en-US")}{" "}
              {(purchases.totalCount || purchaseRows.length) === 1 ? "item" : "items"} sold
            </p>
            <div className="mt-2 divide-y divide-zinc-100">
              {customers.slice(0, 50).map((rows) => (
                <div
                  key={rows[0].beneficiary.toLowerCase()}
                  className="flex flex-col gap-1 py-1.5 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <EthereumAddress
                    address={rows[0].beneficiary as Address}
                    short
                    withEnsName
                    className="shrink-0 font-medium"
                  />
                  <span className="text-xs text-zinc-500 sm:text-right">
                    {tallyItems(rows, names)
                      .map((item) => (item.count > 1 ? `${item.count}× ${item.label}` : item.label))
                      .join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="border border-zinc-200 bg-white p-4">
        <h2 className="font-medium text-zinc-900">Recent purchases</h2>
        {purchases.isLoading ? (
          <SkeletonLines lines={4} className="mt-3" />
        ) : purchaseRows.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No purchases yet.</p>
        ) : (
          <div className="mt-2 divide-y divide-zinc-100">
            {purchaseRows.slice(0, 25).map((purchase) => (
              <div
                key={`${purchase.chainId}:${purchase.txHash}:${purchase.tokenId}`}
                className="flex items-baseline justify-between gap-3 py-1.5 text-xs"
              >
                <EtherscanLink
                  value={purchase.txHash}
                  type="tx"
                  className="shrink-0 text-teal-600"
                >
                  <DateRelative timestamp={purchase.timestamp} />
                </EtherscanLink>
                <span className="min-w-0 truncate text-right text-zinc-600">
                  {names[purchase.tierId] ?? `Item #${purchase.tierId}`} →{" "}
                  <EthereumAddress
                    address={purchase.beneficiary as Address}
                    short
                    className="text-zinc-600"
                  />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function tallyItems<T extends { tierId: number }>(
  rows: T[],
  names: Record<number, string>,
): { tierId: number; count: number; label: string }[] {
  const counts = new Map<number, number>();
  for (const row of rows) counts.set(row.tierId, (counts.get(row.tierId) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tierId, count]) => ({
      tierId,
      count,
      label: names[tierId] ?? `Item #${tierId}`,
    }))
    .sort((a, b) => b.count - a.count || a.tierId - b.tierId);
}
