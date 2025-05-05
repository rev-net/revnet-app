import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { NativeTokenValue } from "@/components/NativeTokenValue";
import {
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
} from "juice-sdk-core";

/* const CustomTick = ({ x, y, payload }: any) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={4} textAnchor="end" fill="#666">
      <tspan>
        <NativeTokenValue
          wei={payload?.payload?.totalCostWei ?? 0n}
          decimals={NATIVE_TOKEN_DECIMALS}
        />
      </tspan>
    </text>
  </g>
); */

export function LoanValueChart({
  prepaidMonths,
  borrowableAmount,
}: {
  prepaidMonths: number;
  borrowableAmount: number;
}) {
  const MAX_YEARS = 10;
  const prepaidPercent = Math.min((prepaidMonths / 120) * 50, 50);
  const prepaidDuration = (prepaidPercent / 50) * MAX_YEARS;
  const prepaidAmount = borrowableAmount * (prepaidPercent / 100);
  const unprepaidAmount = (borrowableAmount - prepaidAmount);

  const loanCosts = Array.from({ length: MAX_YEARS * 12 + 1 }, (_, i) => {
    const month = i;
    const year = month / 12;
    let totalCost: number;

    if (year < prepaidDuration) {
      totalCost = borrowableAmount;
    } else if (year < MAX_YEARS) {
      const timeAfterPrepaid = year - prepaidDuration;
      const remainingTime = MAX_YEARS - prepaidDuration;
      const feeRate = timeAfterPrepaid / remainingTime;
      const fullSourceFeeAmount = unprepaidAmount * feeRate;
      const amountInFull = borrowableAmount + fullSourceFeeAmount;
      const additionalFee = (fullSourceFeeAmount * borrowableAmount) / amountInFull;
      totalCost = borrowableAmount + additionalFee;
    } else {
      totalCost = borrowableAmount + unprepaidAmount;
    }

    return {
      month,
      year,
      totalCost: isFinite(totalCost) ? totalCost : 0,
      totalCostWei: isFinite(totalCost) ? BigInt(Math.floor(totalCost * 1e18)) : 0n,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={loanCosts}
        margin={{ top: 5, right: 5, bottom: 5, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          label={{ value: "Loan Duration (Years)", position: "insideBottom", offset: -5 }}
          type="number"
          domain={[0, 120]}
          ticks={[0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120]}
          tickFormatter={(value) => `${(value / 12).toFixed(0)}`}
        />
        <YAxis
          domain={[0, borrowableAmount * 1.5]}
          label={{ value: "Cost", angle: -90, position: "insideLeft", offset: -5 }}
          tick={false}
        />
        <Tooltip
          labelFormatter={(value) => `Month ${value}`}
          formatter={(value: unknown) => {
            const borrowable = borrowableAmount;
            const totalCost = typeof value === "number" ? value : 0;
            const addedCost = totalCost - borrowable;

            return [`${(addedCost / 1e18).toFixed(5)} ETH`, "Total Added Cost"];
          }}
        />
        <Line
          type="monotone"
          dataKey="totalCost"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
