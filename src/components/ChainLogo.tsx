import { chainIdToLogo, chainNames } from "@/app/constants";
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
      alt={`${chainNames[chainId]} Logo`}
      width={width ?? 20}
      height={height ?? 20}
    />
  );
};
