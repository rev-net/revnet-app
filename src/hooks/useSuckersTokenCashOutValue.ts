import { ONE_ETHER } from "juice-sdk-core";
import { formatEther } from "viem";
import { useEtherPrice } from "./useEtherPrice";
import { useSuckersCashOutQuote } from "./useSuckersCashOutQuote";

/**
 * Return the current cashout value of one project token.
 */
export function useSuckersTokenCashOutValue({
  targetCurrency,
}: {
  targetCurrency: "eth" | "usd";
}) {
  const { data: ethPrice, isLoading: isEthLoading } = useEtherPrice();

  const {
    data: quote,
    isLoading: isQuoteLoading,
    errors,
  } = useSuckersCashOutQuote(ONE_ETHER);

  const loading = isQuoteLoading || isEthLoading;

  if (loading) {
    return {
      loading: true,
      data: undefined,
    };
  }

  const quoteEth = parseFloat(formatEther(quote ?? 0n));

  const data = targetCurrency === "eth" ? quoteEth : quoteEth * (ethPrice ?? 0);

  return {
    loading: false,
    data,
    errors,
  };
}
