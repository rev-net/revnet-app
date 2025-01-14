import { StageData } from "../types";

export function stageDuration(stages: StageData[], index: number): string {
  if (stages.length === 0 || stages.length === index + 1) {
    return "Forever";
  }

  const duration = Number(stages[index + 1]?.boostDuration);

  return `${duration} ${duration === 1 ? "day" : "days"}`;
}
