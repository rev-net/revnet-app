import { Button } from "@/components/ui/button";
import { FastForwardIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="container mt-40">
      <div className="flex flex-col items-left justify-left">
        <Image
          src="/assets/img/revnet-full-bw.svg"
          width={840}
          height={240}
          alt="Revnet logo"
        />
        <span className="sr-only">Revnet</span>
        <div className="text-2xl md:text-2xl mt-8 font-medium text-left">
          Unstoppable funding machines for growth-oriented projects on the open internet
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 ">
        <div className="flex gap-4 mt-8">
          <Link href="/create">
            <Button className="md:h-12 h-16 text-xl md:text-xl px-4 flex gap-2 bg-teal-500 hover:bg-teal-600">
              Design yours
            </Button>
          </Link>
        </div>
        <div className="mt-8 text-xl md:text-xl text-left overflow-scroll whitespace-nowrap">
          <span className="mr-1">Browse:</span> $<Link href="https://revnet.app/sepolia/1" target="_blank"
            rel="noopener norefererr"
            className="underline hover:text-black/70">NANA</Link><span className="text-zinc-300">{" | "}</span> $<Link href="https://revnet.app/sepolia/3" target="_blank"
            rel="noopener norefererr"
            className="underline hover:text-black/70">REV</Link><span className="text-zinc-300">{" | "}</span> $<Link href="https://revnet.app/sepolia/4" target="_blank"
            rel="noopener norefererr"
            className="underline hover:text-black/70">BAN</Link><span className="text-zinc-300">{" | "}</span> $<Link href="https://revnet.app/sepolia/2" target="_blank"
            rel="noopener norefererr"
            className="underline hover:text-black/70">CPN</Link>
        </div>
        </div>
      </div>
      <div className="border border-zinc-100 mt-20"></div>

      <div className="mt-8 max-w-prose text-l md:text-2xl text-lg text-left">
        {/* <p className="text-xl">
          Made for creators, developers, communities, investors, and customers.
        </p> */}
        <p className="text-xl">
          Simple enough for startups, powerful enough for decentralized global orgs and brands.
        </p>

        <p className="text-xl">
          Read the memo at {" "}
          <Link
            href="https://rev.eth.sucks/memo"
            target="_blank"
            rel="noopener norefererr"
            className="underline"
          >
            rev.eth.sucks/memo
          </Link>.
        </p>
        <div className="flex">
          <div className="mt-8 bg-white text-black text-lg">
          Plan your revnet with the community <Link href="https://discord.gg/vhVxwh8aD9" className="underline hover:text-black/70">on Discord.
            </Link>
          </div>
        </div>
        <div className="flex">
          <div className="bg-white text-black text-lg">
Audit this website and the revnet protocol <Link href="https://github.com/orgs/rev-net/repositories" className="underline hover:text-black/70">
               on Github.
            </Link>
          </div>
        </div>
        <div className="flex mb-40">
          <div className="bg-white text-black text-lg">
    Support the $REV network <Link href="https://revnet.app/sepolia/3" className="underline hover:text-black/70">
               here,
            </Link>{" "}we run as a revnet ourselves.
          </div>
        </div>
      </div>
    </div>
  );
}
