import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { MiniAppHello } from "./MiniAppHello";
import { TopProjectsTable } from "./TopProjectsTable";

function RevLink({ network, id, text }: { network: string; id: number; text: string }) {
  return (
    <span>
      $
      <Link href={`/v5:${network}:${id}`} className="underline hover:text-black/70">
        {text}
      </Link>
    </span>
  );
}

function Pipe() {
  return <div className="text-zinc-300">{" | "}</div>;
}

export default function Page() {
  return (
    <div className="container mt-40 pr-[1.5rem] pl-[1.5rem] sm:pr-[2rem] sm:pl-[2rem] sm:px-8">
      <MiniAppHello />
      <div className="flex flex-col justify-center items-center">
        <Image src="/assets/img/revnet-full-bw.svg" width={630} height={180} alt="Revnet logo" />
        <span className="sr-only">Revnet</span>

        <div className="text-xl md:text-2xl mt-8 font-medium text-left">
          Tokenize revenues and fundraises. 100% autonomous.
        </div>

        <div className="flex gap-4 mt-8">
          <Link href="/create">
            <Button className="md:h-12 h-16 text-xl md:text-xl px-4 flex gap-2 bg-teal-500 hover:bg-teal-600">
              Create yours
            </Button>
          </Link>
        </div>

        <Suspense>
          <TopProjectsTable />
        </Suspense>
      </div>

      <div className="border border-zinc-100 mt-20"></div>

      <div className="mt-8 max-w-prose text-lg text-left mx-auto">
        How a revnet works:
        <ol className="mt-4 list-decimal ml-8 sm:ml-10 list-outside">
          <li>Set a name, ticker, logo, and description.</li>
          <li>Lock token issuance and cash-out terms in automated stages.</li>
          <li>Collect, process, and tokenize payments from anyone, across all chains.</li>
        </ol>
      </div>

      <div className="mt-4 max-w-prose text-lg text-left mx-auto">
        <p>Simple enough for startups, powerful enough for global orgs and brands.</p>

        <div>
          <ul className="list-disc list-outside ml-6 sm:ml-10 mt-4">
            <li>
              Read the memo at{" "}
              <Link
                href="https://rev.eth.sucks/memo"
                target="_blank"
                rel="noopener norefererr"
                className="underline"
              >
                rev.eth.sucks/memo
              </Link>
              .
            </li>
            <li>
              Plan your revnet with the community on{" "}
              <Link
                href="https://discord.gg/vhVxwh8aD9"
                target="_blank"
                rel="noopener norefererr"
                className="underline"
              >
                Discord
              </Link>
              .
            </li>
            <li>
              Audit this website and the revnet protocol on{" "}
              <Link
                href="https://github.com/orgs/rev-net/repositories"
                target="_blank"
                rel="noopener norefererr"
                className="underline"
              >
                Github
              </Link>
              .
            </li>
            <li>
              Support the $REV network{" "}
              <Link
                href="/v5:eth:3"
                target="_blank"
                rel="noopener norefererr"
                className="underline"
              >
                here
              </Link>
              , we run as a revnet ourselves.
            </li>
          </ul>
        </div>
      </div>

      <div className="border border-zinc-100 mt-12"></div>
    </div>
  );
}
