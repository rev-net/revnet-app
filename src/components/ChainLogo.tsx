import { chainIdToLogo } from "@/app/constants";
import { JB_CHAINS } from "juice-sdk-core";
import { JBChainId } from "juice-sdk-react";
import Image from "next/image";

export const ChainLogo = ({
  chainId,
  width,
  height,
}: {
  chainId: JBChainId;
  width?: number;
  height?: number;
}) => {
  return (
    <Image
      src={chainIdToLogo[chainId]}
      alt={`${JB_CHAINS[chainId].name} Logo`}
      width={width ?? 20}
      height={height ?? 20}
      style={{
        minWidth: width ?? 20,
        minHeight: height ?? 20,
        flexShrink: 0,
      }}
    />
  );
};
