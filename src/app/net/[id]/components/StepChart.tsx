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
  Dot,
  DotProps,
  Line,
  LineChart,
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
        fill="#4ade80"
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
  renderData: { groupIdx: number; fc: number }[];
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
        textAnchor="end"
        fill="#71717A"
        fontSize={"0.75rem"}
      >
        {d.fc}
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
            value: prevPrice.toFloat().toFixed(2),
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
      ...generateDateRange(
        new Date(Number(nextFcEnd) * 1000),
        new Date(Number(nextNextFcEnd) * 1000),
        steps
      ).map((d, i) => {
        return {
          fc: 4,

          groupIdx: i,
          date: d,
          value: nextNextPrice.toFloat().toFixed(2),
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
        <LineChart data={renderData}>
          <XAxis
            tickLine={false}
            xAxisId="0"
            tick={<CustomizedTick renderData={renderData} />}
            interval={0}
            tickCount={renderData.length}
            stroke="#d4d4d8"
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
            stroke="#34d399"
            isAnimationActive={false}
            strokeWidth={2}
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
