import { StageData } from "../types";

interface PickupFromPreviousStageProps {
  stageIdx: number;
  values: StageData;
  setFieldValue: (field: string, value: any) => void;
}

export function PickupFromPreviousStage({
  stageIdx,
  values,
  setFieldValue,
}: PickupFromPreviousStageProps) {
  const pickUpFromPrevious = values.pickUpFromPrevious ?? false;

  if (stageIdx === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-3 mb-3">
      <input
        type="checkbox"
        id="pickUpFromPrevious"
        checked={pickUpFromPrevious}
        onChange={(e) => setFieldValue("pickUpFromPrevious", e.target.checked)}
        className="h-4 w-4"
      />
      <label htmlFor="pickUpFromPrevious" className="text-md text-zinc-600">
        Pick up where previous stage left off
      </label>
    </div>
  );
}
