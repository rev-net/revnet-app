"use client";

import { useFormikContext } from "formik";
import { RevnetFormData } from "../types";

export function useCreateForm() {
  const context = useFormikContext<RevnetFormData>();

  const revnetTokenSymbol =
    context.values.tokenSymbol?.length > 0 ? `$${context.values.tokenSymbol}` : "token";

  return {
    ...context,
    revnetTokenSymbol,
  };
}
