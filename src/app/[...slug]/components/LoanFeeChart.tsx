import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";

export function LoanFeeChart({
  prepaidPercent,
  setPrepaidPercent,
  feeData,
  nativeToWallet,
  grossBorrowedNative,
  collateralAmount,
  tokenSymbol,
  displayYears,
  displayMonths,
}: {
  prepaidPercent: string;
  setPrepaidPercent: (v: string) => void;
  feeData: { year: number; totalCost: number }[];
  nativeToWallet: number;
  grossBorrowedNative: number;
  collateralAmount: string;
  tokenSymbol: string;
  displayYears: number;
  displayMonths: number;
}) {
  const nativeTokenSymbol = useNativeTokenSymbol();
  
  // Ensure feeData is valid and has reasonable values
  const validFeeData = feeData?.filter(item => 
    item && 
    typeof item.year === 'number' && 
    typeof item.totalCost === 'number' &&
    item.totalCost >= 0 &&
    item.totalCost < Number.MAX_SAFE_INTEGER
  ) || [];

  // Calculate max cost from original feeData to ensure proper domain
  const maxCost = feeData?.length > 0 ? Math.max(...feeData.map(d => d.totalCost || 0)) : 0;
  const minCost = grossBorrowedNative + (grossBorrowedNative * 0.035); // borrowed amount + fixed fee

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
      <div className="h-64 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={validFeeData}>
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
                value: "Additional cost to unlock",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                style: { textAnchor: "middle" }
              }}
              domain={[minCost, maxCost * 1.1]}
              tick={false}
            />
            <Tooltip
              formatter={(value: number, _name: string, props) => {
                if (props?.payload?.year >= 9.99) {
                  return [
                    "—",
                    "No collateral can be reclaimed at this time",
                  ];
                }
                
                // value is the totalCost (fees) at this point in time
                // This represents how much native token you need to pay to unlock your collateral
                const costToUnlock = value;
                
                return [
                  `${collateralAmount} ${tokenSymbol}`,
                  `Total paid to unlock: ${costToUnlock.toFixed(6)} ${nativeTokenSymbol}`,
                ];
              }}
              labelFormatter={(label: number) => {
                if (label >= 9.99) {
                  return "Final period – no collateral will be returned";
                }
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