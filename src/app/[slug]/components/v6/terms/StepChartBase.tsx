"use client";

import { cn } from "@/lib/utils";
import { useMemo, useState, type ReactNode } from "react";
import {
  buildStepPoints,
  chartDateLabel,
  formatPrice,
  rateAtTime,
  type ResolvedStage,
} from "./chartUtils";

/**
 * SVG scaffold for the stepped issuance-price schedule chart (website/ parity:
 * issuanceChartSvg + mountChart): light horizontal gridlines, stage-boundary
 * dividers, the "Now" marker, the price ladder polyline, hover crosshair, and
 * scale/date labels. Pure SVG — no chart library. Styled to match
 * TokenPriceChart's quiet chrome: no card box, thin non-scaling strokes,
 * dashed gridlines, muted HTML labels.
 */

export const ISSUANCE_COLOR = "#4FA270"; // melon-600
export const NOW_COLOR = "#EE6F3A"; // peel-400

// Plot area gutters inside a 320×140 viewBox. Text lives in HTML overlays so
// the gutters only pad the plot itself.
const VW = 320;
const VH = 140;
const PL = 0;
const PR = 0;
const PT = 4;
const PB = 4;

export type ChartGeom = {
  /** Time → x in viewBox units. */
  X: (t: number) => number;
  /** Price → y in viewBox units, clamped to the plot area. */
  Y: (v: number) => number;
  /** X at min(now, t1). */
  nowX: number;
  /** The vertical scale's top value (max issuance price in the window). */
  maxV: number;
};

/** One range-selector pill, styled like the ui RangeSelector's options. */
export function ChartRangeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-2.5 py-1 text-sm font-medium rounded-md transition-all focus-visible:outline-none",
        active ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700",
      )}
    >
      {label}
    </button>
  );
}

