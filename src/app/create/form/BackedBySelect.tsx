// removed from initial deploy for simplicity
// https://discord.com/channels/1139291093310132376/1139291094069301385/1319669598148231263
import { BACKED_BY_TOKENS } from "@/app/constants";
import { Field as FormikField, useFormikContext } from "formik";
import { RevnetFormData } from "../types";

export function BackedBySelect({ disabled = false }: { disabled?: boolean }) {
  const { values } = useFormikContext<RevnetFormData>();
  const revnetTokenSymbolCapitalized =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "Tokens";

  return (
    <>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">3. Backed by</h2>
        <p className="text-zinc-600 text-lg">
          {revnetTokenSymbolCapitalized} are backed by the tokens you choose to allow in your
          revnet.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          If your revnet is paid in any other token, they will first be swapped into the tokens that
          you choose, before being used to back your revnet.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          Cash outs and loans are fulfilled from the chosen tokens.
        </p>
      </div>
      <div className="flex flex-row gap-8">
        {BACKED_BY_TOKENS.map((token) => (
          <div key={token} className="flex items-center gap-2">
            <FormikField
              type="checkbox"
              name="backedBy"
              value={token}
              disabled={disabled}
              className="disabled:opacity-50"
            />
            <span>{token}</span>
          </div>
        ))}
      </div>
    </>
  );
}
