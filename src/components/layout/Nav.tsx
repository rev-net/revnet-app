import { ConnectKitButton } from "@/components/ConnectKitButton";
import Image from "next/image";
import Link from "next/link";

export function Nav() {
  return (
    <nav className="text-zinc-50 border-b border-zinc-100">
      <div className="flex justify-between items-center px-4 sm:container py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="italic">
            <Image
              src="/assets/img/small-bw.svg"
              width={60}
              height={60}
              alt="Revnet logo"
            />
          </Link>
        </div>
        <ConnectKitButton />
      </div>
    </nav>
  );
}
