import type { Ruleset } from "@/app/[slug]/terms/getRulesets";
import { calculatePriceAtTimestamp } from "@/lib/issuancePrice";
import { getTimeRangeConfig, TimeRange } from "@/lib/timeRange";
import type { PriceDataPoint } from "./getTokenPriceChartData";

export function calculateIssuancePriceHistory(
  rulesets: Ruleset[],
  range: TimeRange,
): PriceDataPoint[] {
  if (rulesets.length === 0) return [];

  const now = Math.floor(Date.now() / 1000);
  const projectStart = rulesets[0].start;
  const { seconds, interval } = getTimeRangeConfig(range);
  const startTime = seconds ? Math.max(now - seconds, projectStart) : projectStart;

  const dataPoints: PriceDataPoint[] = [];
  for (let t = startTime; t <= now; t += interval) {
    const price = calculatePriceAtTimestamp(t, rulesets);
    if (price !== undefined) {
      dataPoints.push({ timestamp: t, issuancePrice: price });
    }
  }

  const currentPrice = calculatePriceAtTimestamp(now, rulesets);
  if (currentPrice !== undefined && dataPoints[dataPoints.length - 1]?.timestamp !== now) {
    dataPoints.push({ timestamp: now, issuancePrice: currentPrice });
  }

  return dataPoints;
}
