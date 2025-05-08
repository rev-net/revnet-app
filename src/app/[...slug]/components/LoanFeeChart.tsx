import {
    ResponsiveContainer,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Line,
  } from "recharts";

  export function LoanFeeChart({
    prepaidPercent,
    setPrepaidPercent,
    feeData,
    ethToWallet,
    grossBorrowedEth,
    collateralAmount,
    tokenSymbol,
    displayYears,
    displayMonths,
  }: {
    prepaidPercent: string;
    setPrepaidPercent: (v: string) => void;
    feeData: { year: number; totalCost: number }[];
    ethToWallet: number;
    grossBorrowedEth: number;
    collateralAmount: string;
    tokenSymbol: string;
    displayYears: number;
    displayMonths: number;
  }) {
    return (
      <div className="mt-2">
        <div className="mt-2 mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Prepaid Fee: {prepaidPercent}%
          </label>
          <input
            type="range"
            min="2.5"
            max="50"
            step="2.5"
            value={prepaidPercent}
            onChange={(e) => setPrepaidPercent(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Less upfront cost</span>
            <span>More upfront cost</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={feeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                label={{ value: "Time (years)", position: "insideBottom", offset: -5 }}
                type="number"
                domain={[0, 10]}
                ticks={[...Array(11).keys()]}
                tickFormatter={(year) => `${year}`}
              />
              <YAxis
                label={{
                  value: "Total Repayment (ETH)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 0,
                  style: { textAnchor: "middle" }
                }}
                domain={[0, (dataMax: number) => dataMax * 1.4]}
                tick={false}
              />
              <Tooltip
                formatter={(value: number, name: string, props) => {
                  const repayAmount = (grossBorrowedEth || 0) + value;
                  console.log("Tooltip chart point:", {
                    year: props?.payload?.year,
                    repayAmount,
                    borrowed: grossBorrowedEth
                  });
                  return [
                    `${collateralAmount} ${tokenSymbol}`,
                    `Pay ${repayAmount.toFixed(6)} ETH to reclaim: `,
                  ];
                }}
                labelFormatter={(label: number) => {
                  const months = Math.round(label * 12);
                  const years = Math.floor(months / 12);
                  const remMonths = months % 12;
                  return `${months} months (${years}y ${remMonths}m)`;
                }}
              />
              <Line
                type="monotone"
                dataKey="totalCost"
                stroke="#71717a"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 mt-3 text-center">
          Fees increase after{" "}
          {displayYears > 0
            ? `${displayYears} year${displayYears > 1 ? "s" : ""}${displayMonths > 0 ? ` and ${displayMonths} month${displayMonths > 1 ? "s" : ""}` : ""}`
            : `${displayMonths} month${displayMonths > 1 ? "s" : ""}`}
        </p>
      </div>
    );
  }