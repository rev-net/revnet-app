"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof RadixSlider.Root>,
  React.ComponentPropsWithoutRef<typeof RadixSlider.Root>
>(({ className, ...props }, ref) => (
  <RadixSlider.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <RadixSlider.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
      <RadixSlider.Range className="absolute h-full bg-zinc-500 dark:bg-zinc-400" />
    </RadixSlider.Track>
    <RadixSlider.Thumb className="block h-4 w-4 rounded-full border border-black bg-white shadow transition-colors focus:outline-none focus:ring-2 focus:ring-black disabled:pointer-events-none disabled:opacity-50 dark:border-white dark:bg-black" />
  </RadixSlider.Root>
));
Slider.displayName = RadixSlider.Root.displayName;

export { Slider };