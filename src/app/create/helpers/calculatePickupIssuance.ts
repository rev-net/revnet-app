import { StageData } from "../types";

export function calculatePickupIssuance(
  previousStage: StageData,
  currentStageDuration: string | number,
): string | null {
  if (!previousStage || !currentStageDuration) return null;

  const baseIssuance = Number(previousStage.initialIssuance);
  const cutPercentage = Number(previousStage.priceCeilingIncreasePercentage);
  const cutFrequency = Number(previousStage.priceCeilingIncreaseFrequency);
  const stageDuration = Number(currentStageDuration);

  if (cutPercentage === 0 || cutFrequency === 0) {
    return previousStage.initialIssuance;
  }

  const numberOfCuts = Math.floor(stageDuration / cutFrequency);

  const finalIssuance = baseIssuance * Math.pow((100 - cutPercentage) / 100, numberOfCuts);

  return finalIssuance.toFixed(3);
}

export function getCurrentStageDuration(currentStage: StageData, previousStage: StageData): string {
  // If using cuts-based timing
  if (currentStage.stageStartCuts && previousStage) {
    const cuts = Number(currentStage.stageStartCuts);
    const daysPerCut = Number(previousStage.priceCeilingIncreaseFrequency);
    return String(cuts * daysPerCut);
  }

  // Otherwise use direct days
  return currentStage.stageStart;
}

export function getResolvedIssuance(
  stage: StageData,
  stageIndex: number,
  allStages: StageData[],
): string {
  if (!stage.pickUpFromPrevious || stageIndex === 0) {
    return stage.initialIssuance;
  }

  const previousStage = allStages[stageIndex - 1];

  const previousStageIssuance = previousStage.pickUpFromPrevious
    ? getResolvedIssuance(previousStage, stageIndex - 1, allStages)
    : previousStage.initialIssuance;

  const resolvedPreviousStage = {
    ...previousStage,
    initialIssuance: previousStageIssuance,
  };

  const currentStageDuration = getCurrentStageDuration(stage, previousStage);
  return (
    calculatePickupIssuance(resolvedPreviousStage, currentStageDuration) || stage.initialIssuance
  );
}
