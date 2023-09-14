import { FixedInt, ReservedRate } from "fpnum";
import { parseEther, parseUnits } from "viem";
import { getTokenAToBQuote, getTokenBPrice } from "./utils";

describe("juicebox utils", () => {
  describe("getTokenAToBQuote", () => {
    it.each`
      tokenAAmount       | tokenADecimals | expectedPayerTokens
      ${1000000n}        | ${6}           | ${parseUnits("1", 18)}
      ${parseEther("1")} | ${18}          | ${parseUnits("1", 18)}
    `(
      "should return the correct token B quote when amount is $tokenAAmount and decimals is $tokenADecimals",
      ({ tokenAAmount, tokenADecimals, expectedPayerTokens }) => {
        const weight = FixedInt.parse<18>("1", 18); // 1 token per USDC
        const reservedRate = new ReservedRate(0n);
        const { payerTokens } = getTokenAToBQuote(
          new FixedInt(tokenAAmount, tokenADecimals),
          {
            weight,
            reservedRate,
          }
        );
        expect(payerTokens).toEqual(expectedPayerTokens);
      }
    );

    it.each`
      tokenADecimals | weight                       | expectedTokenBPrice
      ${18}          | ${FixedInt.parse("1", 18)}   | ${parseUnits("1", 18)}
      ${6}           | ${FixedInt.parse("1", 18)}   | ${parseUnits("1", 6)}
      ${18}          | ${FixedInt.parse("0.5", 18)} | ${parseUnits("2", 18)}
      ${6}           | ${FixedInt.parse("0.5", 18)} | ${parseUnits("2", 6)}
      ${6}           | ${FixedInt.parse("0.8", 18)} | ${parseUnits("1.25", 6)}
    `(
      "should return the correct token A quote when amount is $tokenBAmount and decimals is $tokenADecimals",
      ({ tokenADecimals, expectedTokenBPrice, weight }) => {
        const reservedRate = new ReservedRate(0n);
        const tokenBPrice = getTokenBPrice(tokenADecimals, {
          weight,
          reservedRate,
        });
        expect(tokenBPrice.toString()).toBe(expectedTokenBPrice.toString());
      }
    );
  });
});
