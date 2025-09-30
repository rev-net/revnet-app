import { useFormikContext } from "formik";
import { StageData } from "../types";
import { NotesSection } from "./AddStageDialog";
import { FieldGroup } from "./Fields";

interface StartTimeFieldProps {
  stageIdx: number;
  stages: StageData[];
}

export function StartTimeField({ stageIdx, stages }: StartTimeFieldProps) {
  const { values, setFieldValue } = useFormikContext<StageData>();

  if (stageIdx === 0) {
    return null; // First stage doesn't have start time
  }

  const previousStage = stages[stageIdx - 1];
  const daysPerCut = Number(previousStage.priceCeilingIncreaseFrequency);
  const previousStageHasCuts = daysPerCut > 0;

  if (previousStageHasCuts) {
    const cutsValue = Number(values.stageStartCuts) || 3;
    return (
      <div className="pb-7">
        <div>
          <label htmlFor="cuts" className="block text-md font-semibold leading-6 mb-3">
            4. Start Time
          </label>
          <p className="text-md text-zinc-500 mb-3">
            How many issuance cuts of the previous stage before this stage starts?
          </p>
          <div className="flex items-center gap-2">
            <div className="relative w-32">
              <input
                id="cuts"
                type="number"
                min="1"
                step="any"
                value={values.stageStartCuts}
                onChange={(e) => {
                  const cutsValue = e.target.value;
                  setFieldValue("stageStartCuts", cutsValue);
                  const cuts = Number(cutsValue) || 3;
                  setFieldValue("stageStart", String(cuts * daysPerCut)); // We need to set it, so validation works
                }}
                name="stageStartCuts"
                className="h-9 w-full pr-12 px-3 text-md border border-zinc-200 rounded"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-md pointer-events-none">
                cuts
              </span>
            </div>
          </div>
          <div className="text-sm text-zinc-500 mt-2 pl-1">
            = {cutsValue * Number(previousStage.priceCeilingIncreaseFrequency)} days
            {` (${cutsValue} cuts × ${previousStage.priceCeilingIncreaseFrequency} days per cut)`}
          </div>
        </div>

        <NotesSection>
          <ul className="list-disc list-inside">
            <li className="flex">
              <span className="mr-2">•</span>
              <div>Cuts must be a positive integer.</div>
            </li>
          </ul>
        </NotesSection>
      </div>
    );
  }

  // Show days interface - stages without cuts
  return (
    <div className="pb-7">
      <FieldGroup
        id="stageStart"
        name="stageStart"
        label="4. Start Time"
        suffix="days"
        min="1"
        type="number"
        description="How many days after the last stage's start time should this stage start?"
        width="w-32"
      />
      <NotesSection>
        <ul className="list-disc list-inside">
          <li className="flex">
            <span className="mr-2">•</span>
            <div>Days must be a multiple of this stage's issuance cut rate.</div>
          </li>
        </ul>
      </NotesSection>
    </div>
  );
}
