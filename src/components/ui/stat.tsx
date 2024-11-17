export function Stat({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <div>
      <div className="font-bold text-xl">{label}</div>
      <div className="text-2xl">{children}</div>
    </div>
  );
}
