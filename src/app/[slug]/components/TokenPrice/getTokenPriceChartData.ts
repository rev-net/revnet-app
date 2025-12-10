import { getRulesets } from "@/app/[slug]/terms/getRulesets";
import { getCurrentCashOutTax } from "@/lib/cashOutTax";
import { getStartTimeForRange, TimeRange } from "@/lib/timeRange";
import { getTokenAddress } from "@/lib/token";
import { getUniswapPool } from "@/lib/uniswap/pool";
import { JB_TOKEN_DECIMALS, JBChainId, JBVersion, NATIVE_TOKEN } from "juice-sdk-core";
import { Address } from "viem";
import { calculateIssuancePriceHistory } from "./calculateIssuancePriceHistory";
import { getAmmPriceHistory } from "./getAmmPriceHistory";
import { getFloorPriceHistory } from "./getFloorPriceHistory";

export type PriceDataPoint = {
  timestamp: number;
  issuancePrice?: number;
  ammPrice?: number;
  floorPrice?: number;
};

export async function getTokenPriceChartData(params: {
  projectId: bigint;
  chainId: JBChainId;
  version: JBVersion;
  range: TimeRange;
  suckerGroupId: string;
  baseToken: { address: Address; symbol: string; decimals: number };
}) {
  const { projectId, chainId, version, baseToken, suckerGroupId, range } = params;
  const startTime = getStartTimeForRange(range);

  const rulesets = await getRulesets(projectId.toString(), chainId, version);
  const projectStart = rulesets.length > 0 ? rulesets[0].start : 0;
  const issuanceData = calculateIssuancePriceHistory(rulesets, range);

  const projectTokenAddress = await getTokenAddress(chainId, Number(projectId), version);
  if (!projectTokenAddress || projectTokenAddress === NATIVE_TOKEN) {
    throw new Error("Could not get project token address");
  }

  const pool = await getUniswapPool(
    { address: baseToken.address, decimals: baseToken.decimals },
    { address: projectTokenAddress, decimals: JB_TOKEN_DECIMALS },
    chainId,
  );

  const ammData = pool
    ? await getAmmPriceHistory(pool.address, projectTokenAddress, chainId, range, projectStart)
    : [];

  const currentCashOutTax = await getCurrentCashOutTax(projectId.toString(), chainId, version);

  const floorData = await getFloorPriceHistory({
    suckerGroupId,
    chainId,
    baseTokenDecimals: baseToken.decimals,
    currentCashOutTax,
    projectStart,
  });

  const data = mergeDataPoints(issuanceData, ammData, floorData);

  return {
    chartData: range === "all" ? data : data.filter((d) => d.timestamp >= startTime),
    hasPool: pool !== null,
  };
}

function mergeDataPoints(
  issuanceData: PriceDataPoint[],
  ammData: PriceDataPoint[],
  floorData: PriceDataPoint[],
): PriceDataPoint[] {
  const merged = new Map<number, PriceDataPoint>();

  for (const point of issuanceData) {
    const dayTs = normalizeToDay(point.timestamp);
    const existing = merged.get(dayTs);
    if (existing) {
      existing.issuancePrice = point.issuancePrice;
    } else {
      merged.set(dayTs, { timestamp: dayTs, issuancePrice: point.issuancePrice });
    }
  }

  for (const point of ammData) {
    const dayTs = normalizeToDay(point.timestamp);
    const existing = merged.get(dayTs);
    if (existing) {
      existing.ammPrice = point.ammPrice;
    } else {
      merged.set(dayTs, { timestamp: dayTs, ammPrice: point.ammPrice });
    }
  }

  for (const point of floorData) {
    const dayTs = normalizeToDay(point.timestamp);
    const existing = merged.get(dayTs);
    if (existing) {
      existing.floorPrice = point.floorPrice;
    } else {
      merged.set(dayTs, { timestamp: dayTs, floorPrice: point.floorPrice });
    }
  }

  const sorted = Array.from(merged.values()).sort((a, b) => a.timestamp - b.timestamp);

  let lastAmmPrice: number | undefined;
  let lastFloorPrice: number | undefined;

  for (const point of sorted) {
    if (point.ammPrice !== undefined) {
      lastAmmPrice = point.ammPrice;
    } else if (lastAmmPrice !== undefined) {
      point.ammPrice = lastAmmPrice;
    }

    if (point.floorPrice !== undefined) {
      lastFloorPrice = point.floorPrice;
    } else if (lastFloorPrice !== undefined) {
      point.floorPrice = lastFloorPrice;
    }
  }

  return sorted;
}

function normalizeToDay(timestamp: number): number {
  return Math.floor(timestamp / 86400) * 86400;
}
