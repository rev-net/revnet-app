import { PriceIncreaseCountdown } from "../../PriceIncreaseCountdown";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";

export function PriceSection() {
  const issuance = useFormattedTokenIssuance();

  return (
    <>
      <div className="mb-8">
        <div>
          {/* <div className="text-2xl font-semibold">Current issuance price</div> */}
          <span className="text-2xl">
            Issuing at {issuance}
          </span>
        </div>

        <PriceIncreaseCountdown />
      </div>
    </>
  );
}
