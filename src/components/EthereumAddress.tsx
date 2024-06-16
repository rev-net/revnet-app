import { useEnsName } from "@/hooks/ens/useEnsName";
import { formatEthAddress } from "@/lib/utils";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import EtherscanLink from "./EtherscanLink";
import { Address } from "viem";

const STAMP_FYI_BASE_URL = "https://cdn.stamp.fyi";

export function ensAvatarUrlForAddress(
  address: string,
  { size }: { size?: number } = {}
) {
  let url = `${STAMP_FYI_BASE_URL}/avatar/${address}`;
  if (size) {
    url += `?s=${size}`;
  }
  return url;
}

export function EthereumAddress({
  address,
  short,
  withEnsName,
  withEnsAvatar,
  avatarProps,
  className,
}: {
  address: Address;
  short?: boolean;
  withEnsName?: boolean;
  withEnsAvatar?: boolean;
  avatarProps?: { size?: "sm" | "md" };
  className?: string;
}) {
  const { data } = useEnsName(address, { enabled: withEnsName });
  const formattedAddress = short ? formatEthAddress(address) : address;
  const ensName = data as string | undefined;

  const renderValue = ensName ?? formattedAddress;

  const avatarSize = avatarProps?.size ?? "md";
  const avatarDimensions = avatarSize === "md" ? 36 : 24;

  return (
    <EtherscanLink
      className={twMerge("inline-flex items-center", className)}
      value={address}
    >
      {withEnsAvatar && (
        <Image
          src={ensAvatarUrlForAddress(address)}
          alt={ensName ?? address}
          className={twMerge(
            "inline-block mr-1 rounded-full",
            avatarSize === "md" ? "w-9 h-9" : "w-6 h-6"
          )}
          width={avatarDimensions}
          height={avatarDimensions}
        />
      )}
      {renderValue}
    </EtherscanLink>
  );
}
