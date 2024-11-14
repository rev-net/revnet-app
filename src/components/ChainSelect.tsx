import { chainNames } from "@/app/constants";
import { JBChainId } from "juice-sdk-react";
import { ChainLogo } from "./ChainLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ChainSelectorProps {
  value: JBChainId;
  onChange: (chainId: JBChainId) => void;
  disabled?: boolean;
}

export const ChainSelector = ({
  value,
  onChange,
  disabled,
}: ChainSelectorProps) => {
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
          <div className="flex items-center gap-2">
            <ChainLogo chainId={Number(value) as JBChainId} />
            <span>{chainNames[value]}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(chainNames).map(([chainId, chainName]) => (
          <SelectItem
            key={chainId}
            value={chainId}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <ChainLogo chainId={Number(chainId) as JBChainId} />
              <span>{chainName}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
