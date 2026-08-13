export function VersionBanner() {
  return (
    <aside
      aria-label="Supported project versions"
      className="sticky top-0 z-[60] border-b border-amber-400 bg-amber-200 px-4 py-2 text-center text-sm font-medium text-zinc-950 shadow-sm sm:text-base"
    >
      This site shows Juicebox V4–V5 projects only. V6 projects are not displayed.
    </aside>
  );
}
