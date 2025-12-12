"use client";

import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { RangeOption, RangeSelector } from "@/components/ui/range-selector";
import { parseTimeRange, TimeRange } from "@/lib/timeRange";
import { formatPrice } from "@/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { JBChainId, JBVersion } from "juice-sdk-core";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartToggleButton } from "./ChartToggleButton";
import { getTokenPriceChartData } from "./getTokenPriceChartData";
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
  projectId: string;
  chainId: JBChainId;
  version: JBVersion;
  suckerGroupId: string;
  token: string;
  tokenSymbol: string;
  tokenDecimals: number;
}

export function TokenPriceChart({
  projectId,
  chainId,
  version,
  suckerGroupId,
  token,
  tokenSymbol,
  tokenDecimals,
}: Props) {
  const searchParams = useSearchParams();
  const range = parseTimeRange(searchParams.get("range"));

  const { data, isLoading } = useQuery({
    queryKey: ["chartData", projectId, chainId, version, suckerGroupId, range],
    queryFn: () =>
      getTokenPriceChartData({
        projectId,
        chainId,
        version,
        range,
        suckerGroupId,
        baseToken: { address: token, symbol: tokenSymbol, decimals: tokenDecimals },
      }),
    placeholderData: keepPreviousData,
  });

  const [showIssuance, setShowIssuance] = useState(true);
  const [showAmm, setShowAmm] = useState(true);
  const [showFloor, setShowFloor] = useState(true);

  const chartData = data?.chartData ?? [];
  const hasData = chartData.length > 0;

  const hasPool = data?.hasPool ?? false;
  const hasAmmData = chartData.some((d) => d.ammPrice !== undefined);
  const hasFloorData = chartData.some((d) => d.floorPrice !== undefined);

  const filteredData = chartData.map((point) => ({
    timestamp: point.timestamp,
    issuancePrice: showIssuance ? point.issuancePrice : undefined,
    ammPrice: showAmm ? point.ammPrice : undefined,
    floorPrice: showFloor ? point.floorPrice : undefined,
    totalSupply: showFloor ? point.totalSupply : undefined,
    totalBalance: showFloor ? point.totalBalance : undefined,
    cashOutTaxRate: showFloor ? point.cashOutTaxRate : undefined,
  }));

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2.5 items-start md:flex-row md:justify-between md:items-center">
        <div className="flex gap-1.5 md:gap-4 flex-wrap">
          <ChartToggleButton
            label="Issuance Price"
            active={showIssuance}
            colorVar="--chart-1"
            onClick={() => setShowIssuance(!showIssuance)}
          />
          {hasPool && (
            <ChartToggleButton
              label="Pool Price"
              active={showAmm}
              disabled={!hasAmmData}
              colorVar="--chart-2"
              onClick={() => setShowAmm(!showAmm)}
            />
          )}
          <ChartToggleButton
            label="Cash out Price"
            active={showFloor}
            disabled={!hasFloorData}
            colorVar="--chart-3"
            onClick={() => setShowFloor(!showFloor)}
          />
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
                  baseTokenSymbol={tokenSymbol}
                  baseTokenDecimals={tokenDecimals}
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
