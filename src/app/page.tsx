import { Button } from "@/components/ui/button";
import { FastForwardIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="container mt-40">
      <div className="flex flex-col items-left justify-left">
        <Image
          src="/assets/img/revnet-logo.svg"
          width={200}
          height={200}
          alt="Revnet logo"
        />
        <span className="sr-only">Revnet</span>
        <div className="text-2xl md:text-4xl mt-4 font-medium text-left">
          Unstoppable tokenized growth engines for projects on the open internet
        </div>
        <div className="flex gap-4 mt-10">
          <Link href="/create">
            <Button className="md:h-20 h-16 text-xl md:text-2xl px-10 flex gap-2 bg-teal-500 hover:bg-teal-600">
              Ship your revnet
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-10 max-w-prose text-l md:text-2xl text-lg text-left">
        <div className="mt-10 mb-8 text-xl md:text-2xl text-left">
          Browse: $<Link href="https://revnet.app/sepolia/1" target="_blank"
            rel="noopener norefererr"
            className="underline hover:text-black/70 font-medium">NANA</Link> {"  |  "} $<Link href="https://revnet.app/sepolia/3" target="_blank"
            rel="noopener norefererr"
            className="underline hover:text-black/70 font-medium">REV</Link> {"  |  "} $<Link href="https://revnet.app/sepolia/4" target="_blank"
            rel="noopener norefererr"
            className="underline hover:text-black/70 font-medium">BAN</Link> {"  |  "} $<Link href="https://revnet.app/sepolia/2" target="_blank"
            rel="noopener norefererr"
            className="underline hover:text-black/70 font-medium">CPN</Link>
        </div>
        <p className="mb-4">
          A revnet serves as a hands-free, transparent token vending machine, cap table, and capital formation engine for leaders, workers, artists, researchers, investors, AI agents, and customers of growth-oriented businesses, brands, campaigns, experiments, communities, and indie projects on the open internet.
        </p>

        <p>
          Read the memo at {" "}
          <Link
            href="https://revnet.eth.sucks/memo"
            target="_blank"
            rel="noopener norefererr"
            className="underline"
          >
            revnet.eth.sucks/memo
          </Link>.
        </p>
        <div className="flex text-sm">
            <div className="mt-10 bg-white text-black hover:text-black/70 text-l md:text-l flex gap-1">
          Plan your revnet with the community 
          <Link href="https://discord.gg/8qdtvdep" className="underline">on Discord.
          </Link>
        </div>
            </div>
        <div className="flex text-sm">
            <div className="mt-2 bg-white text-black hover:text-black/70 text-l md:text-l flex gap-1">
Audit and contribute to the revnet.app website and revnet protocol
          <Link href="https://github.com/orgs/rev-net/repositories" className="underline">
               on Github.
          </Link>
            </div>
        </div>
        <div className="flex mb-40 text-sm">
            <div className="mt-2 bg-white text-black hover:text-black/70 text-l md:text-l flex gap-1">
    Support the $REV network itself
          <Link href="https://revnet.app/sepolia/3" className="underline">
               here.
          </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
