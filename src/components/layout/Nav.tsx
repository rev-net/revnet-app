import { ConnectKitButton } from "@/components/ConnectKitButton";
import Link from "next/link";
import { Badge } from "../ui/badge";

export function Nav() {
  return (
    <nav className="text-zinc-50 bg-zinc-900">
      <div className="flex justify-between items-center container py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="italic">
            Revnet
          </Link>
          <Badge variant="success">Goerli</Badge>
        </div>

        <ConnectKitButton />
      </div>
    </nav>
  );
}
