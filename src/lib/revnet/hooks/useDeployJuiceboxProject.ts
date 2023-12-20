import { NATIVE_TOKEN } from "@/lib/juicebox/constants";
import { useJbControllerLaunchProjectFor } from "@/lib/juicebox/hooks/contract";
import { zeroAddress } from "viem";

export function useDeployJuiceboxProject() {
  const x = useJbControllerLaunchProjectFor({
    args: [
      "0x0028C35095D34C9C8a3bc84cB8542cB182fcfa8e",
      "Qme7UdAovaq9N9SMtMKoTcAHazD7igPknVXojAQc244Jvi",
      [
        {
          mustStartAtOrAfter: 1n,
          duration: 60n * 60n * 24n, // 1 day
          weight: 69_000_000n,
          decayRate: 100n,
          approvalHook: zeroAddress,
          metadata: {
            reservedRate: 6_900n,
            redemptionRate: 4_200n,
            baseCurrency: BigInt(NATIVE_TOKEN),
            pausePay: false,
            pauseCreditTransfers: false,
            allowOwnerMinting: false,
            allowTerminalMigration: false,
            allowSetTerminals: false,
            allowControllerMigration: false,
            allowSetController: false,
            holdFees: false,
            useTotalSurplusForRedemptions: false,
            useDataHookForPay: false,
            useDataHookForRedeem: false,
            dataHook: zeroAddress,
            metadata: 0n,
          },
          splitGroups: [],
          fundAccessLimitGroups: [],
        },
      ],
      [
        {
          terminal: "0x4319cb152D46Db72857AfE368B19A4483c0Bff0D",
          tokensToAccept: [NATIVE_TOKEN],
        },
      ],
      "hi",
    ],
  });

  return x;
}
