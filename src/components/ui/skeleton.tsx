import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ariaHidden = props["aria-hidden"] ?? (props.role ? undefined : true);

  return (
    <div
      {...props}
      aria-hidden={ariaHidden}
      className={cn("skeleton-shimmer", className)}
    />
  );
}

export function SkeletonLines({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-full", "w-5/6", "w-2/3", "w-3/4"];

  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn("h-3", widths[index % widths.length])} />
      ))}
    </div>
  );
}

export function SkeletonTable({
  rows = 3,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} aria-hidden="true">
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="grid items-center gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton
              key={column}
              className={cn("h-3", column === 0 ? "w-3/4" : "w-2/3")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
