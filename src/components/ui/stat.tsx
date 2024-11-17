export function Stat({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <div>
      <div className="font-bold text-xl text-black">{label}</div>
      <div className="text-2xl text-black">{children}</div>
    </div>
  );
}
