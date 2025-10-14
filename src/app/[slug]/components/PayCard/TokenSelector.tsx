"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { Token, formatTokenAmount } from "@/lib/token";

interface Props {
  tokens: Token[];
  selectedToken: Token;
  onSelectToken: (token: Token) => void;
  chainId: number;
}

export function TokenSelector(props: Props) {
  const { tokens, selectedToken, onSelectToken, chainId } = props;
  const { balances } = useTokenBalances(tokens, chainId);

  if (tokens.length <= 1) {
    return <span className="text-right select-none text-lg">{selectedToken.symbol}</span>;
  }

  return (
    <Select
      value={selectedToken.address}
      onValueChange={(address) => {
        const token = tokens.find((t) => t.address === address);
        if (token) onSelectToken(token);
      }}
    >
      <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto text-lg font-normal focus:ring-0 focus:ring-offset-0">
        <SelectValue>{selectedToken.symbol}</SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-[200px]">
        {tokens.map((token) => {
          return (
            <SelectItem
              key={token.address}
              value={token.address}
              className="[&>*:last-child]:flex [&>*:last-child]:w-full"
            >
              <span className="grow">{token.symbol}</span>
              <span className="shrink-0 pl-2">
                {formatTokenAmount(balances.get(token.address) ?? 0n, token)}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