export function StepChartBase({
  resolved,
  t0,
  t1,
  now,
  symbol,
  baseSymbol,
  ariaLabel,
  showNowMarker = true,
  header,
  renderSeries,
  renderOverlay,
}: {
  resolved: ResolvedStage[];
  t0: number;
  t1: number;
  now: number;
  symbol: string;
  baseSymbol: string;
  ariaLabel: string;
  /** Whether to draw the Now marker (e.g. only inside a projected window). */
  showNowMarker?: boolean;
  /** Rendered above the plot (summary tiles, range pills). */
  header?: ReactNode;
  /** Extra series drawn after the stage boundaries, behind the Now marker. */
  renderSeries?: (geom: ChartGeom) => ReactNode;
  /** Extra marks drawn after the hover crosshair. */
  renderOverlay?: (geom: ChartGeom) => ReactNode;
}) {
  const [hoverT, setHoverT] = useState<number | null>(null);

  // Price points: invert the rate steps; rate 0 → null (no mint price).
  const points = useMemo(
    () =>
      buildStepPoints(resolved, t0, t1).map(
        ([t, rate]) => [t, rate > 0 ? 1 / rate : null] as [number, number | null],
      ),
    [resolved, t0, t1],
  );
  const maxV = points.reduce((m, [, v]) => (v !== null && v > m ? v : m), 0);

  if (resolved.length === 0 || maxV <= 0) {
    return <p className="mt-3 text-xs text-zinc-500">No issuance to chart.</p>;
  }

  const X = (t: number) => PL + ((VW - PL - PR) * (t - t0)) / (t1 - t0);
  const Y = (v: number) => PT + (VH - PT - PB) * (1 - Math.max(0, Math.min(1, v / maxV)));
  /** viewBox x → CSS percentage, for constant-size HTML overlays. */
  const pct = (x: number) => `${((x / VW) * 100).toFixed(2)}%`;

  const path = points
    // No issuance has an infinite price; pin it to the top of the finite
    // issuance-price range, matching website/'s chart.
    .map(([t, v]) => `${X(t).toFixed(1)},${Y(v ?? maxV).toFixed(1)}`)
    .join(" ");

  const t = Math.min(t1, Math.max(t0, hoverT ?? Math.min(now, t1)));
  const rate = rateAtTime(resolved, t);
  const price = rate > 0 ? 1 / rate : null;
  const span = t1 - t0;
  const nowX = X(Math.min(now, t1));
  const geom: ChartGeom = { X, Y, nowX, maxV };
  const axisTimes = [0, 1, 2, 3, 4].map((i) => t0 + ((t1 - t0) * i) / 4);

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewX = ((e.clientX - rect.left) / rect.width) * VW;
    const frac = Math.min(1, Math.max(0, (viewX - PL) / (VW - PL - PR)));
    setHoverT(t0 + frac * (t1 - t0));
  };

  return (
    <div className="mt-3 w-full">
      {header}
      <div className="relative mt-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 text-sm text-[#666666]">
          {[0, 1, 2, 3, 4].map((i) => {
            const y = PT + ((VH - PT - PB) * i) / 4;
            const value = maxV * (1 - i / 4);
            return (
              <span
                key={i}
                className={cn(
                  "absolute right-2 whitespace-nowrap leading-none",
                  i === 0 ? "translate-y-0" : i === 4 ? "-translate-y-full" : "-translate-y-1/2",
                )}
                style={{ top: `${(y / VH) * 100}%` }}
              >
                {formatPrice(value)}{i === 0 ? ` ${baseSymbol}` : ""}
              </span>
            );
          })}
        </div>
        <div className="relative ml-20">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="h-auto w-full cursor-crosshair touch-none"
            role="img"
            aria-label={ariaLabel}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHoverT(null)}
          >
          {/* Horizontal gridlines only, like TokenPriceChart's CartesianGrid. */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = PT + ((VH - PT - PB) * i) / 4;
            return (
              <line
                key={i}
                x1={PL}
                y1={y}
                x2={VW - PR}
                y2={y}
                stroke="#CCCCCC"
                strokeWidth="1"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {/* Stage boundaries */}
          {resolved.map((s, i) =>
            i > 0 && s.start > t0 && s.start < t1 ? (
              <line
                key={s.start}
                x1={X(s.start)}
                y1={PT}
                x2={X(s.start)}
                y2={VH - PB}
                stroke="#A5E0BD"
                strokeWidth="2"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            ) : null,
          )}
          {renderSeries?.(geom)}
          {/* Now marker */}
          {showNowMarker ? (
            <line
              x1={nowX}
              y1={PT}
              x2={nowX}
              y2={VH - PB}
              stroke={NOW_COLOR}
              strokeWidth="2"
              strokeDasharray="4 3"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {/* The price ladder */}
          <polyline
            points={path}
            fill="none"
            stroke={ISSUANCE_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Crosshair guides + inspected point while hovering */}
          {hoverT !== null && price !== null ? (
            <>
              <line
                x1={X(t)}
                y1={VH - PB}
                x2={X(t)}
                y2={Y(price)}
                stroke={ISSUANCE_COLOR}
                strokeWidth="1"
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={PL}
                y1={Y(price)}
                x2={X(t)}
                y2={Y(price)}
                stroke={ISSUANCE_COLOR}
                strokeWidth="1"
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              />
              <circle cx={X(t)} cy={Y(price)} r="2.5" fill={ISSUANCE_COLOR} />
            </>
          ) : null}
          {renderOverlay?.(geom)}
          </svg>
          {/* Constant-size labels overlay the plot as HTML so they don't scale
              with the svg. */}
          {resolved.map((s, i) =>
            i > 0 && s.start > t0 && s.start < t1 ? (
              <span
                key={s.start}
                className="pointer-events-none absolute top-0 -translate-x-full text-base font-medium leading-none text-[#3D7955]"
                style={{ left: `calc(${pct(X(s.start))} - 8px)` }}
              >
                Stage {i + 1}
              </span>
            ) : null,
          )}
          {showNowMarker ? (
            <span
              className="pointer-events-none absolute top-0 -translate-x-full text-base font-semibold leading-none text-[#EE6F3A]"
              style={{ left: `calc(${pct(nowX)} - 8px)` }}
            >
              Now
            </span>
          ) : null}
        </div>
      </div>
      <div className="relative ml-20 mt-1 h-5 text-sm text-[#666666]">
        {axisTimes.map((timestamp, i) => (
          <span
            key={timestamp}
            className={cn(
              "absolute top-0 whitespace-nowrap",
              i === 0 ? "" : i === axisTimes.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
            )}
            style={{ left: `${(i / (axisTimes.length - 1)) * 100}%` }}
          >
            {new Date(timestamp * 1000).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-sm text-zinc-500" aria-live="polite">
        <span className="text-zinc-600">{chartDateLabel(t, span)}</span>
        {" — "}
        {price !== null ? (
          <>
            <span className="font-medium text-zinc-600 tabular-nums">
              {formatPrice(price)} {baseSymbol}
            </span>{" "}
            per {symbol}
          </>
        ) : (
          "no issuance"
        )}
      </p>
    </div>
  );
}
