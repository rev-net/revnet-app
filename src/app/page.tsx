import { Button } from "@/components/ui/button";
import { FastForwardIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="container mb-40 mt-40">
      <div className="flex flex-col items-center justify-center mb-20">
        <Image
          src="/assets/img/revnet-logo.svg"
          width={200}
          height={200}
          alt="Revnet logo"
        />
        <span className="sr-only">Revnet</span>
        <div className="text-2xl md:text-4xl mb-14 mt-4 font-medium text-center">
          Revnets are an unstoppable growth engine for the open internet
        </div>
        <div className="flex gap-4">
          <Link href="/create">
            <Button className="md:h-20 h-16 text-xl md:text-2xl px-10 flex gap-2">
              Deploy
            </Button>
          </Link>
        </div>
      </div>
        <div className="text-xl md:text-2xl mb-14 mt-4 text-center">
          Explore: $<Link href="https://revnet.app/1" target="_blank"
            rel="noopener norefererr"
            className="underline">NANA</Link> {"  |  "} $<Link href="https://revnet.app/3" target="_blank"
            rel="noopener norefererr"
            className="underline">REV</Link> {"  |  "} $<Link href="https://revnet.app/4" target="_blank"
            rel="noopener norefererr"
            className="underline">BAN</Link> {"  |  "} $<Link href="https://revnet.app/2" target="_blank"
            rel="noopener norefererr"
            className="underline">CPN</Link>

        </div>

      <div className="mx-auto max-w-prose text-l md:text-2xl text-center">
        <p className="mb-10">
          A revnet serves as a hands-free, all-in-one tokenized incentive machine, cap table, and growth engine for leaders, workers, artists, investors, and customers, resolving tensions between open source productivity and private value capture by encouraging collaborative growth throughout the increasingly open web.
        </p>

        <p className="mb-10">
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
      </div>
    </div>
  );
}
