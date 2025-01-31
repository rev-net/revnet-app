import { JB_CHAINS } from "juice-sdk-core";
import { JBChainId } from "juice-sdk-react";
import { ChainLogo } from "./ChainLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { sortChains } from "@/lib/utils";

interface ChainSelectorProps {
  value: JBChainId;
  onChange: (chainId: JBChainId) => void;
  disabled?: boolean;
  options: JBChainId[];
}

export const ChainSelector = ({
  value,
  onChange,
  disabled,
  options,
}: ChainSelectorProps) => {
  const chainOptions = sortChains(options);

  return (
    <Select
      onValueChange={(value) => {
        onChange(Number(value) as JBChainId);
      }}
      disabled={disabled}
      defaultValue={String(value)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select chain">
          {value ? (
            <div className="flex items-center gap-2">
              <ChainLogo chainId={Number(value) as JBChainId} />
              <span>{JB_CHAINS[value].name}</span>
            </div>
          ) : (
            <span>Select chain</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {chainOptions.map((chainId) => (
          <SelectItem
            key={chainId}
            value={chainId.toString()}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <ChainLogo chainId={chainId as JBChainId} />
              <span>{JB_CHAINS[chainId as JBChainId].name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
