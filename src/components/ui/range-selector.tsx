"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export type RangeOption<T extends string> = {
  value: T;
  label: string;
};

interface Props<T extends string> {
  ranges: RangeOption<T>[];
  defaultValue: T;
}

export function RangeSelector<T extends string>({ ranges, defaultValue }: Props<T>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get("range");

  const validValues = ranges.map((r) => r.value);
  const currentValue = validValues.includes(rangeParam as T) ? (rangeParam as T) : defaultValue;

  return (
    <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg shrink-0">
      {ranges.map(({ value, label }) => (
        <Link
          key={value}
          href={`${pathname}?range=${value}`}
          scroll={false}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
            currentValue === value
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
