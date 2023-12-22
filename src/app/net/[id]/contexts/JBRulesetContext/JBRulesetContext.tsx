import { useJbControllerCurrentRulesetOf } from "@/lib/juicebox/hooks/contract";
import { RedemptionRate, ReservedRate } from "juice-sdk-core";
import { PropsWithChildren, createContext, useContext } from "react";
import { useJBContractContext } from "../JBContractContext/JBContractContext";
import { DecayRate, RulesetWeight } from "../datatypes";
import { AsyncData, AsyncDataNone } from "../types";

/**
 * Context for the current ruleset of a project.
 */
export type JBRulesetContext = {
  /**
   * The current ruleset of the project.
   */
  ruleset: AsyncData<any>; // TODO
  /**
   * The metadata for the current ruleset of the project.
   */
  rulesetMetadata: AsyncData<any>; // TODO
};

/**
 * Context for the project's current ruleset.
 */
export const JBRulesetContext = createContext<JBRulesetContext>({
  ruleset: AsyncDataNone,
  rulesetMetadata: AsyncDataNone,
});

export function useJBRulesetContext() {
  return useContext(JBRulesetContext);
}

export function useJBRuleset() {
  const { ruleset } = useJBRulesetContext();

  return ruleset;
}

export function useJBRulesetMetadata() {
  const { rulesetMetadata } = useJBRulesetContext();

  return rulesetMetadata;
}

type JBRulesetProviderProps = PropsWithChildren<{
  projectId: bigint;
}>;

/**
 * Provides the current ruleset for a project.
 *
 * @note depends on JBContractContext
 */
export const JBRulesetProvider = ({
  projectId,
  children,
}: JBRulesetProviderProps) => {
  const { contracts } = useJBContractContext();

  const { data: ruleset, isLoading } = useJbControllerCurrentRulesetOf({
    address: contracts?.controller?.data,
    args: [projectId],
    select([ruleset, rulesetMetadata]) {
      return {
        data: {
          ...ruleset,
          weight: new RulesetWeight(ruleset.weight),
          decayRate: new DecayRate(ruleset.decayRate),
        },
        metadata: {
          ...rulesetMetadata,
          redemptionRate: new RedemptionRate(rulesetMetadata.redemptionRate),
          reservedRate: new ReservedRate(rulesetMetadata.reservedRate),
        },
      };
    },
  });

  return (
    <JBRulesetContext.Provider
      value={{
        ruleset: {
          data: ruleset?.data,
          isLoading,
        },
        rulesetMetadata: {
          data: ruleset?.metadata,
          isLoading,
        },
      }}
    >
      {children}
    </JBRulesetContext.Provider>
  );
};
