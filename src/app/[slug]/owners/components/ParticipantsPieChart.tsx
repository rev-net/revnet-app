"use client";

import { EthereumAddress } from "@/components/EthereumAddress";
import { Participant } from "@/generated/graphql";
import { formatPortion } from "@/lib/utils";
import { JBChainId, JBProjectToken } from "@bananapus/nana-sdk-core";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Address } from "viem";
import { UseTokenReturnType } from "wagmi";

const OWNER_COLOR = "#EE6F3A"; // peel-400
const OWNER_HOVER_COLOR = "#BD4513"; // peel-600

const CustomTooltip = ({
  payload,
  totalSupply,
}: {
  payload?: Array<{ payload: { address: Address; balance: JBProjectToken } }>;
  totalSupply: bigint;
}) => {
  if (!payload?.length) return null;

  const item = payload[0].payload;
  const portion = formatPortion(item.balance.value, totalSupply);

  return (
    <div className="bg-white px-5 py-3 text-sm border border-zinc-200 shadow-md">
      <EthereumAddress address={item.address} short />
      <div className="text-zinc-500">
        {item.balance.format()} tokens ({portion}%)
      </div>
    </div>
  );
};

export function ParticipantsPieChart({
  token,
  totalSupply,
  participants,
  showOwnerCount = false,
}: {
  token: UseTokenReturnType["data"] | null;
  totalSupply: bigint;
  participants: (Participant & { chains: JBChainId[] })[];
  showOwnerCount?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const pieChartData = useMemo(() => {
    return participants?.map((participant) => {
      return {
        address: participant?.address,
        balanceFormatted: new JBProjectToken(BigInt(participant?.balance)).toFloat(),
        balance: new JBProjectToken(BigInt(participant?.balance)),
      };
    });
  }, [participants]);

  // TODO maybe can remove this when balance=0 bug fixed in subgraph
  const totalBalance = participants?.reduce(
    (acc, participant) => acc + BigInt(participant?.balance),
    BigInt(0),
  );
  if (totalBalance === 0n) return null;

  return (
    <div className="relative h-[240px] w-full sm:h-[360px]">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            data={pieChartData}
            dataKey="balanceFormatted"
            nameKey="address"
            innerRadius="50%"
            outerRadius="90%"
            stroke="#F6FEF9"
            strokeWidth={1}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            isAnimationActive={false}
          >
            {pieChartData.map((item, index) => (
              <Cell
                key={item.address}
                fill={index === activeIndex ? OWNER_HOVER_COLOR : OWNER_COLOR}
                className="transition-colors duration-150"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip totalSupply={totalSupply} />} />
        </PieChart>
      </ResponsiveContainer>
      {showOwnerCount ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold leading-none text-black tabular-nums">
            {participants.length}
          </span>
          <span className="mt-2 text-sm uppercase text-melon-700">owners</span>
        </div>
      ) : null}
    </div>
  );
}
