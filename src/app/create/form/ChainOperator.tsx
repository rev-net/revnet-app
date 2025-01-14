import { useFormikContext, FieldArray } from "formik";
import { RevnetFormData } from "../types";
import { ChainLogo } from "@/components/ChainLogo";
import { JB_CHAINS } from "juice-sdk-core";
import { Field } from "./Fields";
import { chainSortOrder } from "@/app/constants";
import { twMerge } from "tailwind-merge";

export function ChainOperator({ disabled = false }: { disabled?: boolean }) {
  const { values } = useFormikContext<RevnetFormData>();
  return (
    <FieldArray
      name="operator"
      render={() => (
        <div className="mb-8">
          {values.chainIds.length > 0 &&(
            <div className="flex mb-2 text-sm font-medium text-zinc-500">
              <div className="w-48">Chain</div>
              <div>Operator address</div>
            </div>
          )}
          {[...values.chainIds]
            .sort((a, b) => {
              const aOrder = chainSortOrder.get(a) ?? 0;
              const bOrder = chainSortOrder.get(b) ?? 0;
              return aOrder - bOrder;
            })
            .map((chain, chainIndex) => (
              <div key={chainIndex} className="flex items-center text-md text-zinc-600 mt-4">
                <div className="flex gap-2 items-center w-48 text-sm">
                  <ChainLogo chainId={chain} width={25} height={25} />
                  <div className="text-zinc-400">{JB_CHAINS[chain].name}</div>
                </div>
                <Field
                  id={`operator.${chainIndex}.address`}
                  name={`operator.${chainIndex}.address`}
                  defaultValue={values.stages[0]?.initialOperator}
                  className="h-9 w-3/5"
                  placeholder="0x"
                  disabled={disabled}
                  required
                />
                <Field
                  type="hidden"
                  name={`operator.${chainIndex}.chainId`}
                  value={chain}
                />
              </div>
            ))}
        </div>
      )}
    />
  )
}
