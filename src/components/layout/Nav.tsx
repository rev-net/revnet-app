import { ConnectKitButton } from "@/components/ConnectKitButton";
import Image from "next/image";
import Link from "next/link";
import { ChainBadge } from "../ChainBadge";

export function Nav() {
  return (
    <nav className="text-zinc-50 bg-zinc-900">
      <div className="flex justify-between items-center container py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="italic">
            <Image
              src="/assets/img/revnet-white.svg"
              width={100}
              height={100}
              alt="Revnet logo"
            />
          </Link>
          <ChainBadge />
        </div>

        <ConnectKitButton />
      </div>
    </nav>
  );
}
