import { etherscanLink, formatEthAddress } from "@/lib/utils";
import { useChain } from "juice-sdk-react";
import { twMerge } from "tailwind-merge";
import { ExternalLink } from "./ExternalLink";
import { Chain } from "viem";

const EtherscanLink: React.FC<
  React.PropsWithChildren<{
    value: string | undefined;
    className?: string;
    type?: "tx" | "address" | "token";
    truncateTo?: number;
    chain?: Chain
  }>
> = ({ className, value, type = "address", truncateTo, chain, children }) => {
  const connectedChain = useChain();
  const chainToLink = chain || connectedChain
  if (!value) return null;

  const renderValue = truncateTo
    ? formatEthAddress(value, { truncateTo })
    : value;

  return (
    <ExternalLink
      className={twMerge("hover:underline", className)}
      href={etherscanLink(value, {
        type,
        chain: chainToLink,
      })}
    >
      {children ?? renderValue}
    </ExternalLink>
  );
};

export default EtherscanLink;
