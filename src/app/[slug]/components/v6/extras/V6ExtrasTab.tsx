"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBendystrawQuery, useJBContractContext } from "@bananapus/nana-sdk-react";
import { useMemo } from "react";
import { ProjectItem } from "../shared";
import { PayerAddressList } from "./PayerAddressList";
import { PayerDeployForm } from "./PayerDeployForm";
import { ProjectPayersDocument, chainProjectRows, payersWhere } from "./projectPayers";

/**
 * website/-parity Extras tab (renderExtrasSection): the "Payer address"
 * deployment form (JBProjectPayerDeployer.deployProjectPayer per selected
 * chain, sequential simulate-first txs) with the sucker group's indexed payer
 * addresses from bendystraw below it.
 */
export function V6ExtrasTab({ projects }: { projects: ProjectItem[] }) {
  const { version } = useJBContractContext();
  const rows = useMemo(() => chainProjectRows(projects), [projects]);

  const payersQuery = useBendystrawQuery(
    ProjectPayersDocument,
    { where: payersWhere(rows, version) },
    { enabled: rows.length > 0 },
  );
  const payerRows = payersQuery.data?.projectPayers?.items ?? [];

  if (rows.length === 0) {
    return <div className="text-zinc-500">Nothing here yet.</div>;
  }

  return (
    <div className="flex flex-col min-w-0 gap-2">
      <h3 className="mb-2 text-base font-semibold text-zinc-700">Payer address</h3>
      <div className="max-w-screen-sm">
        <p className="text-sm text-zinc-500">
          Create a dedicated address that pays this project whenever it receives ETH. Anyone can
          create and reuse as many payer addresses as they need.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4">Create payer address</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create payer address</DialogTitle>
              <DialogDescription>
                Configure how incoming ETH is handled, who receives tokens, and where the address is
                deployed.
              </DialogDescription>
            </DialogHeader>
            <PayerDeployForm
              rows={rows}
              existingRows={payerRows}
              onDeployed={() => payersQuery.refetch()}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="max-w-screen-lg">
        <PayerAddressList
          rows={payerRows}
          isLoading={payersQuery.isLoading}
          isError={payersQuery.isError}
        />
      </div>
    </div>
  );
}
