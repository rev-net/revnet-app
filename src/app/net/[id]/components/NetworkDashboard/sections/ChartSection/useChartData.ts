import {
  Ether,
  JBRulesetData,
  JBRulesetMetadata,
  ONE_ETHER,
  ReservedRate,
  RulesetWeight,
  getNextRulesetWeight,
  getPrevRulesetWeight,
  getTokenBtoAQuote,
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
  const startBuffer = currentFcStart ?? 0n - (ruleset?.duration ?? 0n);
  const currentFcEnd = ruleset?.start ?? 0n + (ruleset?.duration ?? 0n);
  const nextFcEnd = currentFcEnd + (ruleset?.duration ?? 0n);
  const nextNextFcEnd = nextFcEnd + (ruleset?.duration ?? 0n);

  const prevWeight = new RulesetWeight(
    getPrevRulesetWeight({
      weight: ruleset?.weight.value ?? 0n,
      decayRate: ruleset?.decayRate.value ?? 0n,
    })
  );
  const nextWeight = new RulesetWeight(
    getNextRulesetWeight({
      weight: ruleset?.weight.value ?? 0n,
      decayRate: ruleset?.decayRate.value ?? 0n,
    })
  );
  const nextNextWeight = new RulesetWeight(
    getNextRulesetWeight({
      weight: nextWeight.value ?? 0n,
      decayRate: ruleset?.decayRate.value ?? 0n,
    })
  );

  const prevPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: prevWeight ?? new RulesetWeight(0n),
    reservedRate: rulesetMetadata?.reservedRate ?? new ReservedRate(0n),
  });

  const currentPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: ruleset?.weight ?? new RulesetWeight(0n),
    reservedRate: rulesetMetadata?.reservedRate ?? new ReservedRate(0n),
  });
  const nextPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: nextWeight,
    reservedRate: rulesetMetadata?.reservedRate ?? new ReservedRate(0n),
  });
  const nextNextPrice = getTokenBtoAQuote(new Ether(ONE_ETHER), 18, {
    weight: nextNextWeight,
    reservedRate: rulesetMetadata?.reservedRate ?? new ReservedRate(0n),
  });

  const timeElapsed = Math.abs(Date.now() - Number(currentFcStart) * 1000);
  const percentElapsed = timeElapsed / (Number(ruleset?.duration ?? 0n) * 1000);

  const datapointIndex = Math.floor(percentElapsed * steps);

  const chartData = useMemo(() => {
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
            price: prevPrice.toFloat().toFixed(4),
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
          price: currentPrice.toFloat().toFixed(4),
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
          price: nextPrice.toFloat().toFixed(4),
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
          price: nextNextPrice.toFloat().toFixed(4),
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
