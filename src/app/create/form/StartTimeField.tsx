import { useFormikContext } from "formik";
import { useState } from "react";
import { StageData } from "../types";
import { NotesSection } from "./AddStageDialog";
import { FieldGroup } from "./Fields";

interface StartTimeFieldProps {
  stageIdx: number;
  stages: StageData[];
}

export function StartTimeField({ stageIdx, stages }: StartTimeFieldProps) {
  const { values, setFieldValue } = useFormikContext<StageData>();
  const [useFutureStart, setUseFutureStart] = useState(Boolean(values.futureStartTimestamp));

  if (stageIdx === 0) {
    return (
      <div className="pb-7">
        <label className="block text-md font-semibold leading-6 mb-3">3. Start Time</label>
        <p className="text-md text-zinc-500 mb-3">
          By default, the revnet starts ~10 minutes after deployment.
        </p>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={useFutureStart}
            onChange={(e) => {
              setUseFutureStart(e.target.checked);
              if (!e.target.checked) {
                setFieldValue("futureStartTimestamp", undefined);
              }
            }}
            className="size-4"
          />
          <span className="text-md text-zinc-600">Start the revnet in the future</span>
        </label>
        {useFutureStart && (
          <div className="mt-3">
            <input
              type="datetime-local"
              min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
              value={formatTimestampForInput(values.futureStartTimestamp)}
              onChange={(e) => {
                const timestamp = Math.floor(new Date(e.target.value).getTime() / 1000);
                setFieldValue("futureStartTimestamp", timestamp);
              }}
              className="h-9 px-3 text-md border border-zinc-200 rounded bg-white"
            />
            {values.futureStartTimestamp && (
              <p className="text-sm text-zinc-500 mt-2">
                Starts at {new Date(values.futureStartTimestamp * 1000).toLocaleString()} (your
                local time)
              </p>
            )}
          </div>
        )}
      </div>
    );
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
            3. Start Time
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
        label="3. Start Time"
        suffix="days"
        min="0.042"
        step="any"
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

function formatTimestampForInput(timestamp: number | undefined): string {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toISOString().slice(0, 16);
}
