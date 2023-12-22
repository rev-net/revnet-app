import React, { PropsWithChildren, createContext, useContext } from "react";
import { Address } from "viem";
import { AsyncData, AsyncDataNone } from "../types";
import {
  useJbControllerFundAccessLimits,
  useJbDirectoryControllerOf,
  useJbDirectoryPrimaryTerminalOf,
  useJbMultiTerminalStore,
} from "@/lib/juicebox/hooks/contract";
import { NATIVE_TOKEN } from "@/lib/juicebox/constants";

/**
 * Context for project-specific contracts.
 */
export type JBContractContextData = {
  projectId: bigint;
  contracts: {
    primaryNativeTerminal: AsyncData<Address>;
    primaryNativeTerminalStore: AsyncData<Address>;
    controller: AsyncData<Address>;
    fundAccessLimits: AsyncData<Address>;
  };
};

/**
 * Context for project-specific contracts.
 */
export const JBContractContext = createContext<JBContractContextData>({
  /**
   * The project id of the Juicebox project.
   *
   * @default 0n
   */
  projectId: 0n,

  /**
   * The addresses of the contracts for the project.
   */
  contracts: {
    primaryNativeTerminal: AsyncDataNone,
    primaryNativeTerminalStore: AsyncDataNone,
    controller: AsyncDataNone,
    fundAccessLimits: AsyncDataNone,
  },
});

export function useJBContractContext() {
  return useContext(JBContractContext);
}

// contracts that are different across JB projects.
export enum DynamicContract {
  "Controller",
  "PrimaryNativePaymentTerminal",
  "PrimaryNativePaymentTerminalStore",
  "FundAccessLimits",
}

export type JBContractProviderProps = PropsWithChildren<{
  projectId: bigint;
  include?: DynamicContract[];
}>;

/**
 * Load project-specific contract addresses for a given JB project.
 *
 * If `include` arg not specified, all contracts are loaded
 */
export const JBContractProvider = ({
  projectId,
  include,
  children,
}: JBContractProviderProps) => {
  const enabled = (selector: DynamicContract[]) => {
    return (
      typeof include === "undefined" ||
      include.some((c) => selector.includes(c))
    );
  };

  const primaryNativeTerminal = useJbDirectoryPrimaryTerminalOf({
    args: enabled([DynamicContract.PrimaryNativePaymentTerminal])
      ? [projectId, NATIVE_TOKEN]
      : undefined,
  });
  const primaryNativeTerminalStore = useJbMultiTerminalStore({
    address: primaryNativeTerminal.data,
    enabled: enabled([
      DynamicContract.PrimaryNativePaymentTerminal,
      DynamicContract.PrimaryNativePaymentTerminalStore,
    ]),
  });
  const controller = useJbDirectoryControllerOf({
    args: [projectId],
    enabled: enabled([DynamicContract.Controller]),
  });

  const fundAccessLimits = useJbControllerFundAccessLimits({
    address: controller.data,
    enabled: enabled([
      DynamicContract.Controller,
      DynamicContract.FundAccessLimits,
    ]),
  });

  return (
    <JBContractContext.Provider
      value={{
        projectId,

        contracts: {
          controller,
          fundAccessLimits,
          primaryNativeTerminal,
          primaryNativeTerminalStore,
        },
      }}
    >
      {children}
    </JBContractContext.Provider>
  );
};
