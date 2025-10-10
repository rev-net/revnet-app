import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JB_CHAINS } from "juice-sdk-core";
import { useSuckers } from "juice-sdk-react";
import { useSelectedSucker } from "./SelectedSuckerContext";

export function PayOnSelect() {
  const { data: suckers } = useSuckers();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();

  if (!suckers || suckers.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-1">
      <span className="text-md text-black-700">on</span>
      <Select
        onValueChange={(value: string) => {
          const newSucker = suckers.find((sucker) => sucker.peerChainId === Number(value));
          if (newSucker) setSelectedSucker(newSucker);
        }}
        value={selectedSucker.peerChainId.toString()}
      >
        <SelectTrigger className="underline bg-transparent border-none p-0 h-auto text-md text-black-700">
          <SelectValue placeholder="pick a chain" />
        </SelectTrigger>
        <SelectContent>
          {suckers.map((sucker) => (
            <SelectItem key={sucker.peerChainId} value={sucker.peerChainId.toString()}>
              {JB_CHAINS[sucker.peerChainId].name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
