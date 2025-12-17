import { formatDecimals } from "@/lib/number";
import { TimeRange } from "@/lib/timeRange";
import { format } from "date-fns";
import { JB_TOKEN_DECIMALS } from "juice-sdk-core";
import { formatUnits } from "viem";

const DATAKEY_LABELS: Record<string, string> = {
  issuancePrice: "Issuance",
  ammPrice: "Pool",
  floorPrice: "Floor",
};

interface Props {
  active?: boolean;
  payload?: readonly {
    dataKey?: string;
    value?: number;
    color?: string;
    payload?: {
      timestamp?: number;
      totalSupply?: string;
      totalBalance?: string;
      cashOutTaxRate?: number;
    };
  }[];
  baseTokenSymbol: string;
  baseTokenDecimals: number;
  range: TimeRange;
}

export function PriceChartTooltip({
  active,
  payload,
  baseTokenSymbol,
  baseTokenDecimals,
  range,
}: Props) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data?.timestamp) return null;

  const hasFloorPrice = payload.some((entry) => entry.dataKey === "floorPrice");
  const showFloorDebug = hasFloorPrice && data.totalSupply && data.totalBalance;

  const dateFormat = range === "1d" ? "MMM d, yyyy HH:mm" : "MMM d, yyyy";

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-3 text-sm">
      <div className="font-medium mb-2 text-zinc-300">
        {format(new Date(data.timestamp * 1000), dateFormat)}
      </div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-400">
            {DATAKEY_LABELS[entry.dataKey ?? ""] ?? entry.dataKey}:
          </span>
          <span className="font-mono text-white">
            {formatDecimals(entry.value ?? 0, 6)} {baseTokenSymbol}
          </span>
        </div>
      ))}
      {showFloorDebug && (
        <div className="mt-2 pt-2 border-t border-zinc-700 text-xs text-zinc-500 space-y-1">
          <div className="flex justify-between gap-4">
            <span>Total Supply:</span>
            <span className="font-mono">
              {formatCompact(formatUnits(BigInt(data.totalSupply!), JB_TOKEN_DECIMALS))}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Total Balance:</span>
            <span className="font-mono">
              {formatCompact(formatUnits(BigInt(data.totalBalance!), baseTokenDecimals))}{" "}
              {baseTokenSymbol}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Cash Out Tax:</span>
            <span className="font-mono">{((data.cashOutTaxRate ?? 0) / 100).toFixed(2)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCompact(value: string): string {
  const num = parseFloat(value);
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(2) + "K";
  return num.toFixed(2);
}
