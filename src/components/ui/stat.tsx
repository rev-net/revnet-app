export function Stat({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <div>
      <div className="text-zinc-500">{label}</div>
      <div className="text-2xl font-medium">{children}</div>
    </div>
  );
}
