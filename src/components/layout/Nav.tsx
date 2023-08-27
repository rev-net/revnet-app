"use client";

import { ConnectKitButton } from "connectkit";

export function Nav() {
  return (
    <nav className="border-b border-b-zinc-900">
      <div className="flex justify-between items-center container py-4">
        <span>revnet</span>

        <ConnectKitButton />
      </div>
    </nav>
  );
}
