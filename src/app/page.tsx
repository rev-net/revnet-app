import { Button } from "@/components/ui/button";
import { FastForwardIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="container mb-40">
      <div className="flex flex-col items-center justify-center mb-10 min-h-screen">
        <h1 title="Revnet" className="mb-2">
          <Image
            src="/assets/img/revnet.svg"
            width={800}
            height={800}
            alt="Revnet logo"
          />
          <span className="sr-only">Revnet</span>
        </h1>
        <div className="text-2xl md:text-4xl mb-14 text-center">
          Unstoppable revenue & fundraising for open source.
        </div>
        <div className="flex gap-4">
          <Link href="/create">
            <Button className="md:h-20 h-16 text-xl md:text-2xl px-10 flex gap-2">
              Deploy
              <FastForwardIcon className="h-5 w-5 fill-white" />
            </Button>
          </Link>
          <Link href="#learn">
            <Button
              variant="link"
              className="md:h-20 h-16 text-xl md:text-2xl w-auto"
            >
              Learn about Revnets
            </Button>
          </Link>
        </div>
      </div>

      <a href="" id="learn"></a>
      <div className="h-[1px] w-12 bg-zinc-600 mx-auto -mt-10 mb-20 md:-mt-20 md:mb-40"></div>

      <h2 className="text-4xl md:text-6xl font-bold text-center mb-12 md:mb-20 mx-auto">
        Open source outcompetes everything.
      </h2>
      <div className="mx-auto max-w-prose text-xl md:text-3xl">
        <p className="mb-10">
          Revnets are onchain cap table and incentive machines. No governance,
          no management overhead.
        </p>
        <p className="mb-10">
          With a Revnet, you can bootstrap token liquidity for your open source
          project, meme, campaign, or business.
        </p>
        <p className="mb-10">
          Revnet contracts are safer than SAFEs, more powerful than SAFTs, and
          are easy to use across borders and blockchains. Simple enough for a
          group of friends, powerful enough for high net-worth, global
          communities, products, and brands.
        </p>
        <p className="mb-10">
          Built on Juicebox, everything is open source, and itself funded with a
          Revnet. Revnet's can exist across Etherum mainnet, Optimism, Arbitrum
          and Base – and new chains as they emerge.
        </p>

        <p className="mb-10">
          Learn more at{" "}
          <Link
            href="https://revnet.eth.limo"
            target="_blank"
            rel="noopener norefererr"
            className="underline"
          >
            revnet.eth.limo
          </Link>
        </p>
      </div>
    </div>
  );
}
