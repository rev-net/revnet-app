import { useTokenA } from "@/hooks/useTokenA";
import { useTokenBPrice } from "@/hooks/useTokenBPrice";
import { PriceIncreaseCountdown } from "../../PriceIncreaseCountdown";

export function PriceSection() {
  const tokenA = useTokenA();

  const currentTokenBPrice = useTokenBPrice();

  return (
    <>
      <div className="mb-4">
        <div>
          {/* <div className="text-sm text-zinc-500">Current price</div> */}
          <span className="text-2xl">
            {currentTokenBPrice?.format(8)} {tokenA.symbol}
          </span>
        </div>

        <PriceIncreaseCountdown />
      </div>
    </>
  );
}
