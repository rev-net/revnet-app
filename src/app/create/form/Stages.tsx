import { MAX_RULESET_COUNT } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { commaNumber } from "@/lib/number";
import { formatTokenSymbol } from "@/lib/utils";
import {
  ExclamationCircleIcon,
  LockClosedIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import { FieldArray } from "formik";
import { getCurrentStageDuration, getResolvedIssuance } from "../helpers/calculatePickupIssuance";
import { AddStageDialog } from "./AddStageDialog";
import { useCreateForm } from "./useCreateForm";

export function Stages({ disabled = false }: { disabled?: boolean }) {
  const { values, revnetTokenSymbol } = useCreateForm();

  const hasStages = values.stages.length > 0;

  const maxStageReached = values.stages.length >= MAX_RULESET_COUNT;
  const canAddStage = !hasStages || !maxStageReached;
  const reserveAsset = values.reserveAsset == "USDC" ? "USD" : "ETH";

  const getDynamicDuration = (currentStageIndex: number): number => {
    if (currentStageIndex >= values.stages.length - 1) {
      return 0; // Last stage is forever
    }

    const nextStage = values.stages[currentStageIndex + 1];
    const currentStage = values.stages[currentStageIndex];

    const duration = getCurrentStageDuration(nextStage, currentStage);
    return Number(duration);
  };

  return (
    <>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">3. Terms</h2>
        <p className="text-zinc-600 text-lg">
          <span className="capitalize">{revnetTokenSymbol}</span> issuance and cash out terms evolve
          over time automatically in stages.
        </p>
        <p className="text-zinc-600 text-lg mt-2">Staged terms can't be edited once deployed.</p>
      </div>
      <FieldArray
        name="stages"
        render={(arrayHelpers) => (
          <div className="mb-4 col-span-2">
            {values.stages.length > 0 ? (
              <div className="divide-y mb-2">
                {values.stages.map((stage, index) => {
                  const duration = getDynamicDuration(index);
                  return (
                    <div className="py-4" key={`${stage.stageStart}-${duration}`}>
                      <div className="mb-1 flex justify-between items-center">
                        <div className="font-semibold">Stage {index + 1}</div>
                        <div className="flex">
                          <AddStageDialog
                            stageIdx={index}
                            initialValues={stage}
                            onSave={(newStage) => {
                              arrayHelpers.replace(index, newStage);
                            }}
                          >
                            <Button variant="ghost" size="sm" disabled={disabled}>
                              {disabled ? null : <PencilSquareIcon className="h-4 w-4" />}
                            </Button>
                          </AddStageDialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            {disabled ? (
                              <LockClosedIcon className="h-4 w-4" />
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <dl className="text-md text-zinc-600 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
                        <dt className="font-medium">Duration</dt>
                        <dd>
                          {duration === 0 ? "Forever" : `${duration} days`}
                          {duration === 0 && index <= 1 && (
                            <>
                              {" "}
                              <span>( add another stage to change it )</span>
                            </>
                          )}
                        </dd>
                        <dt className="font-medium">Paid Issuance</dt>
                        <dd>
                          {getResolvedIssuance(stage, index, values.stages)}{" "}
                          {formatTokenSymbol(values.tokenSymbol) ?? "tokens"} / {reserveAsset}
                          {stage.pickUpFromPrevious && index > 0 && (
                            <span className="text-xs text-gray-500 italic"> (pickup)</span>
                          )}
                          {Number(stage.priceCeilingIncreasePercentage) > 0 &&
                            Number(stage.priceCeilingIncreaseFrequency) > 0 &&
                            ` cut ${stage.priceCeilingIncreasePercentage}% every ${stage.priceCeilingIncreaseFrequency} days`}
                          {(() => {
                            const splitSum = stage.splits.reduce(
                              (sum, split) => sum + (Number(split.percentage) || 0),
                              0,
                            );
                            return splitSum === 0 ? "" : `, ${splitSum}% split limit`;
                          })()}
                        </dd>
                        <dt className="font-medium">Auto issuance</dt>
                        <dd>
                          {stage.autoIssuance.reduce(
                            (sum, autoIssuance) => sum + (Number(autoIssuance.amount) || 0),
                            0,
                          ) === 0
                            ? "none"
                            : `${commaNumber(stage.autoIssuance.reduce((sum, autoIssuance) => sum + (Number(autoIssuance.amount) || 0), 0))} ${formatTokenSymbol(values.tokenSymbol) ?? "tokens"} auto issuance`}
                        </dd>
                        <dt className="font-medium">Cash out tax</dt>
                        <dd>{Number(stage.priceFloorTaxIntensity) / 100 || 0}</dd>
                      </dl>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-left text-black-500 font-semibold mb-4">Add stages</div>
            )}

            <AddStageDialog
              stageIdx={values.stages.length}
              onSave={(newStage) => {
                arrayHelpers.push(newStage);
              }}
            >
              <Button
                className="flex gap-1 border border-dashed border-zinc-400"
                variant="secondary"
                disabled={!canAddStage || disabled}
              >
                Add stage <PlusIcon className="h-3 w-3" />
              </Button>
            </AddStageDialog>
            {maxStageReached ? (
              <div className="text-md text-orange-900 mt-2 flex gap-1 p-2 bg-orange-50">
                <ExclamationCircleIcon className="h-4 w-4" /> You've added the maximum number of
                stages.
              </div>
            ) : !canAddStage ? (
              <div className="text-md text-orange-900 mt-2 flex gap-1 p-2 bg-orange-50">
                <ExclamationCircleIcon className="h-4 w-4" /> Your last stage is indefinite. Set a
                duration to add another stage.
              </div>
            ) : null}
          </div>
        )}
      />
    </>
  );
}
