"use client";

/**
 * A subtle underlined-text dropdown (website/ pay-card parity): a native
 * select styled as underlined text with a caret. A native <select> sizes to
 * its WIDEST option, which would leave a gap between a short label and the
 * caret — so the current label + caret render as tight visible text with a
 * transparent full-cover select overlaid for the real (native) dropdown.
 */
export function TextSelect({
  value,
  onChange,
  options,
  disabled,
  ariaLabel,
  className = "relative inline-flex items-center gap-1",
  labelClassName = "font-medium text-zinc-900 underline decoration-zinc-300 decoration-1 underline-offset-4",
  selectClassName = "absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default",
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
}) {
  const current = options.find((o) => o.value === value)?.label ?? "";
  return (
    <span className={`min-h-11 ${className} ${disabled ? "opacity-60" : ""}`}>
      <span className={labelClassName || undefined}>{current}</span>
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 shrink-0 text-zinc-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
        className={selectClassName}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}
