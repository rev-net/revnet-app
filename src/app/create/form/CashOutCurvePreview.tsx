"use client";

import { PointerEvent, useMemo, useState } from "react";

const WIDTH = 520;
const HEIGHT = 270;
const LEFT = 58;
const RIGHT = 18;
const TOP = 28;
const BOTTOM = 58;
const PLOT_WIDTH = WIDTH - LEFT - RIGHT;
const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function cashOutShare(cashedOutShare: number, taxRate: number) {
  return cashedOutShare * (1 - taxRate + taxRate * cashedOutShare);
}

export function CashOutCurvePreview({
  taxRate,
  tokenSymbol,
  reserveAsset,
}: {
  taxRate: number;
  tokenSymbol: string;
  reserveAsset: string;
}) {
  const normalizedTaxRate = clamp(Number(taxRate) || 0, 0, 100) / 100;
  const [samplePercent, setSamplePercent] = useState(10);
  const sampleShare = samplePercent / 100;
  const sampleReturn = cashOutShare(sampleShare, normalizedTaxRate) * 100;

  const x = (share: number) => LEFT + share * PLOT_WIDTH;
  const y = (share: number) => TOP + (1 - share) * PLOT_HEIGHT;

  const curvePath = useMemo(() => {
    return Array.from({ length: 61 }, (_, index) => {
      const share = index / 60;
      const value = cashOutShare(share, normalizedTaxRate);
      return `${index === 0 ? "M" : "L"}${x(share).toFixed(2)},${y(value).toFixed(2)}`;
    }).join(" ");
  }, [normalizedTaxRate]);

  const updateFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const viewBoxX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const next = ((viewBoxX - LEFT) / PLOT_WIDTH) * 100;
    setSamplePercent(Math.round(clamp(next, 0, 100)));
  };

  return (
    <figure className="mt-5 border border-melon-200 bg-melon-25 p-4">
      <div className="mb-2 flex items-baseline justify-between gap-4 text-xs text-zinc-500">
        <span>Cash-out curve</span>
        <span className="text-right text-melon-700">
          {samplePercent}% cashed out → {sampleReturn.toFixed(1)}% returned
        </span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block w-full touch-none select-none"
        role="slider"
        tabIndex={0}
        aria-label="Tokens cashed out"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={samplePercent}
        aria-valuetext={`${samplePercent}% cashed out returns ${sampleReturn.toFixed(1)}%`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event);
        }}
        onPointerMove={(event) => updateFromPointer(event)}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            setSamplePercent((current) => clamp(current - (event.shiftKey ? 5 : 1), 0, 100));
          }
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            setSamplePercent((current) => clamp(current + (event.shiftKey ? 5 : 1), 0, 100));
          }
        }}
      >
        <line
          x1={LEFT}
          y1={TOP}
          x2={LEFT}
          y2={HEIGHT - BOTTOM}
          stroke="#4FA270"
          strokeWidth="1.5"
        />
        <line
          x1={LEFT}
          y1={HEIGHT - BOTTOM}
          x2={WIDTH - RIGHT}
          y2={HEIGHT - BOTTOM}
          stroke="#4FA270"
          strokeWidth="1.5"
        />
        <line
          x1={x(0)}
          y1={y(0)}
          x2={x(1)}
          y2={y(1)}
          stroke="#A5E0BD"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <path d={curvePath} fill="none" stroke="#4FA270" strokeWidth="3" />
        <line
          x1={x(sampleShare)}
          y1={y(0)}
          x2={x(sampleShare)}
          y2={y(sampleReturn / 100)}
          stroke="#E2936B"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <rect
          x={x(sampleShare) - 5}
          y={y(sampleReturn / 100) - 5}
          width="10"
          height="10"
          fill="#EE6F3A"
          stroke="#69280C"
          strokeWidth="1.5"
          className="pointer-events-none"
        />
        <text
          x={(LEFT + WIDTH - RIGHT) / 2}
          y={HEIGHT - 15}
          textAnchor="middle"
          className="fill-melon-800 text-[13px]"
        >
          {tokenSymbol} cashed out
        </text>
        <text
          x="17"
          y={(TOP + HEIGHT - BOTTOM) / 2}
          textAnchor="middle"
          transform={`rotate(-90 17 ${(TOP + HEIGHT - BOTTOM) / 2})`}
          className="fill-melon-800 text-[13px]"
        >
          {reserveAsset} received
        </text>
      </svg>
      <figcaption className="mt-1 text-sm text-zinc-600">
        Cashing out {samplePercent}% of {tokenSymbol} gets {sampleReturn.toFixed(1)}% of the
        revnet&apos;s {reserveAsset}.
      </figcaption>
    </figure>
  );
}
