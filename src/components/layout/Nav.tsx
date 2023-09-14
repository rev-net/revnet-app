import { ConnectKitButton } from "@/components/ConnectKitButton";
import Link from "next/link";

export function Nav() {
  return (
    <nav className="text-zinc-50 bg-zinc-900">
      <div className="flex justify-between items-center container py-4">
        <Link href="/">REVNET</Link>

        <ConnectKitButton />
      </div>
    </nav>
  );
}
