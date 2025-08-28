import { FieldAttributes, Field as FormikField, useField } from "formik";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function Field({
  address,
  width,
  ...props
}: FieldAttributes<any> & { address?: boolean; width?: string }) {
  if (props.suffix || props.prefix) {
    return (
      <div className={twMerge("relative", width ?? "w-full")}>
        {props.prefix ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-zinc-500 sm:text-md">{props.prefix}</span>
          </div>
        ) : null}
        <FormikField
          {...props}
          pattern={address ? "^0x[a-fA-F0-9]{40}$" : undefined}
          onWheel={(e: any) => e.target.blur()} // Prevents scrolling on number input
          className={twMerge(
            "flex w-full border border-zinc-200 bg-white px-3 py-1.5 text-md ring-offset-white file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
            props.prefix ? "pl-6" : "",
            props.className,
          )}
        />
        {props.suffix ? (
          <div
            className={twMerge(
              "pointer-events-none absolute inset-y-0 right-0 flex items-center px-3",
            )}
          >
            <span className="text-zinc-500 sm:text-md">{props.suffix}</span>
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <FormikField
      {...props}
      pattern={address ? "^0x[a-fA-F0-9]{40}$" : undefined}
      className={twMerge(
        "flex border border-zinc-200 bg-white px-3 py-1.5 text-md ring-offset-white file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
        width ?? "w-full",
        props.className,
      )}
    />
  );
}

export function FieldGroup(
  props: FieldAttributes<any> & {
    label: string;
    description?: string | ReactNode;
    className?: string;
    address?: boolean;
  },
) {
  const [field, meta] = useField(props);

  return (
    <div className={twMerge("", props.className)}>
      <label
        htmlFor={props.name}
        className="block text-md font-semibold leading-6 mb-1"
      >
        {props.label}
      </label>
      {props.description ? (
        <p className="text-md text-zinc-600 mb-3">{props.description}</p>
      ) : null}
      <Field {...props} />
      {meta.error && meta.touched && (
        <p className="text-red-500 mt-1 mb-1.5 text-sm">{meta.error}</p>
      )}
    </div>
  );
}
