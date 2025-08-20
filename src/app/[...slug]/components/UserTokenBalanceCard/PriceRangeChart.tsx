import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ReferenceLine,
} from "recharts";

interface PriceRangeChartProps {
  minPrice: number;
  maxPrice: number;
  marketPrice: number;
  tokenSymbol: string;
}

export function PriceRangeChart({
  minPrice,
  maxPrice,
  marketPrice,
  tokenSymbol,
}: PriceRangeChartProps) {
  // Create minimal data for the chart (no X-axis labels needed)
  const data = [
    { price: minPrice },
    { price: marketPrice },
    { price: maxPrice },
  ];

  // Calculate chart domain with some padding
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1; // 10% padding
  const yDomain = [Math.max(0, minPrice - padding), maxPrice + padding];

  return (
    <div className="flex items-start gap-3 mt-2">
      {/* Legend - Left side */}
      <div className="flex flex-col gap-2 text-xs mt-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-gray-400"></div>
          <span className="text-gray-600">Price Range</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-gray-700"></div>
          <span className="text-gray-600">Market Price</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 h-32 min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              dataKey="label"
              type="category"
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={yDomain}
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "minPrice") return [`$${minPrice.toFixed(6)} per ${tokenSymbol}`, "Min Price"];
                if (name === "maxPrice") return [`$${maxPrice.toFixed(6)} per ${tokenSymbol}`, "Max Price"];
                if (name === "marketPrice") return [`$${marketPrice.toFixed(6)} per ${tokenSymbol}`, "Market Price"];
                return [`$${value.toFixed(6)} per ${tokenSymbol}`, "Price"];
              }}
              labelFormatter={() => "Price Range"}
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  // Create array of prices and sort by value (highest to lowest)
                  const prices = [
                    { label: "Min", value: minPrice, color: "text-gray-500" },
                    { label: "Market", value: marketPrice, color: "text-gray-700" },
                    { label: "Max", value: maxPrice, color: "text-gray-500" }
                  ].sort((a, b) => b.value - a.value);

                  return (
                    <div className="bg-white p-2 border rounded shadow-lg text-xs">
                      <div className="font-medium mb-1">Price Range</div>
                      <div className="space-y-1">
                        {prices.map((price, index) => (
                          <div key={index} className="flex justify-between">
                            <span className={price.color}>{price.label}:</span>
                            <span>${price.value.toFixed(6)} per {tokenSymbol}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Min Price Line */}
            <ReferenceLine
              y={minPrice}
              stroke="#9ca3af"
              strokeDasharray="3 3"
              strokeWidth={2}
              name="minPrice"
              label={{
                value: `Min: $${minPrice.toFixed(6)}`,
                position: "insideBottomRight",
                fontSize: 10,
                fill: "#6b7280"
              }}
            />
            
            {/* Max Price Line */}
            <ReferenceLine
              y={maxPrice}
              stroke="#9ca3af"
              strokeDasharray="3 3"
              strokeWidth={2}
              name="maxPrice"
              label={{
                value: `Max: $${maxPrice.toFixed(6)}`,
                position: "insideTopRight",
                fontSize: 10,
                fill: "#6b7280"
              }}
            />
            
            {/* Market Price Line */}
            <ReferenceLine
              y={marketPrice}
              stroke="#374151"
              strokeWidth={3}
              name="marketPrice"
              label={{
                value: `Market: $${marketPrice.toFixed(6)}`,
                position: "insideTop",
                fontSize: 10,
                fill: "#374151"
              }}
            />
            
            {/* Price Range Area */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="transparent"
              fill="rgba(156, 163, 175, 0.1)"
              strokeWidth={0}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
