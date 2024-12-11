import { ONE_ETHER } from "juice-sdk-core";
import { useSuckersTokenRedemptionQuote } from "./useSuckersTokenRedemptionQuote";
import { useEtherPrice } from "./useEtherPrice";
import { formatEther, parseEther } from "viem";

export function useCashOutValue({
  targetCurrency,
}: {
  targetCurrency: "eth" | "usd";
}) {
  const { data: ethPrice, isLoading: isEthLoading } = useEtherPrice();

  const { data: quote, isLoading: isQuoteLoading } =
    useSuckersTokenRedemptionQuote(ONE_ETHER);

  const loading = isQuoteLoading || isEthLoading;

  if (loading) {
    return {
      loading: true,
      data: undefined,
    };
  }

  const ethPriceEth = parseEther(ethPrice?.toString() ?? "0");
  const data =
    targetCurrency === "eth"
      ? formatEther(quote ?? 0n)
      : formatEther(quote ?? 0n * ethPriceEth);

  return {
    loading: false,
    data,
  };
}
