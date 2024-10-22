import { EthereumAddress } from "@/components/EthereumAddress";
import { ParticipantsQuery } from "@/generated/graphql";
import { formatPortion } from "@/lib/utils";
import { JBProjectToken } from "juice-sdk-core";
import { useMemo } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Address } from "viem";
import { UseTokenReturnType } from "wagmi";

const COLORS = [
  "#1f77b4",
  "#aec7e8",
  "#ff7f0e",
  "#ffbb78",
  "#2ca02c",
  "#98df8a",
  "#d62728",
  "#ff9896",
  "#9467bd",
  "#c5b0d5",
  "#8c564b",
  "#c49c94",
  "#e377c2",
  "#f7b6d2",
  "#7f7f7f",
  "#c7c7c7",
  "#bcbd22",
  "#dbdb8d",
  "#17becf",
  "#9edae5",
];

const CustomTooltip = ({
  payload,
  totalSupply,
}: {
  payload?: Array<{
    payload: {
      address: Address;
      balance: JBProjectToken;
    };
  }>;
  totalSupply: bigint;
}) => {
  if (!payload?.length) return null;

  const item = payload[0].payload;
  const portion = formatPortion(item.balance.value, totalSupply);

  return (
    <div className="bg-white px-5 py-3 text-sm rounded-md border border-zinc-100 shadow-md">
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
}: {
  token: UseTokenReturnType["data"];
  totalSupply: bigint;
  participants: ParticipantsQuery;
}) {
  const pieChartData = useMemo(() => {
    return participants.participants.map((participant, idx) => {
      return {
        address: participant.wallet.id,
        balanceFormatted: new JBProjectToken(
          BigInt(participant.balance)
        ).toFloat(),
        balance: new JBProjectToken(BigInt(participant.balance)),
        fill: COLORS[idx % COLORS.length],
      };
    });
  }, [participants]);

  // TODO maybe can remove this when balance=0 bug fixed in subgraph
  const totalBalance = participants.participants.reduce(
    (acc, participant) => acc + BigInt(participant.balance),
    BigInt(0)
  );
  if (totalBalance === 0n) return null;

  return (
    <div style={{ width: "100%", height: 500 }}>
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            data={pieChartData}
            dataKey="balanceFormatted"
            nameKey="address"
            innerRadius="50%"
            isAnimationActive={false}
          />
          <Tooltip content={<CustomTooltip totalSupply={totalSupply} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
