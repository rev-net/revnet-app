import { getStartTimeForRange, getTimeRangeConfig, type TimeRange } from "@/lib/timeRange";
import { JBChainId } from "juice-sdk-core";
import { unstable_cache } from "next/cache";
import { Address } from "viem";
import { arbitrum, base, mainnet, optimism } from "viem/chains";
import type { PriceDataPoint } from "./getTokenPriceChartData";

const UNISWAP_SUBGRAPH_IDS: Partial<Record<JBChainId, string>> = {
  [mainnet.id]: "6XvRX3WHSvzBVTiPdF66XSBVbxWuHqijWANbjJxRDyzr",
  [base.id]: "HMuAwufqZ1YCRmzL2SfHTVkzZovC9VL2UAKhjvRqKiR1",
  [optimism.id]: "38P996LTWvW4SKb8BP6bbJZ8pqsa6efRzreNMzaYkUCH",
  [arbitrum.id]: "3SvHymr16c2tfWziXuGYfa4kaRGDV7XbBb85hMeBHE9p",
};

const SECONDS_PER_HOUR = 3600;

function getSubgraphUrl(chainId: JBChainId): string | null {
  const subgraphId = UNISWAP_SUBGRAPH_IDS[chainId];
  if (!subgraphId) return null;

  const apiKey = process.env.SUBGRAPH_API_KEY;
  if (!apiKey) {
    console.warn("[AMM] Missing SUBGRAPH_API_KEY - AMM prices will not be available");
    return null;
  }

  return `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${subgraphId}`;
}

type PoolDataResponse = {
  token0: { id: string };
  token1: { id: string };
  poolHourData?: Array<{ periodStartUnix: number; token0Price: string; token1Price: string }>;
  poolDayData?: Array<{ date: number; token0Price: string; token1Price: string }>;
};

const fetchPoolData = unstable_cache(
  async (
    subgraphUrl: string,
    poolAddress: string,
    since: number,
    useHourly: boolean,
  ): Promise<PoolDataResponse | null> => {
    const dataField = useHourly
      ? `poolHourData(first: 168, orderBy: periodStartUnix, orderDirection: desc, where: { periodStartUnix_gte: ${since} }) {
          periodStartUnix
          token0Price
          token1Price
        }`
      : `poolDayData(first: 1000, orderBy: date, orderDirection: asc, where: { date_gte: ${since} }) {
          date
          token0Price
          token1Price
        }`;

    const query = `{
      pool(id: "${poolAddress.toLowerCase()}") {
        token0 { id }
        token1 { id }
        ${dataField}
      }
    }`;

    try {
      const response = await fetch(subgraphUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error("[AMM] Subgraph request failed:", response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      if (data.errors) {
        console.error("[AMM] Subgraph errors:", data.errors);
        return null;
      }
      return data?.data?.pool ?? null;
    } catch (err) {
      console.error("[AMM] Error fetching pool data:", err);
      return null;
    }
  },
  ["pool-data-v4"],
  { revalidate: 300 },
);

export async function getAmmPriceHistory(
  poolAddress: Address | null,
  projectTokenAddress: Address,
  chainId: JBChainId,
  range: TimeRange,
  projectStart: number,
): Promise<PriceDataPoint[]> {
  if (!poolAddress) return [];

  const subgraphUrl = getSubgraphUrl(chainId);
  if (!subgraphUrl) return [];

  const { interval } = getTimeRangeConfig(range);
  const useHourly = interval === SECONDS_PER_HOUR;
  const since = Math.max(getStartTimeForRange(range), projectStart);

  const pool = await fetchPoolData(subgraphUrl, poolAddress, since, useHourly);
  if (!pool) return [];

  const projectIsToken0 = pool.token0.id.toLowerCase() === projectTokenAddress.toLowerCase();
  const rawData = useHourly ? pool.poolHourData : pool.poolDayData;
  if (!rawData) return [];

  return rawData
    .map((item) => {
      const timestamp = "periodStartUnix" in item ? item.periodStartUnix : item.date;
      const priceStr = projectIsToken0 ? item.token1Price : item.token0Price;
      const ammPrice = parseFloat(priceStr);

      return {
        timestamp,
        ammPrice: isNaN(ammPrice) || ammPrice === 0 ? undefined : ammPrice,
      };
    })
    .filter((p) => p.ammPrice !== undefined)
    .sort((a, b) => a.timestamp - b.timestamp);
}
