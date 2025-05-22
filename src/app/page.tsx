// "use client";
import { Button } from "@/components/ui/button";
/* import { JB_CHAINS } from "juice-sdk-core"; */
import Image from "next/image";
import Link from "next/link";
/* import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react"; */

// Hardcoding for performance for now.
const ethSlug = "eth";

const RevLink = ({
  network,
  id,
  text,
}: {
  network: string;
  id: number;
  text: string;
}) => {
  return (
    <span>
      $
      <Link
        href={`/${network}:${id}`}
        className="underline hover:text-black/70"
      >
        {text}
      </Link>
    </span>
  );
};

const Pipe = () => {
  return <div className="text-zinc-300">{" | "}</div>;
};

export default function Page() {
  // This code was only erroring for now.
  /* const [user, setUser] = useState<{ fid: number; pfp: string, userName: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      await sdk.actions.ready();

      try {
        await sdk.actions.addFrame();
      } catch (error) {
        if (error){
          console.log("User rejected the mini app addition or domain manifest JSON is invalid");
          // Handle the rejection here
        }
      }

      const ctx = (await sdk.context);
      if (ctx?.user) {
        setUser({ fid: ctx.user.fid, pfp: ctx.user.pfpUrl || "", userName: ctx.user.username || "" });
      }
    };
    fetchUser();
  }, []); */

  return (
    <div className="container mt-40 pr-[1.5rem] pl-[1.5rem] sm:pr-[2rem] sm:pl-[2rem] sm:px-8">
      {/* {user?.pfp && (
        <div className="flex items-center mb-4">
          <span className="text-lg">Hello {user.userName}!</span>
        </div>
      )} */}
      <div className="flex flex-col items-left justify-left">
        <Image
          src="/assets/img/hero.webp"
          width={940}
          height={88}
          alt="Revnet logo"
          priority
        />
        <span className="sr-only">Revnet</span>
        <div className="text-xl md:text-2xl mt-8 font-medium text-left">
          Tokenize revenues and fundraises. 100% autonomous.
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex gap-4 mt-8">
            <Link href="/create">
              <Button className="md:h-12 h-16 text-xl md:text-xl px-4 flex gap-2 bg-teal-500 hover:bg-teal-600">
                Create yours
              </Button>
            </Link>
          </div>
          <div className="flex flex-row sm:mt-8 text-xl md:text-xl text-left gap-1 whitespace-nowrap">
            <span className="mr-1">Browse:</span>
            <RevLink network={ethSlug} id={1} text="NANA" />
            <Pipe />
            <RevLink network={ethSlug} id={3} text="REV" />
            <Pipe />
            <RevLink network={ethSlug} id={4} text="BAN" />
            <Pipe />
            <RevLink network={ethSlug} id={2} text="CPN" />
          </div>
        </div>
      </div>
      <div className="border border-zinc-100 mt-20"></div>

      <div className="mt-8 max-w-prose text-lg text-left">
        How a revnet works:
        <ol className="mt-4 list-decimal ml-8 sm:ml-10 list-outside">
          <li>Set a name, ticker, logo, and description.</li>
          <li>Lock token issuance and cash-out rules in automated stages.</li>
          <li>Collect, process, and tokenize payments from anyone, across all chains.</li>
        </ol>
      </div>
      <div className="mt-4 max-w-prose text-lg text-left">
        <p>
          Simple enough for startups, powerful enough for global orgs and
          brands.
        </p>

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
                href="/eth:3"
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
    </div>
  );
}
