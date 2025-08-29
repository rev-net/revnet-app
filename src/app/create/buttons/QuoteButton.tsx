import { Button } from "@/components/ui/button";
import { CheckCircle, FastForwardIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

type ButtonContentType = {
  text: string;
  icon: JSX.Element;
  className: string;
};

const getButtonContent = (
  isLoading: boolean,
  validBundle: boolean,
): ButtonContentType => {
  if (isLoading) {
    return {
      text: "Get quote",
      icon: (
        <FastForwardIcon className="h-4 w-4 fill-transparent ml-2 animate-spin" />
      ),
      className: "opacity-70",
    };
  }

  if (validBundle) {
    return {
      text: "Quote complete",
      icon: <CheckCircle className="h-4 w-4 text-emerald-500 ml-2" />,
      className: "bg-emerald-50",
    };
  }

  return {
    text: "Get quote",
    icon: <FastForwardIcon className="h-4 w-4 fill-transparent ml-2" />,
    className: "",
  };
};

interface QuoteButtonProps {
  isLoading: boolean;
  validBundle: boolean;
  onSubmit: () => void;
}

export function QuoteButton({
  isLoading,
  validBundle,
  onSubmit,
}: QuoteButtonProps) {
  const buttonContent = getButtonContent(isLoading, validBundle);

  return (
    <Button
      type="submit"
      size="lg"
      disabled={isLoading}
      className={twMerge(
        "text-color-black bg-transparent border border-black hover:bg-zinc-100 disabled:bg-gray-100 w-[220px]",
        buttonContent.className,
      )}
      onClick={onSubmit}
    >
      {buttonContent.text}
      {buttonContent.icon}
    </Button>
  );
}
