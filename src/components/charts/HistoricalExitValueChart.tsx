import {
  OrderDirection,
  PayEvent_OrderBy,
  usePayEventsQuery,
} from "@/generated/graphql";
import { formatEther, getTokenCashOutQuoteEth } from "juice-sdk-core";
import { Line, LineChart, XAxis, YAxis } from "recharts";
import { parseEther } from "viem";

/**
 * NOTE assumes reserved rate is constant. Applicable to revnets, not jb projects in general.
 */

export function LoanValueChart({
  projectId,
  reservedPercent,
  cashOutTaxRate,
}: {
  projectId: bigint;
  reservedPercent: bigint;
  cashOutTaxRate: bigint;
}) {
  const principal = parseEther("1"); // 1 ETH loan
  const totalSupply = parseEther("1000"); // example token supply
  const overflowWei = parseEther("1000"); // example overflow
  const tokensReserved = 0n;

  // Simulate cost of loan over durations 0 to 10 years
  const loanCosts = Array.from({ length: 11 }, (_, year) => {
    const quote = getTokenCashOutQuoteEth(principal, {
      totalSupply,
      overflowWei,
      cashOutTaxRate,
      tokensReserved,
    });

    // Example fee scaling linearly with years, modify if needed
    const prepaidFeePercent = 5n * BigInt(year);
    const fee = (principal * prepaidFeePercent) / 100n;
    const totalCost = principal + fee;

    return {
      year,
      cost: parseFloat(formatEther(totalCost)),
    };
  });

  return (
    <div>
      <LineChart width={800} height={200} data={loanCosts}>
        <Line
          type="monotone"
          dataKey="cost"
          stroke="#16a34a"
          strokeWidth={2}
        />
        <XAxis dataKey="year" label={{ value: "Loan Duration (Years)", position: "insideBottom", offset: -5 }} />
        <YAxis dataKey="cost" label={{ value: "Loan Cost (ETH)", angle: -90, position: "insideLeft" }} />
      </LineChart>
    </div>
  );
}
