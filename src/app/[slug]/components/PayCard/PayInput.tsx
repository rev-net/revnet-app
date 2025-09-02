import * as React from "react";

import { cn } from "@/lib/utils";
import { PayOnSelect } from "./PayOnSelect";

export interface PayInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  withPayOnSelect?: boolean;
  currency?: string;
  inputClassName?: string;
}

const PayInput = React.forwardRef<HTMLInputElement, PayInputProps>(
  ({ className, inputClassName, label, type, currency, withPayOnSelect, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-30 px-4 py-4 w-full items-center justify-between shadow-sm focus-within:ring-1 focus-within:ring-inset focus-within:ring-zinc-500 bg-zinc-100",
          className
        )}
      >
        <div className="flex flex-col">
          <div className="flex flex-row gap-1">
            <label className="text-md text-black-700">
              {label}
            </label>
            {withPayOnSelect && (
              <PayOnSelect />
            )}
          </div>
          <input
            type={type}
            className={cn(
              "border-0 bg-transparent pl-0 pr-3 pt-1 pb-0 text-zinc-900 text-2xl w-full placeholder:text-zinc-400 focus:ring-0 sm:leading-6",
              inputClassName
            )}
            ref={ref}
            placeholder="0.00"
            {...props}
          />
        </div>
        <span className="text-right select-none text-lg">{currency}</span>
      </div>
    );
  }
);
PayInput.displayName = "PayInput";

export { PayInput };
