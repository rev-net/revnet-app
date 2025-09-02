import { formatDistance } from "date-fns";
import { JBRulesetData } from "juice-sdk-core";

export const CustomChartXTick = (props: {
  x?: number;
  y?: number;
  payload?: {
    index: number;
  };
  ruleset: JBRulesetData;
  renderData: { groupIdx: number; fc: number; date: Date }[];
}) => {
  const { x, y, payload } = props;
  const d = props.renderData[payload?.index ?? 1];
  if (d.groupIdx !== 0) return;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#71717A" fontSize={"0.75rem"}>
        {formatDistance(
          Number(props.ruleset.start) * 1000 + Number(props.ruleset.duration) * (d.fc - 2) * 1000,
          new Date(),
          {
            addSuffix: true,
          },
        )}
      </text>
    </g>
  );
};
