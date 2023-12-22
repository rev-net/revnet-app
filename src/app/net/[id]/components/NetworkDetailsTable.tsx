import { EthereumAddress } from "@/components/EthereumAddress";
import { Address, formatUnits } from "viem";
import { useJBRulesetContext } from "../contexts/JBRulesetContext/JBRulesetContext";

export function NetworkDetailsTable({
  boost,
}: {
  boost:
    | {
        percent: bigint;
        beneficiary: `0x${string}`;
      }
    | undefined;
}) {
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  if (!ruleset?.data || !rulesetMetadata?.data) return null;

  return (
    <div className="grid grid-cols-2">
      <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0 grid grid-cols-2">
        <dt className="text-sm font-medium leading-6 text-gray-900">
          Entry curve
        </dt>
        <dd className="text-sm leading-6 text-gray-700">
          {ruleset.data.discountRate.formatPercentage()}%
        </dd>
      </div>
      <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0 grid grid-cols-2">
        <dt className="text-sm font-medium leading-6 text-gray-900">
          Exit curve
        </dt>
        <dd className="text-sm leading-6 text-gray-700">
          {rulesetMetadata.data.reservedRate.formatPercentage()}%
        </dd>
      </div>
      <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0 grid grid-cols-2">
        <dt className="text-sm font-medium leading-6 text-gray-900">Boost</dt>
        {boost ? (
          <dd className="text-sm leading-6 text-gray-700">
            {formatUnits(boost?.percent * 100n, 10)}%
          </dd>
        ) : null}
      </div>
      <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0 grid grid-cols-2">
        <dt className="text-sm font-medium leading-6 text-gray-900">
          Boost to
        </dt>
        <dd className="text-sm leading-6 text-gray-700">
          <EthereumAddress
            withEnsName
            address={boost?.beneficiary as Address}
          />
        </dd>
      </div>
    </div>
  );
}
