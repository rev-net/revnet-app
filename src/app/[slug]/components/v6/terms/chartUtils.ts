/**
 * Shared projection math + formatting for the stepped issuance-schedule chart.
 * Mirrors website/'s issuanceAtTime + priceChartTimeBounds (projection branch):
 * within a stage the rate (weight / 1e18, tokens per base unit) cuts by
 * weightCutPercent (1e9 scale) once per elapsed `duration`; duration 0 never
 * cycles. Pure client math — no fetching.
 */

export type ChartStage = {
  start: number;
  duration: number;
  weight: bigint;
  /** weightCutPercent on the protocol's 1e9 scale. */
  weightCutPercent: number;
};

export type ResolvedStage = {
  start: number;
  duration: number;
  /** weightCutPercent on the protocol's 1e9 scale. */
  cut: number;
  /** Tokens issued per base unit at the stage's start. */
  rate0: number;
};

export const YEAR = 365 * 86400;

export const CHART_RANGES: { label: string; years: number }[] = [
  { label: "1Y", years: 1 },
  { label: "5Y", years: 5 },
  { label: "10Y", years: 10 },
  { label: "All", years: 0 },
];

/** Rate within a single stage at time t: rate0, cut once per elapsed cycle. */
function rateWithinStage(stage: ResolvedStage, t: number): number {
  if (stage.duration === 0 || stage.cut === 0) return stage.rate0;
  const k = Math.max(0, Math.floor((t - stage.start) / stage.duration));
  return stage.rate0 * Math.pow((1e9 - stage.cut) / 1e9, k);
}

/**
 * Sort stages and resolve each one's starting rate. A stage queued with
 * weight 0 inherits: its rate0 is the previous stage's rate at the boundary,
 * cuts included (JBRulesets' "weight 0 = inherit the base ruleset's weight"
 * convention). Weight 0 on the first stage is genuinely zero issuance.
 */
export function resolveStages(stages: ChartStage[]): ResolvedStage[] {
  const sorted = stages.slice().sort((a, b) => a.start - b.start);
  const out: ResolvedStage[] = [];
  sorted.forEach((s, i) => {
    const prev = out[i - 1];
    const rate0 =
      s.weight === 0n && prev ? rateWithinStage(prev, s.start) : Number(s.weight) / 1e18;
    out.push({
      start: s.start,
      duration: s.duration,
      cut: s.weightCutPercent,
      rate0,
    });
  });
  return out;
}

/** Issuance rate (tokens per base unit) at time t across the schedule. */
export function rateAtTime(resolved: ResolvedStage[], t: number): number {
  if (resolved.length === 0 || t < resolved[0].start) return 0;
  let active = resolved[0];
  for (const s of resolved) {
    if (s.start <= t) active = s;
    else break;
  }
  return active ? rateWithinStage(active, t) : 0;
}

/**
 * Forward-looking window: t0 = min(first stage start, now). 1Y/5Y/10Y look
 * `years` ahead of now; All runs to the last stage's start plus a year, kept
 * between 1 and 10 years ahead (the final stage runs forever).
 */
export function timeBounds(
  resolved: ResolvedStage[],
  now: number,
  years: number,
): { t0: number; t1: number } {
  const first = resolved[0]?.start ?? now;
  const last = resolved[resolved.length - 1]?.start ?? now;
  const t0 = Math.min(first, now);
  let t1 =
    years > 0
      ? now + years * YEAR
      : Math.min(Math.max(last + YEAR, now + YEAR), now + 10 * YEAR);
  if (t1 <= t0) t1 = t0 + YEAR;
  return { t0, t1 };
}

/**
 * [t, rate] step points across [t0, t1]: exact cycle-boundary steps when the
 * window holds a plottable number of cuts, else a uniform 480-point sample
 * (dense schedules read as a curve either way).
 */
export function buildStepPoints(
  resolved: ResolvedStage[],
  t0: number,
  t1: number,
): [number, number][] {
  if (resolved.length === 0) return [];
  const MAX_BREAKS = 720;
  const breaks: number[] = [];
  let dense = false;
  for (let i = 0; i < resolved.length; i++) {
    const s = resolved[i];
    const end = Math.min(resolved[i + 1]?.start ?? t1, t1);
    const from = Math.max(s.start, t0);
    if (end <= from) continue;
    if (s.start > t0 && s.start < t1) breaks.push(s.start);
    if (s.duration > 0 && s.cut > 0) {
      if ((end - from) / s.duration > MAX_BREAKS) {
        dense = true;
        break;
      }
      const k0 = Math.max(1, Math.ceil((from - s.start) / s.duration));
      for (let k = k0; s.start + k * s.duration < end; k++) {
        const t = s.start + k * s.duration;
        if (t > t0 && t < t1) breaks.push(t);
      }
    }
  }
  if (dense || breaks.length > MAX_BREAKS) {
    const N = 480;
    return Array.from({ length: N + 1 }, (_, i) => {
      const t = t0 + ((t1 - t0) * i) / N;
      return [t, rateAtTime(resolved, t)] as [number, number];
    });
  }
  const edges = [t0, ...breaks.sort((a, b) => a - b), t1];
  const pts: [number, number][] = [];
  for (let i = 0; i + 1 < edges.length; i++) {
    const v = rateAtTime(resolved, edges[i]);
    pts.push([edges[i], v], [edges[i + 1], v]);
  }
  return pts;
}

/** "6,250" / "1.25" / "0.00420" — issuance rates. */
export function formatRate(n: number): string {
  if (!isFinite(n)) return "—";
  if (n === 0) return "0";
  if (n >= 1000) return Math.round(n).toLocaleString("en-US");
  if (n >= 1) return n.toFixed(2).replace(/\.?0+$/, "");
  return n.toPrecision(3);
}

/** Prices (base units per token) trimmed for small numbers. */
export function formatPrice(n: number): string {
  if (!isFinite(n) || n <= 0) return "0";
  if (n >= 1000) return Math.round(n).toLocaleString("en-US");
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.001) return n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return n.toPrecision(2);
}

/** Span-aware date: "Jan 5, 2027" under two years of span, "Jan 2027" beyond. */
export function chartDateLabel(ts: number, span: number): string {
  const d = new Date(ts * 1000);
  if (span < 2 * YEAR) {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
