"use client";

import { useMemo } from "react";
import { ProjectItem } from "../shared";
import { BuybackRouterCard } from "./BuybackRouterCard";
import { OperatorAccountCard } from "./OperatorAccountCard";
import { OperatorEditsCard } from "./OperatorEditsCard";
import { PermissionsCard } from "./PermissionsCard";
import { chainProjectRows } from "./operatorLib";

/**
 * website/-parity Operator tab (renderBackOfficeSection, revnet branch): the
 * Account card (per-chain operator + account type + transfer via
 * REVOwner.setOperatorOf), the Edits card (reused metadata/splits dialogs),
 * the Buyback & swap router card (data-hook-resolved reads + the three
 * registry writes), and the read-only Permissions card.
 */
export function V6OperatorTab({
  projects,
  operator,
}: {
  projects: ProjectItem[];
  operator?: string;
}) {
  const rows = useMemo(() => chainProjectRows(projects), [projects]);

  if (rows.length === 0) {
    return <div className="text-zinc-500">Operator tools are on the way.</div>;
  }

  return (
    <div className="flex flex-col min-w-0 gap-8">
      <OperatorAccountCard rows={rows} fallbackOperator={operator} />
      <OperatorEditsCard projects={projects} />
      <BuybackRouterCard rows={rows} />
      <PermissionsCard rows={rows} />
    </div>
  );
}
