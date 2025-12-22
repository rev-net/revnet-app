import { unstable_cache } from "next/cache";

export const fetchEthPrice = unstable_cache(
  async (): Promise<number> => {
    try {
      const response = await fetch("https://juicebox.money/api/juicebox/prices/ethusd");
      const data = await response.json();
      return parseFloat(data.price);
    } catch (err) {
      console.error("Failed to fetch ETH price:", err);
      return 3000; // Fallback price
    }
  },
  ["eth-price"],
  { revalidate: 1200 } // 20 minutes
);

