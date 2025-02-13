import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const RevLink = ({ network, id, text }: { network: string; id: number; text: string }) => {
  return (
    <span>
      $<Link href={`/${network}/${id}`} className="underline hover:text-black/70">
        {text}
      </Link>
    </span>
  );
};

const Pipe = () => {
  return <div className="text-zinc-300">{" | "}</div>;
}

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
          Tokenized revenues and fundraises for projects on the open internet. 100% maintenance-free.
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex gap-4 mt-8">
            <Link href="/create">
              <Button className="md:h-12 h-16 text-xl md:text-xl px-4 flex gap-2 bg-teal-500 hover:bg-teal-600">
                Create yours
              </Button>
            </Link>
          </div>
          <div className="flex flex-row mt-8 text-xl md:text-xl text-left gap-1 whitespace-nowrap">
            <span className="mr-1">Browse:</span>
            <RevLink network="sepolia" id={1} text="NANA" />
            <Pipe />
            <RevLink network="sepolia" id={3} text="REV" />
            <Pipe />
            <RevLink network="sepolia" id={4} text="BAN" />
            <Pipe />
            <RevLink network="sepolia" id={2} text="CPN" />
          </div>
        </div>
      </div>
      <div className="border border-zinc-100 mt-20"></div>

      <div className="mt-8 max-w-prose text-xl text-lg text-left">
        How revnets work:
        <ol className="mt-4 list-decimal ml-10 list-outside">
          <li>Set a name, ticker, logo, and description.</li>
          <li>Lock token issuance and cash-out rules in automated stages.</li>
          <li>Deploy on every chain where you collect fees and payments.</li>
          <li>Route revenues to your revnet while welcoming payments from anyone.</li>
        </ol>
      </div>
      <div className="mt-4 max-w-prose text-l md:text-2xl text-lg text-left">
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
