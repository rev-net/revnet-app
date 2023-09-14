import { ETHER_ADDRESS } from "@/lib/juicebox/constants";
import { JBFundingCycle, JBFundingCycleMetadata } from "@/types/juicebox";
import {
  useJbControllerCurrentFundingCycleOf,
  useJbDirectoryControllerOf,
  useJbDirectoryPrimaryTerminalOf,
  useJbethPaymentTerminalStore,
} from "juice-hooks";
import { PropsWithChildren, createContext, useContext } from "react";
import {
  DiscountRate,
  Ether,
  RedemptionRate,
  ReservedRate,
} from "fpnum/lib/jb";
import { Address } from "viem";

export type AsyncData<T> =
  | {
      isLoading: boolean;
      data?: T;
    }
  | undefined;

type JBProjectContextData = {
  projectId: bigint;

  primaryTerminalEth: AsyncData<Address>;
  primaryTerminalEthStore: AsyncData<Address>;

  fundingCycle: AsyncData<JBFundingCycle>;
  fundingCycleMetadata: AsyncData<JBFundingCycleMetadata>;
};

const JBProjectContext = createContext<JBProjectContextData>({
  projectId: 0n,

  primaryTerminalEth: undefined,
  primaryTerminalEthStore: undefined,

  fundingCycle: undefined,
  fundingCycleMetadata: undefined,
});

export function useJBProjectContext() {
  return useContext(JBProjectContext);
}

export const JBProjectProvider = ({
  projectId,
  children,
}: PropsWithChildren<{
  projectId: bigint;
}>) => {
  const primaryTerminalEth = useJbDirectoryPrimaryTerminalOf({
    args: [projectId, ETHER_ADDRESS],
  });
  const primaryTerminalEthStore = useJbethPaymentTerminalStore({
    address: primaryTerminalEth.data,
  });
  const controller = useJbDirectoryControllerOf({
    args: [projectId],
  });

  const { data: fundingCycleRes, isLoading: fundingCycleLoading } =
    useJbControllerCurrentFundingCycleOf({
      address: controller.data,
      args: [projectId],
      select: ([fundingCycleData, fundingCycleMetadata]) => {
        return [
          {
            ...fundingCycleData,
            discountRate: new DiscountRate(fundingCycleData.discountRate),
            weight: new Ether(fundingCycleData.weight),
          },
          {
            ...fundingCycleMetadata,
            redemptionRate: new RedemptionRate(
              fundingCycleMetadata.redemptionRate
            ),
            ballotRedemptionRate: new RedemptionRate(
              fundingCycleMetadata.ballotRedemptionRate
            ),
            reservedRate: new ReservedRate(fundingCycleMetadata.reservedRate),
          },
        ];
      },
    });

  const [fundingCycle, fundingCycleMetadata] = fundingCycleRes ?? [];

  return (
    <JBProjectContext.Provider
      value={{
        projectId,

        primaryTerminalEth,
        primaryTerminalEthStore,

        fundingCycle: {
          isLoading: fundingCycleLoading,
          data: fundingCycle,
        },
        fundingCycleMetadata: {
          isLoading: fundingCycleLoading,
          data: fundingCycleMetadata,
        },
      }}
    >
      {children}
    </JBProjectContext.Provider>
  );
};
