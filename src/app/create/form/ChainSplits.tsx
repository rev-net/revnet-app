import { useFormikContext, FieldArray } from "formik";
import { RevnetFormData } from "../types";
import { ChainLogo } from "@/components/ChainLogo";
import { JB_CHAINS } from "juice-sdk-core";
import { Field } from "./Fields";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { sortChains } from "@/lib/utils";

export function ChainSplits({ disabled = false }: { disabled?: boolean }) {
  const { values } = useFormikContext<RevnetFormData>();
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  return (
    <div className="mb-10">
      <h2 className="text-left text-black-500 mb-4 font-semibold">
        Splits
      </h2>
      <FieldArray
        name="stages"
        render={() => (
          <div>
            <div className="flex gap-4 mb-4">
              {values.stages.map((_, idx) => (
                <Button
                  key={idx}
                  variant={selectedStageIdx === idx ? "tab-selected" : "bottomline"}
                  className={twJoin(
                    "text-md text-zinc-400",
                    selectedStageIdx === idx && "text-inherit"
                  )}
                  onClick={() => setSelectedStageIdx(idx)}
                >
                  Stage {idx + 1}
                </Button>
              ))}
            </div>

            {values.stages[selectedStageIdx]?.splits.map((split, splitIndex) => (
              <div key={splitIndex} className="mb-8">
                <div className="flex items-center gap-2 mb-6 text-sm font-semibold">
                  <div className="text-zinc-500 text-md">
                    Split {splitIndex + 1} ({split.percentage || "0"}%)
                  </div>
                </div>
                <div className="space-y-3">
                  {sortChains(values.chainIds).map((chainId, chainIndex) => (
                    <div key={chainId} className="flex items-center text-md text-zinc-600">
                      <div className="flex gap-2 items-center w-48 text-sm">
                        <ChainLogo chainId={chainId} width={25} height={25} />
                        <div className="text-zinc-400">{JB_CHAINS[chainId].name}</div>
                      </div>
                      <Field
                        id={`stages.${selectedStageIdx}.splits.${splitIndex}.beneficiary[${chainIndex}].address`}
                        name={`stages.${selectedStageIdx}.splits.${splitIndex}.beneficiary[${chainIndex}].address`}
                        type="text"
                        className="h-9 flex-1"
                        placeholder="0x..."
                        defaultValue={values.stages[selectedStageIdx]?.splits[splitIndex]?.beneficiary[0]?.address}
                        disabled={disabled}
                        required
                        address
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
}
