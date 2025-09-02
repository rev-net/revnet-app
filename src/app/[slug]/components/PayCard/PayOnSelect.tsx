import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JB_CHAINS } from "juice-sdk-core";
import { JBChainId, useJBChainId, useSuckers } from "juice-sdk-react";
import { useEffect } from "react";
import { useSelectedSucker } from "./SelectedSuckerContext";

export function PayOnSelect() {
  const suckersQuery = useSuckers();
  const chainId = useJBChainId();
  const suckers = suckersQuery.data;
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();

  useEffect(() => {
    const defaultSucker = suckers?.find((sucker) => chainId === sucker.peerChainId);
    setSelectedSucker(defaultSucker);
  }, [suckers, chainId, setSelectedSucker]);

  if (!suckers || suckers.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-1">
      <span className="text-md text-black-700">on</span>
      <Select
        onValueChange={(value: string) => {
          setSelectedSucker(suckers?.find((sucker) => sucker.peerChainId === value) || undefined);
        }}
        defaultValue={selectedSucker?.peerChainId}
      >
        <SelectTrigger className="underline bg-transparent border-none p-0 h-auto text-md text-black-700">
          <SelectValue placeholder="pick a chain" />
        </SelectTrigger>
        <SelectContent>
          {suckers?.map((sucker) => (
            <SelectItem key={sucker.peerChainId} value={sucker.peerChainId}>
              {JB_CHAINS[sucker.peerChainId as JBChainId]?.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
