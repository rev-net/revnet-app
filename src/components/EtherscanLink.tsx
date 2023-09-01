import { etherscanLink, formatEthAddress } from "@/lib/juicebox/utils";
import { twMerge } from "tailwind-merge";
import { useNetwork } from "wagmi";
import { ExternalLink } from "./ExternalLink";

const EtherscanLink: React.FC<
  React.PropsWithChildren<{
    value: string | undefined;
    className?: string;
    type?: "tx" | "address";
    truncateTo?: number;
  }>
> = ({ className, value, type = "address", truncateTo, children }) => {
  const { chain } = useNetwork();

  if (!value) return null;

  const renderValue = truncateTo
    ? formatEthAddress(value, { truncateTo })
    : value;

  return (
    <ExternalLink
      className={twMerge("hover:underline", className)}
      href={etherscanLink(value, {
        type,
        chain,
      })}
    >
      {children ?? renderValue}
    </ExternalLink>
  );
};

export default EtherscanLink;
