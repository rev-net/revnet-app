import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-white bg-zinc-900 text-center h-screen flex items-center justify-center flex-col border-b-zinc-800 border-b">
      <h2 className="text-4xl mb-3">Revnet Not Found</h2>
      <Link href="/" className="underline text-lg">
        Return Home
      </Link>
    </div>
  );
}
