import { useJBTokenContext } from "juice-sdk-react";
import { useTokenA } from "@/hooks/useTokenA";
import { useTokenBPrice } from "@/hooks/useTokenBPrice";
import { PriceIncreaseCountdown } from "../../../PriceIncreaseCountdown";
import StepChart from "./StepChart";

export function ChartSection() {
  const { token } = useJBTokenContext();
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
          <span className="text-base leading-tight text-zinc-500">
            {" "}
            (buys 1 {token?.data?.symbol})
          </span>
        </div>

        <PriceIncreaseCountdown />
      </div>

      <StepChart />
    </>
  );
}
