import * as React from "react";

import { cn } from "@/lib/utils";

export interface PayInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  currency?: string;
  inputClassName?: string;
}

const PayInput = React.forwardRef<HTMLInputElement, PayInputProps>(
  ({ className, inputClassName, type, currency, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-zinc-600 bg-zinc-50",
          className
        )}
      >
        <span className="flex select-none items-center pl-3 text-gray-500 text-lg ">
          {currency}
        </span>

        <input
          type={type}
          className={cn(
            "block text-right flex-1 border-0 bg-transparent py-3 pl-1 text-gray-900 text-2xl placeholder:text-gray-400 focus:ring-0 sm:leading-6",
            inputClassName
          )}
          ref={ref}
          placeholder="0.00"
          {...props}
        />
      </div>
    );
  }
);
PayInput.displayName = "PayInput";

export { PayInput };
