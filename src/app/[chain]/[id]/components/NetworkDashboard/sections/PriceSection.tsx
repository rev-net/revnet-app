import { useTokenA } from "@/hooks/useTokenA";
import { PriceIncreaseCountdown } from "../../PriceIncreaseCountdown";
import { useTokenBAmount } from "@/hooks/useTokenBAmount";
import { formatUnits } from "viem";
import { useJBTokenContext } from "juice-sdk-react";
import { formatTokenSymbol } from "@/lib/utils";

export function PriceSection() {
  const tokenA = useTokenA();
  const { token } = useJBTokenContext();
  const amountBQuote = useTokenBAmount();
  if (!amountBQuote?.payerTokens || !token?.data?.symbol) return;

  return (
    <>
      <div className="mb-8">
        <div>
          <div className="text-2xl font-semibold">Current Price</div>
          <span className="text-2xl">
            {formatUnits(amountBQuote?.payerTokens, tokenA.decimals)} {formatTokenSymbol(token)} per {tokenA.symbol}
          </span>
        </div>

        <PriceIncreaseCountdown />
      </div>
    </>
  );
}
