"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrencyBalances } from "@/hooks/useCurrencyBalances";
import { Currency, formatCurrency } from "@/lib/currency";

interface Props {
  currencies: Currency[];
  selectedCurrency: Currency;
  onSelectCurrency: (currency: Currency) => void;
  chainId: number;
}

export function CurrencySelector(props: Props) {
  const { currencies, selectedCurrency, onSelectCurrency, chainId } = props;
  const { balances } = useCurrencyBalances(currencies, chainId);

  if (currencies.length <= 1) {
    return <span className="text-right select-none text-lg">{selectedCurrency.symbol}</span>;
  }

  return (
    <Select
      value={selectedCurrency.address}
      onValueChange={(address) => {
        const currency = currencies.find((c) => c.address === address);
        if (currency) onSelectCurrency(currency);
      }}
    >
      <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto text-lg font-normal focus:ring-0 focus:ring-offset-0">
        <SelectValue>{selectedCurrency.symbol}</SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-[200px]">
        {currencies.map((currency) => {
          return (
            <SelectItem
              key={currency.address}
              value={currency.address}
              className="[&>*:last-child]:flex [&>*:last-child]:w-full"
            >
              <span className="grow">{currency.symbol}</span>
              <span className="shrink-0 pl-2">
                {formatCurrency(balances.get(currency.address) ?? 0n, currency)}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
