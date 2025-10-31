import { chainIdToLogo } from "@/app/constants";
import { JB_CHAINS } from "juice-sdk-core";
import { JBChainId } from "juice-sdk-react";
import Image from "next/image";

type ImageProps = React.ComponentProps<typeof Image>;

type Props = {
  chainId: JBChainId;
} & Omit<ImageProps, "src" | "alt" | "title">;

export const ChainLogo = (props: Props) => {
  const { chainId, width, height, style, ...rest } = props;
  const chainName = JB_CHAINS[chainId].name;

  return (
    <Image
      {...rest}
      src={chainIdToLogo[chainId]}
      alt={`${chainName} Logo`}
      title={chainName}
      width={width ?? 20}
      height={height ?? 20}
      style={{
        minWidth: width ?? 20,
        minHeight: height ?? 20,
        flexShrink: 0,
        ...style,
      }}
    />
  );
};
