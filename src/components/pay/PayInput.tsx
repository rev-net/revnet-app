import * as React from "react";

import { cn } from "@/lib/utils";

export interface PayInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  currency?: string;
  inputClassName?: string;
}

const PayInput = React.forwardRef<HTMLInputElement, PayInputProps>(
  ({ className, inputClassName, label, type, currency, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex rounded-md h-16 px-5 w-full items-center justify-between shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-zinc-600 bg-zinc-50",
          className
        )}
      >
        <div className="flex flex-col">
          <label className="text-xs text-zinc-700">{label}</label>
          <input
            type={type}
            className={cn(
              "block flex-1 border-0 bg-transparent pl-0 pr-3 pt-1 pb-0 text-gray-900 text-2xl placeholder:text-gray-400 focus:ring-0 sm:leading-6",
              inputClassName
            )}
            ref={ref}
            placeholder="0.00"
            {...props}
          />
        </div>
        <div className="text-right select-none text-lg">{currency}</div>
      </div>
    );
  }
);
PayInput.displayName = "PayInput";

export { PayInput };
