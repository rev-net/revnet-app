import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Field as FormikField, useFormikContext } from "formik";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { RelayrPostBundleResponse, useGetRelayrTxQuote } from "juice-sdk-react";
import { useState } from "react";
import {
  mainnet,
  optimism,
  base,
  arbitrum,
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  sepolia,
} from "viem/chains";
import { PayAndDeploy } from "../buttons/PayAndDeploy";
import { QuoteButton } from "../buttons/QuoteButton";
import { RevnetFormData } from "../types";
import { ChainAutoIssuance } from "./ChainAutoIssuance";
import { ChainOperator } from "./ChainOperator";
import { ChainSplits } from "./ChainSplits";
import { Divider } from "./Divider";

const TESTNETS: JBChainId[] = [
  sepolia.id,
  arbitrumSepolia.id,
  optimismSepolia.id,
  baseSepolia.id,
];

const MAINNETS: JBChainId[] = [
  mainnet.id,
  optimism.id,
  base.id,
  arbitrum.id,
];

export function ChainSelect({
  disabled = false,
  validBundle = false,
  relayrResponse,
  isLoading = false,
}: {
  disabled?: boolean;
  validBundle?: boolean;
  relayrResponse?: RelayrPostBundleResponse;
  isLoading?: boolean;
}) {
  const [environment, setEnvironment] = useState("production");
  const { values, setFieldValue, submitForm } =
    useFormikContext<RevnetFormData>();

  const getRelayrTxQuote = useGetRelayrTxQuote();

  const handleChainSelect = (chainId: JBChainId, checked: boolean) => {
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
        <h2 className="font-bold text-lg mb-2">4. Deploy</h2>
        <p className="text-zinc-600 text-lg">
          Pick which chains your revnet will accept money on and issue{" "}
          {revnetTokenSymbol} from.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          Holders of {revnetTokenSymbol} can cash out on any of the selected
          chains, and can move their {revnetTokenSymbol} between chains at any
          time.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          The Operator you set in your revnet's terms will also be able to add
          new chains to the revnet later.
        </p>
      </div>
      <div className="md:col-span-2">
        <div className="flex flex-col gap-4">
          <div className="text-left text-black-500 font-semibold">
            Choose your chains
          </div>
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
          <div className="flex flex-wrap gap-6 mt-4">
            {environment === "production" ? (
              <>
                {Object.values(JB_CHAINS)
                  .filter(({ chain }) =>
                    MAINNETS.includes(chain.id as JBChainId)
                  )
                  .map(({ chain, name }) => (
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
                          handleChainSelect(
                            chain.id as JBChainId,
                            e.target.checked
                          );
                        }}
                      />
                      {name}
                    </label>
                  ))}
              </>
            ) : (
              <>
                {Object.values(JB_CHAINS)
                  .filter(({ chain }) =>
                    TESTNETS.includes(chain.id as JBChainId)
                  )
                  .map(({ chain, name }) => (
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
                          handleChainSelect(
                            chain.id as JBChainId,
                            e.target.checked
                          );
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
          {((values.chainIds.length > 0 &&
            !values.stages[0]?.initialOperator) ||
            values.chainIds.length > 1) && (
            <>
              <ChainOperator disabled={validBundle} />
              <Divider />
            </>
          )}
          {values.chainIds.length > 1 &&
            values.stages.some((stage) => stage.splits.length > 0) && (
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
            isLoading={isLoading}
            validBundle={validBundle}
            onSubmit={submitForm}
          />
          {relayrResponse && (
            <div className="flex flex-col items-start">
              <div className="text-xs italic mt-2">
                Quote valid until{" "}
                {format(
                  relayrResponse.payment_info[0].payment_deadline,
                  "h:mm:ss aaa"
                )}
                .
                <Button
                  variant="link"
                  size="sm"
                  className="italic text-xs px-1"
                  disabled={isLoading}
                  onClick={() => getRelayrTxQuote.reset()}
                >
                  clear quote
                </Button>
              </div>
              <div className="mt-4">
                <PayAndDeploy
                  relayrResponse={relayrResponse}
                  revnetTokenSymbol={revnetTokenSymbol}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
