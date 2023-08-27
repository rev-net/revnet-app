import { ConnectKitButton } from "@/components/ConnectKitButton";

export function Nav() {
  return (
    <nav className="text-zinc-50 bg-zinc-900">
      <div className="flex justify-between items-center container py-4">
        <span>REVNET</span>

        <ConnectKitButton />
      </div>
    </nav>
  );
}
