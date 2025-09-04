import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Field as FormikField } from "formik";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { useEffect, useState } from "react";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
} from "viem/chains";
import { QuoteButton } from "../buttons/QuoteButton";
import { formatFormErrors } from "../helpers/formatFormErrors";
import { ChainAutoIssuance } from "./ChainAutoIssuance";
import { ChainOperator } from "./ChainOperator";
import { ChainSplits } from "./ChainSplits";
import { Divider } from "./Divider";
import { useCreateForm } from "./useCreateForm";

const TESTNETS: JBChainId[] = [sepolia.id, arbitrumSepolia.id, optimismSepolia.id, baseSepolia.id];

const MAINNETS: JBChainId[] = [mainnet.id, optimism.id, base.id, arbitrum.id];

export function ChainSelect({
  disabled = false,
  validBundle = false,
}: {
  disabled?: boolean;
  validBundle?: boolean;
}) {
  const [environment, setEnvironment] = useState("production");

  const { revnetTokenSymbol, values, setFieldValue, submitForm, isSubmitting, isValid, errors } =
    useCreateForm();

  const handleChainSelect = (chainId: JBChainId, checked: boolean) => {
    setFieldValue(
      "chainIds",
      checked ? [...values.chainIds, chainId] : values.chainIds.filter((id) => id !== chainId),
    );

    // If removed, delete also operator for that chain
    if (!checked) {
      setFieldValue(
        "operator",
        values.operator.filter((o) => Number(o.chainId) !== chainId),
      );
    }
  };

  // If only one chain is selected, set the chainId for auto issuance to the selected chain
  useEffect(() => {
    if (values.chainIds.length > 1) return;

    const chainId = values.chainIds[0];
    if (!chainId) return;

    const stagesWithAutoIssuance = values.stages.filter((s) => s.autoIssuance.length > 0);

    if (stagesWithAutoIssuance.length === 0) return;

    stagesWithAutoIssuance.forEach((stage, stageIndex) => {
      stage.autoIssuance.forEach((issuance, index) => {
        if (issuance.chainId !== chainId) {
          console.debug(
            `Changing chainId for auto issuance (${stageIndex + 1}.${index + 1}) to ${chainId}`,
          );

          setFieldValue(`stages.${stageIndex}.autoIssuance.${index}.chainId`, chainId);
        }
      });
    });
  }, [values.chainIds, values.stages, setFieldValue]);

  return (
    <>
      <div className="md:col-span-1">
        <h2 className="mb-2 text-lg font-bold">4. Deploy</h2>
        <p className="text-lg text-zinc-600">
          Pick which chains your revnet will accept money on and issue {revnetTokenSymbol} from.
        </p>
        <p className="mt-2 text-lg text-zinc-600">
          Holders of {revnetTokenSymbol} can cash out on any of the selected chains, and can move
          their {revnetTokenSymbol} between chains at any time.
        </p>
        <p className="mt-2 text-lg text-zinc-600">
          The Operator you set in your revnet's terms will also be able to add new chains to the
          revnet later.
        </p>
      </div>
      <div className="md:col-span-2">
        <div className="flex flex-col gap-4">
          <div className="text-black-500 text-left font-semibold">Choose your chains</div>
          <div className="max-w-56">
            <Select
              onValueChange={(v) => {
                setEnvironment(v);
              }}
              defaultValue="production"
              disabled={disabled}
            >
              <SelectTrigger className="col-span-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production" key="production">
                  Production
                </SelectItem>
                <SelectItem value="testing" key="testing">
                  Testnets
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            {environment === "production" ? (
              <>
                {Object.values(JB_CHAINS)
                  .filter(({ chain }) => MAINNETS.includes(chain.id as JBChainId))
                  .map(({ chain, name }) => (
                    <label key={chain.id} className="flex items-center gap-2">
                      <FormikField
                        type="checkbox"
                        name="chainIds"
                        value={chain.id}
                        disabled={disabled}
                        className="disabled:opacity-50"
                        checked={values.chainIds.includes(Number(chain.id) as JBChainId)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChainSelect(chain.id as JBChainId, e.target.checked);
                        }}
                      />
                      {name}
                    </label>
                  ))}
              </>
            ) : (
              <>
                {Object.values(JB_CHAINS)
                  .filter(({ chain }) => TESTNETS.includes(chain.id as JBChainId))
                  .map(({ chain, name }) => (
                    <label key={chain.id} className="flex items-center gap-2">
                      <FormikField
                        type="checkbox"
                        name="chainIds"
                        value={chain.id}
                        disabled={disabled}
                        className="disabled:opacity-50"
                        checked={values.chainIds.includes(Number(chain.id) as JBChainId)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChainSelect(chain.id as JBChainId, e.target.checked);
                        }}
                      />
                      {name}
                    </label>
                  ))}
              </>
            )}
          </div>
        </div>
        {/* Quote and Depoly */}
        <div className="mt-10">
          {((values.chainIds.length > 0 && !values.stages[0]?.initialOperator) ||
            values.chainIds.length > 1) && (
            <>
              <ChainOperator disabled={validBundle} />
              <Divider />
            </>
          )}
          {values.chainIds.length > 1 && values.stages.some((stage) => stage.splits.length > 0) && (
            <>
              <ChainSplits disabled={validBundle} />
              <Divider />
            </>
          )}
          {values.chainIds.length > 1 &&
            values.stages.some((stage) => stage.autoIssuance.length > 0) && (
              <>
                <ChainAutoIssuance disabled={validBundle} />
                <Divider />
              </>
            )}
          <QuoteButton
            isLoading={isSubmitting}
            validBundle={validBundle}
            disabled={disabled}
            onSubmit={() => {
              submitForm();

              if (!isValid) {
                toast({
                  variant: "destructive",
                  title: "Please fix the errors and try again.",
                  description: formatFormErrors(errors),
                });
                console.debug(errors);
              }
            }}
          />
          <div className="text-sm text-red-500 mt-1.5">Coming soon!</div>
        </div>
      </div>
    </>
  );
}
