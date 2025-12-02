"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export type ProjectionRange = "1y" | "5y" | "10y" | "20y" | "all";

const RANGES: { value: ProjectionRange; label: string }[] = [
  { value: "1y", label: "1Y" },
  { value: "5y", label: "5Y" },
  { value: "10y", label: "10Y" },
  { value: "20y", label: "20Y" },
  { value: "all", label: "All" },
];

const VALID_RANGES: ProjectionRange[] = ["1y", "5y", "10y", "20y", "all"];

export function RangeSelector() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get("range");
  const range: ProjectionRange = VALID_RANGES.includes(rangeParam as ProjectionRange)
    ? (rangeParam as ProjectionRange)
    : "5y";

  return (
    <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg shrink-0">
      {RANGES.map(({ value, label }) => (
        <Link
          key={value}
          href={`${pathname}?range=${value}`}
          scroll={false}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
            range === value
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700",
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
