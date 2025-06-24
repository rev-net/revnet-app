import { Button } from "@/components/ui/button";

interface SwapDirectionToggleProps {
  onReverse: () => void;
  className?: string;
}

export const SwapDirectionToggle = ({
  onReverse,
  className = "",
}: SwapDirectionToggleProps) => {
  return (
    <Button
      onClick={onReverse}
      variant="outline"
      size="icon"
      className={`p-2 rounded-full ${className}`}
      title="Reverse swap direction"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-600"
      >
        <path d="m7 16 3 3 3-3" />
        <path d="M10 19V4" />
        <path d="m17 8-3-3-3 3" />
        <path d="M14 5v15" />
      </svg>
    </Button>
  );
}; 