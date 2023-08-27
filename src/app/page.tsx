import { ConnectKitButton } from "@/components/ConnectKitButton";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="container">
      <nav className="flex justify-between py-4">
        <div>Juicebox Retail</div>
        <ConnectKitButton />
      </nav>

      <h1 className="text-7xl font-bold font-serif max-w-lg mb-5">
        Let's end the Rugs on Retail.
      </h1>
      <p className="text-xl max-w-2xl mb-5">
        Launch a token and set it in motion, forever. Level the playing field
        for your customers and investors with Juicebox Retail.
      </p>

      <Button size="lg">How it works</Button>

      <h2>Open for Retail</h2>
      <div className="grid grid-cols-2 gap-5">
        <div className="relative flex items-center space-x-3 rounded-lg border border-zinc-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-zinc-400">
          <div className="flex-shrink-0">
            {/* <img className="h-10 w-10 rounded-full" alt="" /> */}
          </div>

          <div className="min-w-0 flex-1">
            <a href="#" className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-zinc-900">Defifa</p>
              <p className="truncate text-sm text-zinc-500">$DEFIFA</p>
            </a>
          </div>

          <div>
            <div> 0.01 ETH</div>

            <p className="truncate text-sm text-zinc-500">Backed by 10 ETH</p>
          </div>
        </div>
        <div className="relative flex items-center space-x-3 rounded-lg border border-zinc-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-zinc-400">
          <div className="flex-shrink-0">
            {/* <img className="h-10 w-10 rounded-full" alt="" /> */}
          </div>

          <div className="min-w-0 flex-1">
            <a href="#" className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-zinc-900">Croptop</p>
              <p className="truncate text-sm text-zinc-500">$CROPTOP</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
