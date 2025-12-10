import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";

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
    payload?: { timestamp?: number };
  }[];
  baseTokenSymbol: string;
}

export function PriceChartTooltip({ active, payload, baseTokenSymbol }: Props) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data?.timestamp) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-3 text-sm">
      <div className="font-medium mb-2 text-zinc-300">
        {format(new Date(data.timestamp * 1000), "MMM d, yyyy HH:mm")}
      </div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-400">
            {DATAKEY_LABELS[entry.dataKey ?? ""] ?? entry.dataKey}:
          </span>
          <span className="font-mono text-white">
            {formatPrice(entry.value ?? 0)} {baseTokenSymbol}
          </span>
        </div>
      ))}
    </div>
  );
}
