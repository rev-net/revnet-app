import { StageData } from "../types";

export function stageStart(stages: StageData[], index: number): string {
  if (stages.length === 0 || stages.length === index + 1) {
    return "Forever";
  }

  const duration = Number(stages[index + 1]?.stageStart);

  return `${duration} ${duration === 1 ? "day" : "days"}`;
}
