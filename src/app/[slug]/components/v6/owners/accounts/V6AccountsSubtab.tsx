"use client";

import { ProjectItem } from "../../shared";
import { V6AllCard } from "./V6AllCard";
import { V6YouCard } from "./V6YouCard";

/**
 * Accounts subtab (website/ parity: the "You" + "All" owners cards): the
 * connected wallet's per-chain position with its action buttons, then the
 * holder distribution across every account.
 */
export function V6AccountsSubtab({ projects }: { projects: ProjectItem[] }) {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-lg font-medium text-black mb-2">You</h2>
        <V6YouCard projects={projects} />
      </section>

      <section>
        <h2 className="text-lg font-medium text-black mb-2">All</h2>
        <V6AllCard />
      </section>
    </div>
  );
}
