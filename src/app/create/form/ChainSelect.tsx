import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field as FormikField, useFormikContext } from "formik";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { useState } from "react";
import { RevnetFormData } from "../types";

export function ChainSelect({ disabled = false }: { disabled?: boolean }) {
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

  const revnetTokenSymbol =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "token";

  return (
    <>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">3. Deploy</h2>
        <p className="text-zinc-600 text-lg">
          Pick which chains your revnet will accept money on and issue{" "}
          {revnetTokenSymbol} from.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          Holder of {revnetTokenSymbol} can cash out on any of the selected
          chains, and can move their {revnetTokenSymbol} between chains at any
          time.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          The Operator you set in your revnet's rules will also be able to add
          new chains to the revnet later.
        </p>
      </div>
      <div className="md:col-span-2">
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
              disabled={disabled}
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
                {Object.values(JB_CHAINS).map(({ chain, name }) => (
                  <label key={chain.id} className="flex items-center gap-2">
                    <FormikField
                      type="checkbox"
                      name="chainIds"
                      value={chain.id}
                      disabled={disabled}
                      className="disabled:opacity-50"
                      checked={values.chainIds.includes(
                        Number(chain.id) as JBChainId
                      )}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChainSelect(Number(chain.id), e.target.checked);
                      }}
                    />
                    {name}
                  </label>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
