import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <h2 className="text-4xl mb-3">Revnet Not Found</h2>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
