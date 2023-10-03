import Link from "next/link";

export default function Page() {
  return (
    <div className="container my-32">
      <h1 className="text-7xl font-bold max-w-lg mb-5 tracking-tight">
        Let's end the rugs on retail.
      </h1>
      <p className="max-w-2xl text-lg mb-6">
        Launch a token, backed by real revenue, without the rugs. Revnets are a
        internet-first approach to growing a investor/builder/customer network.
      </p>
      <div className="mb-16">
        <span>This website is in development –</span>{" "}
        <Link href="/net/1223" className="underline text-blue-500">
          see an example Revnet
        </Link>
        , or{" "}
        <Link href="/create" className="underline text-blue-500">
          create a new one.
        </Link>
        .
      </div>

      <h2 className="text-xl mb-3">Learn about Revnets and Retailism</h2>

      <div className="text-sm flex gap-6 flex-wrap">
        <a
          href="https://jango.eth.limo/9E01E72C-6028-48B7-AD04-F25393307132"
          className="underline text-blue-500"
        >
          Intro to Retailism
        </a>
        <a
          href="https://jango.eth.limo/3EB05292-0376-4B7D-AFCF-042B70673C3D/"
          className="underline text-blue-500"
        >
          Retailism for Devs, Investors, and Customers
        </a>
        <a
          href="https://jango.eth.limo/B762F3CC-AEFE-4DE0-B08C-7C16400AF718/"
          className="underline text-blue-500"
        >
          Modelling Retailism
        </a>
        <a
          href="https://jango.eth.limo/572BD957-0331-4977-8B2D-35F84D693276"
          className="underline text-blue-500"
        >
          A Retailistic View on CAC and LTV
        </a>
        <a
          href="https://jango.eth.limo/CF40F5D2-7BFE-43A3-9C15-1C6547FBD15C/"
          className="underline text-blue-500"
        >
          Observations: Network dynamics similar between atoms, cells,
          organisms, groups, dance parties
        </a>
      </div>
    </div>
  );
}
