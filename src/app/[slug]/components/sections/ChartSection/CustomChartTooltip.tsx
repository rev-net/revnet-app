import { useTokenA } from "@/hooks/useTokenA";

export const CustomChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}) => {
  const tokenA = useTokenA();
  if (active) {
    const value = payload?.[0].value ?? 0;

    return (
      <div className="border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-950 shadow-md ">
        <p>
          {value} {tokenA.symbol}
        </p>
      </div>
    );
  }

  return null;
};
