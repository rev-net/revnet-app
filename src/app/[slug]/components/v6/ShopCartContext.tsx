"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";

/**
 * The 721 shop cart shared between the v6 pay card's shop strip and the Shop tab
 * (mirrors website/'s single nftCart driving both surfaces).
 */
export interface ShopCartItem {
  tierId: bigint;
  quantity: number;
  /** The tier's price, in the shop's pricing-context currency units. */
  price: bigint;
  currency: number;
  name?: string;
  imageUri?: string;
  /** The 721 hook the tier belongs to. */
  hook: `0x${string}`;
  chainId: number;
}

interface ShopCart {
  items: ShopCartItem[];
  add: (item: ShopCartItem) => void;
  remove: (tierId: bigint, chainId: number) => void;
  setQuantity: (tierId: bigint, chainId: number, quantity: number) => void;
  clear: () => void;
}

const ShopCartCtx = createContext<ShopCart | null>(null);

export function ShopCartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<ShopCartItem[]>([]);

  const add = useCallback((item: ShopCartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.tierId === item.tierId && i.chainId === item.chainId);
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((tierId: bigint, chainId: number) => {
    setItems((prev) => prev.filter((i) => !(i.tierId === tierId && i.chainId === chainId)));
  }, []);

  const setQuantity = useCallback((tierId: bigint, chainId: number, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => !(i.tierId === tierId && i.chainId === chainId))
        : prev.map((i) => (i.tierId === tierId && i.chainId === chainId ? { ...i, quantity } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, add, remove, setQuantity, clear }),
    [items, add, remove, setQuantity, clear],
  );

  return <ShopCartCtx.Provider value={value}>{children}</ShopCartCtx.Provider>;
}

export function useShopCart(): ShopCart {
  const ctx = useContext(ShopCartCtx);
  if (!ctx) throw new Error("useShopCart must be used inside ShopCartProvider");
  return ctx;
}
