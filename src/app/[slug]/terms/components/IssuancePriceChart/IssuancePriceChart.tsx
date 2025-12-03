"use client";

import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { format } from "date-fns";
import { useJBTokenContext } from "juice-sdk-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import type { Ruleset } from "../../getRulesets";
import type { ProjectionRange } from "../RangeSelector";
import { prepareChartData } from "./prepareChartData";

const chartConfig = {
  price: {
    label: "Issuance Price",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const VALID_RANGES: ProjectionRange[] = ["1y", "5y", "10y", "20y", "all"];

interface Props {
  rulesets: Ruleset[];
}

export function IssuancePriceChart({ rulesets }: Props) {
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get("range");
  const range: ProjectionRange = VALID_RANGES.includes(rangeParam as ProjectionRange)
    ? (rangeParam as ProjectionRange)
    : "5y";

  const { token } = useJBTokenContext();
  const baseToken = useProjectBaseToken();

  const { chartData, stages, stageAreas, todayVisualX, toReal } = useMemo(
    () => prepareChartData(rulesets, range),
    [rulesets, range],
  );

  if (!chartData.length) return null;

  const tokenSymbol = token.data?.symbol ?? "$TOKEN";

  return (
    <ChartContainer
      key={range}
      config={chartConfig}
      className="aspect-[2/1] sm:aspect-[3/1] w-full"
    >
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 0, right: 12, top: 24, bottom: 0 }}
      >
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-price)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-price)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="visualX"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          tickFormatter={(v) => format(new Date(toReal(v) * 1000), "yyyy")}
          minTickGap={40}
          type="number"
          domain={["dataMin", "dataMax"]}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatYAxis}
          width={70}
          domain={["auto", "auto"]}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const data = payload[0]?.payload;
            if (!data?.timestamp) return null;

            const stage = stages.findLast((s) => data.timestamp >= s.start);
            const value = payload[0].value as number;

            return (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-3 text-sm">
                <div className="font-medium mb-1 text-zinc-300">
                  {format(new Date(data.timestamp * 1000), "MMM d, yyyy")}
                </div>
                {stage && (
                  <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold">
                    {stage.name}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[--color-price]" />
                  <span className="text-zinc-400">Price:</span>
                  <span className="font-mono text-white">
                    {formatPrice(value, baseToken.symbol)} / {tokenSymbol}
                  </span>
                </div>
              </div>
            );
          }}
        />

        {stageAreas.map((area) => (
          <ReferenceArea
            key={area.name}
            x1={area.x1}
            x2={area.x2}
            fill={area.fill}
            fillOpacity={1}
          />
        ))}

        <Area
          type="monotone"
          dataKey="price"
          stroke="var(--color-price)"
          strokeWidth={2}
          fill="url(#priceFill)"
          connectNulls
          isAnimationActive={false}
        />

        {stageAreas.map((area) => (
          <ReferenceLine
            key={`line-${area.name}`}
            x={area.x1}
            stroke="hsl(0 0% 80%)"
            strokeDasharray="3 3"
            label={{
              value: area.name,
              position: "insideTopLeft",
              fill: "hsl(0 0% 50%)",
              fontSize: 12,
              offset: 10,
              fontWeight: 500,
            }}
          />
        ))}

        {todayVisualX !== null && (
          <ReferenceLine
            x={todayVisualX}
            stroke="hsl(166 60% 40%)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        )}
      </AreaChart>
    </ChartContainer>
  );
}

function formatYAxis(value: number): string {
  if (value === 0) return "0";
  if (value < 0.000001) return value.toExponential(1);
  if (value < 0.001) return value.toExponential(2);
  if (value < 1) return value.toFixed(4);
  if (value < 1000) return value.toFixed(2);
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatPrice(value: number, symbol: string): string {
  if (value === 0) return `0 ${symbol}`;
  if (value < 0.000001) return `${value.toExponential(4)} ${symbol}`;
  if (value < 0.001) return `${value.toPrecision(4)} ${symbol}`;
  return `${value.toFixed(6)} ${symbol}`;
}
