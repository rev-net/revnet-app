import { useState } from "react";
import {
  Field as FormikField,
  useFormikContext
} from "formik";
import { JBChainId } from "juice-sdk-core";
import { chainNames } from "@/app/constants";
import { RevnetFormData } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ChainSelect({
  validBundle
}: {
  validBundle: boolean
}) {
  const [environment, setEnvironment] = useState("testing");

  const { values, setFieldValue } = useFormikContext<RevnetFormData>();

  const handleChainSelect = (chainId: number, checked: boolean) => {
    setFieldValue(
      "chainIds",
      checked
        ? [...values.chainIds, chainId]
        : values.chainIds.filter((id) => id !== chainId)
    );
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="text-left text-black-500 mb-4 font-semibold">
        Choose your chains
      </div>
      <div className="max-w-56">
        <Select
          onValueChange={(v) => {
            setEnvironment(v);
          }}
          defaultValue="testing"
        >
          <SelectTrigger className="col-span-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="testing" key="testing">
              Testnets
            </SelectItem>
            <SelectItem value="production" key="production" disabled>
              Production (coming soon)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-6 mt-4">
        {environment === "production" ? (
          <p>...</p> //TODO with production chainnames
        ) : (
          <>
            {Object.entries(chainNames).map(([id, name]) => (
              <label key={id} className="flex items-center gap-2">
                <FormikField
                  type="checkbox"
                  name="chainIds"
                  value={id}
                  disabled={validBundle}
                  className="disabled:opacity-50"
                  checked={values.chainIds.includes(Number(id) as JBChainId)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChainSelect(Number(id), e.target.checked);
                  }}
                />
                {name}
              </label>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
