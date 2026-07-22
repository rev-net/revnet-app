import { TokenAmountType } from "@bananapus/nana-sdk-core";

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
