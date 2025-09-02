import { Ether } from "juice-sdk-core";
import { Dot, DotProps } from "recharts";

export const CustomChartDot = (
  props: DotProps & {
    payload?: {
      groupIdx: number;
      price: number;
    };
    currentPrice: Ether;
    datapointIndex: number;
  },
) => {
  const { cx, cy, payload } = props;
  if (
    payload?.groupIdx === props.datapointIndex &&
    `${payload?.price}` === props.currentPrice.toFloat().toFixed(4)
  ) {
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={7}
        fill="#f97316"
        stroke="#fff"
        strokeWidth={2}
        className="animate-pulse"
      />
    );
  }

  return null;
};
