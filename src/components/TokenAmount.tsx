import { TokenAmountType } from "@/app/net/[id]/contexts/datatypes";

export function TokenAmount({
  amount,
  decimals = 8,
}: {
  amount: TokenAmountType;
  decimals?: number;
}) {
  return (
    <>
      {amount.amount.format(decimals)} {amount.symbol}
    </>
  );
}
