import {
  getNextCycleWeight,
  getPrevCycleWeight,
  getTokenBtoAQuote,
} from "@/lib/juicebox/utils";
import { ONE_ETHER } from "juice-hooks/lib/constants";
import { useJBFundingCycleContext } from "juice-hooks/lib/react";
import {
  Ether,
  FundingCycleWeight,
  ReservedRate,
} from "juice-hooks/lib/utils/data";
import { useMemo } from "react";
import {
  Dot,
  DotProps,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function generateDateRange(startDate: Date, endDate: Date, resolution: number) {
  const dateRange = [];
  const interval = (endDate.getTime() - startDate.getTime()) / (resolution - 1);

  for (let i = 0; i < resolution; i++) {
    const date = new Date(startDate.getTime() + i * interval);
    dateRange.push(date);
  }

  return dateRange;
}

const steps = 50;

const CustomizedDot = (
  props: DotProps & {
    payload?: {
      groupIdx: number;
      value: number;
    };
    currentPrice: Ether;
    datapointIndex: number;
  }
) => {
  const { cx, cy, payload } = props;
  if (
    payload?.groupIdx === props.datapointIndex &&
    `${payload?.value}` === props.currentPrice.toFloat().toFixed(2)
  ) {
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={6}
        fill="#a3e635"
        stroke="#65a30d"
        strokeWidth={1}
      />
    );
  }

  return null;
};

const CustomizedTick = (props: {
  x?: number;
  y?: number;
  payload?: {
    index: number;
  };
  renderData: { groupIdx: number; fc: number }[];
}) => {
  const { x, y, payload } = props;
  const d = props.renderData[payload?.index ?? 1];
  if (d.groupIdx !== 0) return;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666">
        {d.fc}
      </text>
    </g>
  );
};

const StepChart = () => {
  const { fundingCycleData, fundingCycleMetadata } = useJBFundingCycleContext();

  const currentFcStart = fundingCycleData?.data?.start;
  const startBuffer = currentFcStart ?? 0n - BigInt(3600 * 24 * 4);
  const currentFcEnd =
    fundingCycleData?.data?.start ??
    0n + (fundingCycleData?.data?.duration ?? 0n);
  const nextFcEnd = currentFcEnd + (fundingCycleData?.data?.duration ?? 0n);

  const prevWeight = new FundingCycleWeight(
    getPrevCycleWeight({
      weight: fundingCycleData?.data?.weight.val ?? 0n,
      discountRate: fundingCycleData?.data?.discountRate.val ?? 0n,
    })
  );
  const nextWeight = new FundingCycleWeight(
    getNextCycleWeight({
      weight: fundingCycleData?.data?.weight.val ?? 0n,
      discountRate: fundingCycleData?.data?.discountRate.val ?? 0n,
    })
  );

  const prevPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: prevWeight ?? new FundingCycleWeight(0n),
    reservedRate:
      fundingCycleMetadata?.data?.reservedRate ?? new ReservedRate(0n),
  });

  const currentPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: fundingCycleData?.data?.weight ?? new FundingCycleWeight(0n),
    reservedRate:
      fundingCycleMetadata?.data?.reservedRate ?? new ReservedRate(0n),
  });
  const nextPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: new FundingCycleWeight(
      getNextCycleWeight({
        weight: nextWeight.val,
        discountRate: fundingCycleData?.data?.discountRate.val ?? 0n,
      })
    ),
    reservedRate:
      fundingCycleMetadata?.data?.reservedRate ?? new ReservedRate(0n),
  });

  const timeElapsed = Math.abs(Date.now() - Number(currentFcStart) * 1000);
  const percentElapsed = timeElapsed / (3600 * 24 * 28 * 1000);
  const datapointIndex = Math.floor(percentElapsed * steps);
  const renderData = useMemo(() => {
    return [
      ...generateDateRange(
        new Date(Number(startBuffer) * 1000),
        new Date(Number(currentFcStart) * 1000),
        steps
      ).map((d, i) => {
        return {
          fc: 1,
          groupIdx: i,
          date: d,
          value: prevPrice.toFloat().toFixed(2),
        };
      }),
      ...generateDateRange(
        new Date(Number(currentFcStart) * 1000),
        new Date(Number(currentFcEnd) * 1000),
        steps
      ).map((d, i) => {
        return {
          fc: 2,

          groupIdx: i,
          date: d,
          value: currentPrice.toFloat().toFixed(2),
        };
      }),
      ...generateDateRange(
        new Date(Number(currentFcEnd) * 1000),
        new Date(Number(nextFcEnd) * 1000),
        steps
      ).map((d, i) => {
        return {
          fc: 3,

          groupIdx: i,
          date: d,
          value: nextPrice.toFloat().toFixed(2),
        };
      }),
    ];
  }, [
    currentPrice,
    nextPrice,
    prevPrice,
    currentFcEnd,
    currentFcStart,
    nextFcEnd,
    startBuffer,
  ]);

  console.log([
    prevPrice.toFloat().toFixed(2),
    currentPrice.toFloat().toFixed(2),
    nextPrice.toFloat().toFixed(2),
  ]);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={renderData}>
          <XAxis
            tickLine={false}
            xAxisId="0"
            tick={<CustomizedTick renderData={renderData} />}
            interval={0}
            tickCount={renderData.length}
          />
          <YAxis
            type="number"
            domain={[prevPrice.toFloat() * 0.99, "dataMax"]}
            hide
          />
          <Tooltip />
          <Line
            type="stepBefore"
            dataKey="value"
            stroke="#84cc16"
            isAnimationActive={false}
            dot={
              <CustomizedDot
                datapointIndex={datapointIndex}
                currentPrice={currentPrice as Ether}
              />
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StepChart;
