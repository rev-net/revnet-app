import { useState, useEffect } from "react";
import { JB_CHAINS, SuckerPair } from "juice-sdk-core";
import { JBChainId, useJBChainId, useSuckers } from "juice-sdk-react";
import { useSelectedSucker } from "./SelectedSuckerContext";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export function PayOnSelect() {
  const suckersQuery = useSuckers();
  const chainId = useJBChainId();
  const suckers = suckersQuery.data;
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();

  useEffect(() => {
    const defaultSucker = suckers?.find(sucker => chainId === sucker.peerChainId);
    setSelectedSucker(defaultSucker);
  }, [suckers, chainId, setSelectedSucker]);

  if (!suckers || suckers.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-1">
      <span className="text-sm text-zinc-500">on</span>
      <Select
        onValueChange={(value: string) => {
          setSelectedSucker(suckers?.find(sucker => sucker.peerChainId === value) || undefined)
        }}
        defaultValue={selectedSucker?.peerChainId}
      >
        <SelectTrigger className="underline bg-transparent border-none p-0 h-auto">
          <SelectValue placeholder="Select a chain" />
        </SelectTrigger>
        <SelectContent>
          {suckers?.map((sucker) => (
            <SelectItem key={sucker.peerChainId} value={sucker.peerChainId}>
              {JB_CHAINS[sucker.peerChainId as JBChainId]?.name.toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
