import { formatSeconds } from "@/lib/utils";
import {
  Ether,
  ONE_ETHER,
  ReservedRate,
  getNextCycleWeight,
  getPrevCycleWeight,
  getTokenBtoAQuote,
} from "juice-sdk-core";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Dot,
  DotProps,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useJBRulesetContext } from "../contexts/JBRulesetContext/JBRulesetContext";
import { RulesetWeight } from "../contexts/datatypes";

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
      price: number;
    };
    currentPrice: Ether;
    datapointIndex: number;
  }
) => {
  const { cx, cy, payload } = props;
  if (
    payload?.groupIdx === props.datapointIndex &&
    `${payload?.price}` === props.currentPrice.toFloat().toFixed(2)
  ) {
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={7}
        fill="#f97316"
        stroke="#fff"
        strokeWidth={2}
        className="animate-pulse"
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
  cycleDuration: bigint;
  renderData: { groupIdx: number; fc: number; date: Date }[];
}) => {
  const { x, y, payload } = props;
  const d = props.renderData[payload?.index ?? 1];
  if (d.groupIdx !== 0) return;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="#71717A"
        fontSize={"0.75rem"}
      >
        {formatSeconds(Number(props.cycleDuration) * d.fc)}
      </text>
    </g>
  );
};

const StepChart = () => {
  const { ruleset, rulesetMetadata } = useJBRulesetContext();

  const currentFcStart = ruleset?.data?.start;
  const startBuffer = currentFcStart ?? 0n - (ruleset?.data?.duration ?? 0n);
  const currentFcEnd =
    ruleset?.data?.start ?? 0n + (ruleset?.data?.duration ?? 0n);
  const nextFcEnd = currentFcEnd + (ruleset?.data?.duration ?? 0n);
  const nextNextFcEnd = nextFcEnd + (ruleset?.data?.duration ?? 0n);

  const prevWeight = new RulesetWeight(
    getPrevCycleWeight({
      weight: ruleset?.data?.weight.val ?? 0n,
      discountRate: ruleset?.data?.decayRate.val ?? 0n,
    })
  );
  const nextWeight = new RulesetWeight(
    getNextCycleWeight({
      weight: ruleset?.data?.weight.val ?? 0n,
      discountRate: ruleset?.data?.decayRate.val ?? 0n,
    })
  );
  const nextNextWeight = new RulesetWeight(
    getNextCycleWeight({
      weight: nextWeight.val ?? 0n,
      discountRate: ruleset?.data?.decayRate.val ?? 0n,
    })
  );

  const prevPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: prevWeight ?? new RulesetWeight(0n),
    reservedRate: rulesetMetadata?.data?.reservedRate ?? new ReservedRate(0n),
  });

  const currentPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: ruleset?.data?.weight ?? new RulesetWeight(0n),
    reservedRate: rulesetMetadata?.data?.reservedRate ?? new ReservedRate(0n),
  });
  const nextPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: new RulesetWeight(
      getNextCycleWeight({
        weight: nextWeight.val,
        discountRate: ruleset?.data?.decayRate.val ?? 0n,
      })
    ),
    reservedRate: rulesetMetadata?.data?.reservedRate ?? new ReservedRate(0n),
  });
  const nextNextPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: new RulesetWeight(
      getNextCycleWeight({
        weight: nextNextWeight.val,
        discountRate: ruleset?.data?.decayRate.val ?? 0n,
      })
    ),
    reservedRate: rulesetMetadata?.data?.reservedRate ?? new ReservedRate(0n),
  });

  const timeElapsed = Math.abs(Date.now() - Number(currentFcStart) * 1000);
  const percentElapsed =
    timeElapsed / (Number(ruleset?.data?.duration ?? 0n) * 1000);

  const datapointIndex = Math.floor(percentElapsed * steps);

  const renderData = useMemo(() => {
    return [
      ...generateDateRange(
        new Date(Number(startBuffer) * 1000),
        new Date(Number(currentFcStart) * 1000),
        steps
      )
        .map((d, i) => {
          return {
            fc: 1,
            groupIdx: i,
            date: d,
            price: prevPrice.toFloat().toFixed(2),
          };
        })
        .slice(steps * 0.6, steps),
      ...generateDateRange(
        new Date(Number(currentFcStart) * 1000),
        new Date(Number(currentFcEnd) * 1000),
        steps
      ).map((d, i) => {
        return {
          fc: 2,

          groupIdx: i,
          date: d,
          price: currentPrice.toFloat().toFixed(2),
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
          price: nextPrice.toFloat().toFixed(2),
        };
      }),
      ...generateDateRange(
        new Date(Number(nextFcEnd) * 1000),
        new Date(Number(nextNextFcEnd) * 1000),
        steps
      ).map((d, i) => {
        return {
          fc: 4,

          groupIdx: i,
          date: d,
          price: nextNextPrice.toFloat().toFixed(2),
        };
      }),
    ];
  }, [
    currentPrice,
    nextPrice,
    nextNextPrice,
    prevPrice,
    currentFcEnd,
    currentFcStart,
    nextFcEnd,
    nextNextFcEnd,
    startBuffer,
  ]);

  return (
    <div style={{ height: 300 }}>
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={renderData}>
          <defs>
            <linearGradient id="price" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.05} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            tickLine={false}
            tick={
              ruleset?.data ? (
                <CustomizedTick
                  renderData={renderData}
                  cycleDuration={ruleset.data.duration}
                />
              ) : undefined
            }
            interval={0}
            tickCount={renderData.length}
            stroke="#d4d4d8"
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <YAxis
            orientation="right"
            tickLine={false}
            axisLine={false}
            type="number"
            domain={[prevPrice.toFloat() * 0.99, "dataMax"]}
            fontSize={"0.75rem"}
            fill="#71717A"
            // hide
          />
          <Tooltip />
          <Area
            type="stepBefore"
            dataKey="price"
            stroke="#34d399"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#price)"
            dot={
              <CustomizedDot
                datapointIndex={datapointIndex}
                currentPrice={currentPrice as Ether}
              />
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StepChart;
