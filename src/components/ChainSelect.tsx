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
            <span>{JB_CHAINS[value].name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.values(JB_CHAINS).map(({ chain, name }) => (
          <SelectItem
            key={chain.id}
            value={chain.id.toString()}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <ChainLogo chainId={Number(chain.id) as JBChainId} />
              <span>{name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
