import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="h-screen bg-black text-zinc-50 flex items-center justify-center pb-24">
      <div className="container flex gap-2 justify-between">
        <h1 className="flex flex-col gap-4" title="REVNET">
          <span className="text-[18rem] font-bold uppercase leading-[0.8] tracking-wide">
            REV
          </span>
          <span className="uppercase text-orange-400 tracking-[0.5rem] text-sm pl-4 leading-none z-10">
            Open Source Outcompetes Everything
          </span>
          <span className="text-[18rem] font-bold uppercase leading-[0.7] tracking-wide">
            NET
          </span>
        </h1>
        <div className="text-right max-w-[23%] flex flex-col justify-between items-end pt-16 pb-10">
          <div className="text-2xl">
            Auto-managed revenue & capital formation for open source
          </div>
          <Link href="/create">
            <Button
              className="bg-orange-500 text-xl text-black h-16 w-48 hover:bg-orange-600"
              size="lg"
            >
              Deploy
            </Button>
          </Link>
          <div>
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
