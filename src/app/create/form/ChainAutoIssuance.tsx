import { useFormikContext, FieldArray } from "formik";
import { RevnetFormData } from "../types";
import { Field } from "./Fields";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { formatTokenSymbol } from "@/lib/utils";
import { ChainSelector } from "@/components/ChainSelector";
import { formatEthAddress } from "juice-sdk-core";

export function ChainAutoIssuance({ disabled = false }: { disabled?: boolean }) {
  const { values, setFieldValue } = useFormikContext<RevnetFormData>();
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const revnetTokenSymbol = formatTokenSymbol(values.tokenSymbol);

  return (
    <div className="mb-10">
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
            {values.stages[selectedStageIdx]?.autoIssuance.map((issuance, index) => (
              <div key={index} className="flex items-center text-md text-zinc-600 my-6">
                <div className="w-full">
                  <div className="flex items-center text-sm font-semibold">
                    <div className="text-zinc-500 text-md mb-2">
                      {issuance.amount || "0"} {revnetTokenSymbol} • {formatEthAddress(issuance.beneficiary)}
                    </div>
                  </div>
                  <ChainSelector
                    value={issuance.chainId}
                    onChange={(chainId) => setFieldValue(`stages.${selectedStageIdx}.autoIssuance.${index}.chainId`, chainId)}
                    options={values.chainIds}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
}
