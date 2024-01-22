import { EthereumAddress } from "@/components/EthereumAddress";
import { ParticipantsQuery } from "@/generated/graphql";
import { formatPortion } from "@/lib/utils";
import { JBProjectToken } from "juice-sdk-core";
import { useMemo } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { FetchTokenResult } from "wagmi/dist/actions";

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
      address: string;
      balance: JBProjectToken;
    };
  }>;
  totalSupply: bigint;
}) => {
  if (!payload?.length) return null;

  const item = payload[0].payload;

  const portion = formatPortion(BigInt(item.balance.val), totalSupply);

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
  token: FetchTokenResult;
  totalSupply: bigint;
  participants: ParticipantsQuery;
}) {
  const pieChartData = useMemo(() => {
    return participants.participants.map((participant, idx) => {
      return {
        address: participant.wallet.id,
        balanceFormatted: new JBProjectToken(participant.balance).toFloat(),
        balance: new JBProjectToken(participant.balance),
        fill: COLORS[idx % COLORS.length],
      };
    });
  }, [participants]);

  return (
    <div style={{ width: "100%", height: 500 }}>
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            data={pieChartData}
            dataKey="balanceFormatted"
            nameKey="address"
            innerRadius="50%"
          />
          <Tooltip content={<CustomTooltip totalSupply={totalSupply} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
