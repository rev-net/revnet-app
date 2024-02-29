import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="h-screen bg-black text-zinc-50 flex items-center justify-center md:pb-24">
      <div className="max-w-7xl px-3 md:px-4 mx-auto flex gap-2 justify-between flex-wrap">
        <h1 className="flex flex-col gap-4" title="REVNET">
          <span className="text-[10rem] md:text-[18rem] font-bold uppercase leading-[0.8] tracking-wide">
            REV
          </span>
          <span className="uppercase text-orange-400 tracking-[0.1rem] md:tracking-[0.5rem] text-xs md:text-sm pl-2 md:pl-4 leading-none z-10">
            Open Source Outcompetes Everything
          </span>
          <span className="text-[10rem] md:text-[18rem] font-bold uppercase leading-[0.7] tracking-wide">
            NET
          </span>
        </h1>
        <div className="md:text-right md:max-w-[27%] flex flex-col justify-between md:items-end pt-16 pb-10 gap-3">
          <div className="text-2xl md:text-3xl">
            Auto-managed revenue & capital formation for open source
          </div>
          <Link href="/create">
            <Button
              className="bg-orange-500 text-lg md:text-xl text-black md:h-16 h-12 md:w-48 w-36 hover:bg-orange-600"
              size="lg"
            >
              Deploy
            </Button>
          </Link>
          <div className="text-base">
            <p className="text-zinc-500 mb-3">
              Made with love for internet communities of builders, investors and
              retail users
            </p>
            <p className="text-zinc-500">
              Learn more:{" "}
              <a
                className="text-orange-400 underline hover:text-orange-500"
                href="revnet.eth.limo"
                rel="noopener noreferer"
              >
                revnet.eth.limo
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
