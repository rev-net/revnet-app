import { ConnectKitButton } from "@/components/ConnectKitButton";
import Link from "next/link";
import { Badge } from "../ui/badge";
import Image from "next/image";

export function Nav() {
  return (
    <nav className="text-zinc-50 bg-zinc-900">
      <div className="flex justify-between items-center container py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="italic">
            <Image
              src="/assets/img/revnet.svg"
              width={100}
              height={100}
              alt="Revnet logo"
            />
          </Link>
          <Badge variant="success">Sepolia</Badge>
        </div>

        <ConnectKitButton />
      </div>
    </nav>
  );
}
