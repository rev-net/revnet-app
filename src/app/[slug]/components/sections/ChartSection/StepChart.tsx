import { MAX_RULESET_COUNT } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Ether, RulesetWeight, WeightCutPercent } from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useJBRulesetContext,
  useReadJbRulesetsAllOf,
} from "juice-sdk-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { twJoin } from "tailwind-merge";
import { CustomChartDot } from "./CustomChartDot";
import { CustomChartTooltip } from "./CustomChartTooltip";
import { CustomChartXTick } from "./CustomChartXTick";
import { useChartData } from "./useChartData";

const INITIAL_SELECTED_STAGE = -1;

const STEPS = 50;

const StepChart = () => {
  const [selectedStage, setSelectedStage] = useState<number>(INITIAL_SELECTED_STAGE);

  const { projectId } = useJBContractContext();
  const { rulesetMetadata } = useJBRulesetContext();
  const chainId = useJBChainId();

  const { data: rulesets } = useReadJbRulesetsAllOf({
    chainId,
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
    query: {
      select(data) {
        return data.map((ruleset) => {
          return {
            ...ruleset,
            weight: new RulesetWeight(ruleset.weight),
            weightCutPercent: new WeightCutPercent(ruleset.weightCutPercent),
          };
        });
      },
    },
  });

  const stages = rulesets?.reverse();
  const nextStageIdx = Math.max(
    stages?.findIndex((stage) => stage.start > Date.now() / 1000) ?? -1,
    1, // lower bound should be 1 (the minimum 'next stage' is 1)
  );
  const currentStageIdx = nextStageIdx - 1;

  // set the selected stage to the currently active stage
  useEffect(() => {
    if (selectedStage === INITIAL_SELECTED_STAGE) {
      setSelectedStage(currentStageIdx);
    }
  }, [currentStageIdx, selectedStage]);

  const ruleset = { data: stages?.[selectedStage] }; // the selected ruleset

  const { chartData, currentPrice, prevPrice, datapointIndex } = useChartData({
    ruleset: ruleset?.data,
    rulesetMetadata: rulesetMetadata?.data ?? undefined,
    steps: STEPS,
  });

  return (
    <div>
      <div className="mb-2 flex gap-2">
        {stages?.map((ruleset, idx) => {
          return (
            <Button
              variant="ghost"
              className={twJoin(
                "text-sm font-normal",
                selectedStage === idx && "font-medium underline",
              )}
              key={ruleset.id.toString() + idx}
              onClick={() => setSelectedStage(idx)}
            >
              Stage {idx + 1}{" "}
              {idx === currentStageIdx && (
                <span className="rounded-full h-2 w-2 bg-orange-400 border-[2px] border-orange-200 ml-1"></span>
              )}
            </Button>
          );
        })}
      </div>

      <div style={{ height: 300 }}>
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={chartData}>
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
                  <CustomChartXTick renderData={chartData} ruleset={ruleset.data} />
                ) : undefined
              }
              interval={0}
              tickCount={chartData.length}
              stroke="#d4d4d8"
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              type="number"
              domain={[(prevPrice.toFloat() * 0.99).toFixed(6), "dataMax"]}
              fontSize={"0.75rem"}
              fill="#71717A"
              // hide
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Area
              type="stepBefore"
              dataKey="price"
              stroke="#34d399"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#price)"
              dot={
                <CustomChartDot
                  datapointIndex={datapointIndex}
                  currentPrice={currentPrice as Ether}
                />
              }
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StepChart;
