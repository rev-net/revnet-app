"use client";

import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { RangeOption, RangeSelector } from "@/components/ui/range-selector";
import { TimeRange } from "@/lib/timeRange";
import { cn, formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { PriceDataPoint } from "./getTokenPriceChartData";
import { PriceChartTooltip } from "./PriceChartTooltip";

const TIME_RANGES: RangeOption<TimeRange>[] = [
  { value: "1d", label: "1D" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "3m", label: "3M" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
];

const chartConfig = {
  issuancePrice: { label: "Issuance Price", color: "var(--chart-1)" },
  ammPrice: { label: "Pool Price", color: "var(--chart-2)" },
  floorPrice: { label: "Floor Price", color: "var(--chart-3)" },
} satisfies ChartConfig;

interface Props {
  data: PriceDataPoint[];
  range: TimeRange;
  hasPool: boolean;
  baseTokenSymbol: string;
  baseTokenDecimals: number;
  isLoading: boolean;
}

export function TokenPriceChart({
  data,
  range,
  hasPool,
  baseTokenSymbol,
  baseTokenDecimals,
  isLoading,
}: Props) {
  const [showIssuance, setShowIssuance] = useState(true);
  const [showAmm, setShowAmm] = useState(true);
  const [showFloor, setShowFloor] = useState(false);

  const filteredData = data.map((point) => ({
    timestamp: point.timestamp,
    issuancePrice: showIssuance ? point.issuancePrice : undefined,
    ammPrice: showAmm ? point.ammPrice : undefined,
    floorPrice: showFloor ? point.floorPrice : undefined,
    totalSupply: showFloor ? point.totalSupply : undefined,
    totalBalance: showFloor ? point.totalBalance : undefined,
    cashOutTaxRate: showFloor ? point.cashOutTaxRate : undefined,
  }));

  const hasData = data.length > 0;
  const hasAmmData = data.some((d) => d.ammPrice !== undefined);
  const hasFloorData = data.some((d) => d.floorPrice !== undefined);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2.5 items-start md:flex-row md:justify-between md:items-center">
        <div className="flex gap-1.5 md:gap-4 flex-wrap">
          <button
            onClick={() => setShowIssuance(!showIssuance)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              showIssuance
                ? "bg-[--chart-1]/10 text-[--chart-1] ring-1 ring-[--chart-1]/30"
                : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200",
            )}
          >
            <span
              className={cn("w-2.5 h-2.5 rounded-full", {
                "bg-[--chart-1]": showIssuance,
                "bg-zinc-300": !showIssuance,
              })}
            />
            Issuance Price
          </button>

          {hasPool && (
            <button
              onClick={() => setShowAmm(!showAmm)}
              disabled={!hasAmmData}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                !hasAmmData && "opacity-50 cursor-not-allowed",
                showAmm && hasAmmData
                  ? "bg-[--chart-2]/10 text-[--chart-2] ring-1 ring-[--chart-2]/30"
                  : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200",
              )}
            >
              <span
                className={cn("w-2.5 h-2.5 rounded-full", {
                  "bg-[--chart-2]": showAmm && hasAmmData,
                  "bg-zinc-300": !(showAmm && hasAmmData),
                })}
              />
              Pool Price
            </button>
          )}

          <button
            onClick={() => setShowFloor(!showFloor)}
            disabled={!hasFloorData}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              !hasFloorData && "opacity-50 cursor-not-allowed",
              showFloor && hasFloorData
                ? "bg-[--chart-3]/10 text-[--chart-3] ring-1 ring-[--chart-3]/30"
                : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200",
            )}
          >
            <span
              className={cn("w-2.5 h-2.5 rounded-full", {
                "bg-[--chart-3]": showFloor && hasFloorData,
                "bg-zinc-300": !(showFloor && hasFloorData),
              })}
            />
            Floor Price
          </button>
        </div>
        <RangeSelector ranges={TIME_RANGES} defaultValue="1y" />
      </div>

      {hasData ? (
        <ChartContainer
          config={chartConfig}
          className="mt-6 aspect-[4/3] sm:aspect-[2/1] lg:aspect-[5/2] w-full"
        >
          <LineChart
            data={filteredData}
            accessibilityLayer
            margin={{ left: -12, right: 12, top: 12, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(timestamp) => formatXAxis(timestamp, range)}
              minTickGap={32}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatPrice}
              width={60}
              domain={[0, "auto"]}
            />
            <ChartTooltip
              content={({ active, payload }) => (
                <PriceChartTooltip
                  active={active}
                  payload={payload}
                  baseTokenSymbol={baseTokenSymbol}
                  baseTokenDecimals={baseTokenDecimals}
                  range={range}
                />
              )}
            />
            {showIssuance && (
              <Line
                type="monotone"
                dataKey="issuancePrice"
                stroke="var(--color-issuancePrice)"
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
            {showAmm && hasAmmData && (
              <Line
                type="monotone"
                dataKey="ammPrice"
                stroke="var(--color-ammPrice)"
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
            {showFloor && hasFloorData && (
              <Line
                type="monotone"
                dataKey="floorPrice"
                stroke="var(--color-floorPrice)"
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ChartContainer>
      ) : (
        <div className="aspect-[4/3] sm:aspect-[2/1] lg:aspect-[5/2] w-full flex items-center justify-center text-zinc-500">
          {isLoading ? "Loading..." : "No price data available"}
        </div>
      )}
    </div>
  );
}

const formatXAxis = (timestamp: number, range: TimeRange) => {
  const date = new Date(timestamp * 1000);
  if (range === "1d" || range === "7d") {
    return format(date, "HH:mm");
  }
  if (range === "30d" || range === "3m") {
    return format(date, "MMM d");
  }
  return format(date, "MMM yyyy");
};
