import {
  Ether,
  getNextRulesetWeight,
  getPrevRulesetWeight,
  getTokenBtoAQuote,
  JBRulesetData,
  JBRulesetMetadata,
  ONE_ETHER,
  ReservedPercent,
  RulesetWeight,
} from "juice-sdk-core";
import { useMemo } from "react";

function generateDateRange(startDate: Date, endDate: Date, resolution: number) {
  const dateRange = [];
  const interval = (endDate.getTime() - startDate.getTime()) / (resolution - 1);

  for (let i = 0; i < resolution; i++) {
    const date = new Date(startDate.getTime() + i * interval);
    dateRange.push(date);
  }

  return dateRange;
}

export function useChartData({
  ruleset,
  rulesetMetadata,
  steps,
}: {
  ruleset: JBRulesetData | undefined;
  rulesetMetadata: JBRulesetMetadata | undefined;
  steps: number;
}) {
  const currentFcStart = ruleset?.start;
  const startBuffer = (currentFcStart ?? 0) - (ruleset?.duration ?? 0);
  const currentFcEnd = (ruleset?.start ?? 0) + (ruleset?.duration ?? 0);
  const nextFcEnd = currentFcEnd + (ruleset?.duration ?? 0);
  const nextNextFcEnd = nextFcEnd + (ruleset?.duration ?? 0);

  const prevWeight = new RulesetWeight(
    getPrevRulesetWeight({
      weight: ruleset?.weight.value ?? 0n,
      weightCutPercent: Number(ruleset?.weightCutPercent.value ?? 0n),
    }),
  );
  const nextWeight = new RulesetWeight(
    getNextRulesetWeight({
      weight: ruleset?.weight.value ?? 0n,
      weightCutPercent: Number(ruleset?.weightCutPercent.value ?? 0n),
    }),
  );
  const nextNextWeight = new RulesetWeight(
    getNextRulesetWeight({
      weight: nextWeight.value ?? 0n,
      weightCutPercent: Number(ruleset?.weightCutPercent.value ?? 0n),
    }),
  );

  const prevPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: prevWeight ?? new RulesetWeight(0n),
    reservedPercent: rulesetMetadata?.reservedPercent ?? new ReservedPercent(0),
  });

  const currentPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: ruleset?.weight ?? new RulesetWeight(0n),
    reservedPercent: rulesetMetadata?.reservedPercent ?? new ReservedPercent(0),
  });
  const nextPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: nextWeight,
    reservedPercent: rulesetMetadata?.reservedPercent ?? new ReservedPercent(0),
  });
  const nextNextPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: nextNextWeight,
    reservedPercent: rulesetMetadata?.reservedPercent ?? new ReservedPercent(0),
  });

  const timeElapsed = Math.abs(Date.now() - Number(currentFcStart) * 1000);
  const percentElapsed = timeElapsed / (Number(ruleset?.duration ?? 0n) * 1000);

  const datapointIndex = Math.floor(percentElapsed * steps);

  const chartData = useMemo(() => {
    return [
      ...generateDateRange(
        new Date(Number(startBuffer) * 1000),
        new Date(Number(currentFcStart) * 1000),
        steps,
      )
        .map((d, i) => {
          return {
            fc: 1,
            groupIdx: i,
            date: d,
            price: prevPrice.toFloat().toFixed(8),
          };
        })
        .slice(steps * 0.6, steps),
      ...generateDateRange(
        new Date(Number(currentFcStart) * 1000),
        new Date(Number(currentFcEnd) * 1000),
        steps,
      ).map((d, i) => {
        return {
          fc: 2,

          groupIdx: i,
          date: d,
          price: currentPrice.toFloat().toFixed(8),
        };
      }),
      ...generateDateRange(
        new Date(Number(currentFcEnd) * 1000),
        new Date(Number(nextFcEnd) * 1000),
        steps,
      ).map((d, i) => {
        return {
          fc: 3,

          groupIdx: i,
          date: d,
          price: nextPrice.toFloat().toFixed(8),
        };
      }),
      ...generateDateRange(
        new Date(Number(nextFcEnd) * 1000),
        new Date(Number(nextNextFcEnd) * 1000),
        steps,
      ).map((d, i) => {
        return {
          fc: 4,

          groupIdx: i,
          date: d,
          price: nextNextPrice.toFloat().toFixed(8),
        };
      }),
    ];
  }, [
    steps,
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

  return { chartData, currentPrice, prevPrice, datapointIndex };
}
