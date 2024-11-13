import { ParticipantsQuery } from "@/generated/graphql";
import { UserTokenBalanceDatum } from "../../../UserTokenBalanceCard/UserTokenBalanceDatum";
import { formatPortion } from "@/lib/utils";
import { useAccount } from "wagmi";

export function YouSection({
  totalSupply,
  participants
}: {
  totalSupply: bigint;
  participants: ParticipantsQuery;
}) {
  const { address: accountAddress } = useAccount();
  const amountOwned = participants.participants.find((p) => p.wallet.id === accountAddress?.toLowerCase())?.balance || 0n;

  return (
    <div className="grid grid-cols-2 max-w-xl text-sm">
      {/* Left Column */}
      <div className="space-y-4">
        <div>
          <dt className="font-medium text-zinc-900">Balance</dt>
          <dd className="text-zinc-600">
            <UserTokenBalanceDatum />
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900">Current cash out value</dt>
          <dd className="text-zinc-600">$150.00</dd>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        <div>
          <dt className="font-medium text-zinc-900">Ownership</dt>
          <dd className="text-zinc-600">
            {formatPortion(BigInt(amountOwned), totalSupply)} %
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900">Current loan potential</dt>
          <dd className="text-zinc-600">$100.50</dd>
        </div>
      </div>
    </div>
  )
}
