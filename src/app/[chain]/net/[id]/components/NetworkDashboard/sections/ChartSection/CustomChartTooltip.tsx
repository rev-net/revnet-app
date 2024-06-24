import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";

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
  const nativeTokenSymbol = useNativeTokenSymbol();
  if (active) {
    const value = payload?.[0].value ?? 0;

    return (
      <div className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-950 shadow-md ">
        <p>
          {value} {nativeTokenSymbol}
        </p>
      </div>
    );
  }

  return null;
};
