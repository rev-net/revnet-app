import { Ruleset } from "@/app/[slug]/terms/getRulesets";
import { calculatePriceAtTimestamp } from "@/lib/issuancePrice";
import { createVisualScale, type VisualScale } from "./visualScale";

export type ProjectionRange = "1y" | "5y" | "10y" | "20y" | "all";

const SECONDS_PER_DAY = 86400;

export type ChartDataPoint = {
  timestamp: number;
  price: number;
  visualX: number;
};

export type Stage = {
  name: string;
  start: number;
};

export type StageArea = Stage & {
  x1: number;
  x2: number;
  fill: string;
};

export type ChartData = {
  chartData: ChartDataPoint[];
  stages: Stage[];
  stageAreas: StageArea[];
  todayVisualX: number | null;
  toReal: VisualScale["toReal"];
};

function getRangeYears(range: ProjectionRange): number {
  return range === "1y" ? 1 : range === "5y" ? 5 : range === "10y" ? 10 : range === "20y" ? 20 : 50;
}

export function prepareChartData(rulesets: Ruleset[], range: ProjectionRange): ChartData {
  if (rulesets.length === 0) {
    return {
      chartData: [],
      stages: [],
      stageAreas: [],
      todayVisualX: null,
      toReal: (v) => v,
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const projectStart = rulesets[0].start;
  const endTime = now + getRangeYears(range) * 365 * SECONDS_PER_DAY;
  const interval = SECONDS_PER_DAY * 10;

  // Generate data points
  const dataPoints: { timestamp: number; price: number }[] = [];
  for (let t = projectStart; t <= endTime; t += interval) {
    const price = calculatePriceAtTimestamp(t, rulesets);
    if (price !== undefined) {
      dataPoints.push({ timestamp: t, price });
    }
  }

  // Build stages
  const stages: Stage[] = rulesets.map((r, i) => ({ name: `Stage ${i + 1}`, start: r.start }));

  // Create visual scale
  const endTimestamp = dataPoints[dataPoints.length - 1]?.timestamp;
  const { toVisual, toReal } =
    endTimestamp && stages.length > 0
      ? createVisualScale(stages, endTimestamp)
      : { toVisual: (ts: number) => ts, toReal: (v: number) => v };

  // Add visual X to data points
  const chartData = dataPoints.map((d) => ({ ...d, visualX: toVisual(d.timestamp) }));

  // Calculate stage areas
  const stageAreas: StageArea[] = stages
    .map((stage, i) => {
      const nextStart = stages[i + 1]?.start ?? endTimestamp;
      if (!endTimestamp || stage.start > endTimestamp) return null;
      return {
        ...stage,
        x1: toVisual(stage.start),
        x2: toVisual(Math.min(nextStart, endTimestamp)),
        fill: i % 2 === 0 ? "hsl(0 0% 96%)" : "hsl(0 0% 100%)",
      };
    })
    .filter((a): a is StageArea => a !== null);

  // Today's position
  const startTimestamp = dataPoints[0]?.timestamp;
  const todayVisualX =
    startTimestamp && endTimestamp && now >= startTimestamp && now <= endTimestamp
      ? toVisual(now)
      : null;

  return { chartData, stages, stageAreas, todayVisualX, toReal };
}
