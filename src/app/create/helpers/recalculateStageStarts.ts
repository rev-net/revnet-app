import { StageData } from "../types";

export function calculateFinalStageStarts(stages: StageData[]): StageData[] {
  return stages.map((stage, index) => {
    if (index === 0) return stage;

    if (stage.stageStartCuts) {
      const previousStage = stages[index - 1];
      const daysPerCut = Number(previousStage.priceCeilingIncreaseFrequency);

      if (daysPerCut > 0) {
        const cuts = Number(stage.stageStartCuts);
        return {
          ...stage,
          stageStart: String(cuts * daysPerCut),
          // Remove stageStartCuts from final data
          stageStartCuts: undefined,
        };
      }
    }

    return stage;
  });
}
