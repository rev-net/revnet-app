import { ConnectKitButton } from "@/components/ConnectKitButton";
import Link from "next/link";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { sepolia, useNetwork } from "wagmi";
import { optimismSepolia } from "viem/chains";

const NAMES: {
  [chainId: number]: string;
} = {
  [sepolia.id]: "Sepolia",
  [optimismSepolia.id]: "OP Sepolia",
};

export function Nav() {
  const { chain } = useNetwork();
  const chainName = chain ? NAMES[chain.id] : undefined;

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
          {chainName ? <Badge variant="success">{chainName}</Badge> : null}
        </div>

        <ConnectKitButton />
      </div>
    </nav>
  );
}
