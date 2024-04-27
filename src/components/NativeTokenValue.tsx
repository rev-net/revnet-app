import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { NATIVE_TOKEN_DECIMALS, formatUnits } from "juice-sdk-core";

/**
 * Format a native token value for display.
 */
export function NativeTokenValue({
  wei,
  decimals = 4,
}: {
  wei: bigint;
  decimals?: number;
}) {
  const symbol = useNativeTokenSymbol();

  return (
    <>
      {formatUnits(wei, NATIVE_TOKEN_DECIMALS, {
        fractionDigits: decimals,
      })}{" "}
      {symbol}
    </>
  );
}
