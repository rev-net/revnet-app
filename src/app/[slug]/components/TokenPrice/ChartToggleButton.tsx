"use client";

import { cn } from "@/lib/utils";

interface Props {
  label: string;
  active: boolean;
  disabled?: boolean;
  colorVar: `--chart-${number}`;
  onClick: () => void;
}

export function ChartToggleButton({ label, active, disabled = false, colorVar, onClick }: Props) {
  const isActive = active && !disabled;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
        disabled && "opacity-50 cursor-not-allowed",
        isActive
          ? `bg-[${colorVar}]/10 text-[${colorVar}] ring-1 ring-[${colorVar}]/30`
          : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200",
      )}
      style={
        isActive
          ? {
              backgroundColor: `color-mix(in srgb, var(${colorVar}) 10%, transparent)`,
              color: `var(${colorVar})`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(${colorVar}) 30%, transparent)`,
            }
          : undefined
      }
    >
      <span
        className={cn("w-2.5 h-2.5 rounded-full", !isActive && "bg-zinc-300")}
        style={isActive ? { backgroundColor: `var(${colorVar})` } : undefined}
      />
      {label}
    </button>
  );
}
