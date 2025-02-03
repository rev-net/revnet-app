import { FieldArray, useFormikContext } from "formik";
import {
  ExclamationCircleIcon,
  PencilSquareIcon,
  LockClosedIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { MAX_RULESET_COUNT } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/solid";
import { RevnetFormData } from "../types";
import { AddStageDialog } from "./AddStageDialog";
import { stageDuration } from "../helpers/stageDuration";
import { formatTokenSymbol } from "@/lib/utils";
import { commaNumber } from "@/lib/number";

export function Stages({
  disabled = false
}: {
  disabled?: boolean
}) {
  const { values, setFieldValue } = useFormikContext<RevnetFormData>();
  const nativeTokenSymbol = useNativeTokenSymbol();

  const hasStages = values.stages.length > 0;

  const revnetTokenSymbolCapitalized =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "Token";

  const maxStageReached = values.stages.length >= MAX_RULESET_COUNT;
  const canAddStage = !hasStages || !maxStageReached;
  return (
    <>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">2. Rules</h2>
        <p className="text-zinc-600 text-lg">
          {revnetTokenSymbolCapitalized} issuance and cash out rules evolve over
          time automatically in stages.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          Staged rules can't be edited once deployed.
        </p>
      </div>
      <FieldArray
        name="stages"
        render={(arrayHelpers) => (
          <div className="mb-4 col-span-2">
            {values.stages.length > 0 ? (
              <div className="divide-y mb-2">
                {values.stages.map((stage, index) => (
                  <div className="py-4" key={index}>
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
                            {disabled ? (
                              null
                            ) : (
                              <PencilSquareIcon className="h-4 w-4" />
                            )}
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
                    <div className="text-md text-zinc-500 flex gap-2 flex-wrap">
                      <div>
                        {stageDuration(values.stages, index)}
                      </div>
                      •
                      <div>
                        {stage.initialIssuance} {formatTokenSymbol(values.tokenSymbol) ?? "tokens"}{" "}
                        / {nativeTokenSymbol}
                        {", "}-{stage.priceCeilingIncreasePercentage || 0}%
                        every {stage.priceCeilingIncreaseFrequency} days
                      </div>
                      •
                      <div>
                        {(Number(stage.priceFloorTaxIntensity) || 0) / 100} cash
                        out tax rate
                      </div>
                      <div>• {stage.splits.reduce((sum, split) => sum + (Number(split.percentage) || 0), 0)}% split limit</div>
                      <div>• {commaNumber(stage.autoIssuance.reduce((sum, autoIssuance) => sum + (Number(autoIssuance.amount) || 0), 0))} {formatTokenSymbol(values.tokenSymbol) ?? "tokens"} auto issuance</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-left text-black-500 font-semibold mb-4">
                Add stages
              </div>
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
                <ExclamationCircleIcon className="h-4 w-4" /> You've added the
                maximum number of stages.
              </div>
            ) : !canAddStage ? (
              <div className="text-md text-orange-900 mt-2 flex gap-1 p-2 bg-orange-50">
                <ExclamationCircleIcon className="h-4 w-4" /> Your last stage is
                indefinite. Set a duration to add another stage.
              </div>
            ) : null}
          </div>
        )}
      />
    </>
  );
}
