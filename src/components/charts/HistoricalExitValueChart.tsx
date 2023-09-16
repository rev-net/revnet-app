import {
  OrderDirection,
  PayEvent_OrderBy,
  usePayEventsQuery,
} from "@/generated/graphql";
import { formatEther, getTokenRedemptionQuoteEth } from "@/lib/juicebox/utils";
import { Line, LineChart, XAxis, YAxis } from "recharts";
import { parseEther } from "viem";

/**
 * NOTE assumes reserved rate is constant. Applicable to revnets, not jb projects in general.
 */

export function HistoricalExitValueChart({
  projectId,
  reservedRate,
  redemptionRate,
}: {
  projectId: bigint;
  reservedRate: bigint;
  redemptionRate: bigint;
}) {
  const { data: payEvents } = usePayEventsQuery({
    variables: {
      where: {
        projectId: Number(projectId),
      },
      orderBy: PayEvent_OrderBy.id,
      orderDirection: OrderDirection.desc,
    },
  });

  type Datapoint = {
    totalSupply: bigint;
    totalEth: bigint;
    id: bigint;
  };
  console.log({ payEvents });

  const historicalTokenSupply = [...(payEvents?.payEvents ?? [])]
    ?.reverse()
    .reduce((acc: Datapoint[], payEvent, idx) => {
      const beneficiaryTokenCount = BigInt(payEvent.beneficiaryTokenCount);
      const boostTokenCount = 0n;
      const totalNewTokenCount = beneficiaryTokenCount + boostTokenCount;

      const totalNewEth = BigInt(payEvent.amount);

      const cum = {
        totalSupply:
          acc.length > 0
            ? acc[idx - 1].totalSupply + totalNewTokenCount
            : totalNewTokenCount,
        totalEth:
          acc.length > 0 ? acc[idx - 1].totalEth + totalNewEth : totalNewEth,
        id: BigInt(payEvent.id),
      };

      return [...acc, cum];
    }, []);

  const historicalTokenExitValue = historicalTokenSupply?.map(
    ({ totalSupply, totalEth, id }) => {
      const quote = getTokenRedemptionQuoteEth(parseEther("1"), {
        totalSupply,
        overflowWei: totalEth,
        redemptionRate,
        tokensReserved: 0n, // TODO update
      });

      console.log({ totalEth, totalSupply, quote, id });

      return { exitValue: parseFloat(formatEther(quote)), id };
    }
  );

  return (
    <div>
      <LineChart width={800} height={200} data={historicalTokenExitValue}>
        <Line
          type="monotone"
          dataKey="exitValue"
          stroke="#16a34a"
          strokeWidth={2}
        />
        <XAxis dataKey="id" />
        <YAxis dataKey="exitValue" />
      </LineChart>
    </div>
  );
}
