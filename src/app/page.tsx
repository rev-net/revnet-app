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
      Site is WIP
      <div>
        <a href="/net/1223" className="underline text-blue-500">
          Example revnet
        </a>
      </div>
    </div>
  );
}
