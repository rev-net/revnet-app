"use client";

import { Slider } from "@/components/ui/slider"; // Custom Slider component
export function LoanDurationSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <label className="text-sm font-medium text-zinc-900">
        Lock duration: {value} month{value !== 1 ? "s" : ""}
      </label>
      <Slider
        min={3}
        max={120}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
      <div className="text-xs text-muted-foreground">
        Locking tokens for longer reduces future fees. Max: 120 months.
      </div>
    </div>
  );
}