import { ConnectKitButton } from "@/components/ConnectKitButton";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import ThemedImage from '@/components/ThemedImage';
import Image from "next/image";
import Link from "next/link";
import { ChainBadge } from "../ChainBadge";

export function Nav() {
  return (
    <nav className="text-zinc-50 border-b border-zinc-100">
      <div className="flex justify-between items-center px-4 sm:container py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="italic">
            <ThemedImage
          lightSrc="/assets/img/small-bw.svg"
          darkSrc="/assets/img/small-peach.svg"
          width={60}
          height={60}
          alt="Revnet logo"
        />
          </Link>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
        <ConnectKitButton /> <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
