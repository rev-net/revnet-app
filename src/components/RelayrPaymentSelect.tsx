"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatHexEther } from "@/lib/utils";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { ChainPayment } from "juice-sdk-react";

interface Props {
  payments: ChainPayment[];
  tokenSymbol: string;
  selectedPayment: ChainPayment | null;
  onSelectPayment: (payment: ChainPayment) => void;
  disabled?: boolean;
}

export function RelayrPaymentSelect(props: Props) {
  const { payments, tokenSymbol, selectedPayment, onSelectPayment, disabled = false } = props;
  return (
    <div>
      <div className="text-left text-black-500 font-semibold mb-2">How would you like to pay?</div>
      <div className="max-w-sm">
        <Select
          onValueChange={(v) => onSelectPayment(payments.find((p) => p.chain === Number(v))!)}
          value={selectedPayment?.chain.toString()}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {payments.map((payment) => {
              return (
                <SelectItem value={payment.chain.toString()} key={payment.chain}>
                  {formatHexEther(payment.amount)} {tokenSymbol} on{" "}
                  {JB_CHAINS[payment.chain as JBChainId].name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
