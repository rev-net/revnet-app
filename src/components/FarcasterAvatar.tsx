"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import EtherscanLink from "@/components/EtherscanLink";
import { Address, Chain } from "viem";
import { useFarcasterProfile } from "@/components/FarcasterAvatarContext";
import { ensAvatarUrlForAddress } from "./EthereumAddress"; // or the correct relative path
import sdk from "@farcaster/frame-sdk";

// Assuming FarcasterProfile is defined in this file
interface FarcasterProfile {
  identity?: string;
  displayName?: string;
  avatar?: string;
  social?: {
    uid?: string;
  };
  platform?: string; // Added platform field
}

export default function FarcasterAvatar({
  address,
  short,
  withAvatar,
  avatarProps,
  className,
  chain,
}: {
  address: Address;
  short?: boolean;
  withAvatar?: boolean;
  avatarProps?: { size?: "sm" | "md" };
  className?: string;
  chain?: Chain;
}) {
  const profile = useFarcasterProfile(address);
  const formattedAddress = short
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  const renderValue =
    profile?.platform === "farcaster"
      ? profile.identity || profile.displayName || formattedAddress
      : profile?.displayName || profile?.identity || formattedAddress;

  const avatarSize = avatarProps?.size ?? "md";
  const avatarDimensions = avatarSize === "md" ? 36 : 24;

  const [useImgFallback, setUseImgFallback] = useState(false); // Added state for image fallback

  useEffect(() => {
    const init = async () => {
      if (sdk?.actions) {
        await sdk.actions.ready();
      }
    };
    init();
  }, []);

  const avatarSrc = profile?.avatar?.startsWith("http")
    ? profile.avatar
    : ensAvatarUrlForAddress(address, { size: avatarDimensions });

  const isSvg = avatarSrc.endsWith(".svg") || avatarSrc.includes("image/svg+xml");

  useEffect(() => {
    if (isSvg) setUseImgFallback(true);
  }, [avatarSrc, isSvg]);

  const avatarElement = useImgFallback ? (
    <Image
      src={avatarSrc}
      alt={profile?.identity ?? address}
      className={twMerge(
        "inline-block rounded-full",
        avatarSize === "md" ? "w-9 h-9" : "w-6 h-6",
        withAvatar && !profile?.social?.uid ? "mr-2" : ""
      )}
      width={avatarDimensions}
      height={avatarDimensions}
    />
  ) : (
    <Image
      src={avatarSrc}
      alt={profile?.identity ?? address}
      className={twMerge(
        "inline-block rounded-full",
        avatarSize === "md" ? "w-9 h-9" : "w-6 h-6",
        withAvatar && !profile?.social?.uid ? "mr-2" : ""
      )}
      width={avatarDimensions}
      height={avatarDimensions}
      onError={() => setUseImgFallback(true)}
    />
  );

  return (
    <div className={twMerge("inline-flex items-center", className)}>
      {withAvatar && profile?.platform === "farcaster" && profile.social?.uid ? (
        <button
          onClick={() => sdk.actions.viewProfile({ fid: Number(profile.social!.uid!) })} // Updated onClick
          className="mr-2"
        >
          {avatarElement}
        </button>
      ) : withAvatar ? (
        avatarElement
      ) : null}
      <EtherscanLink value={address} chain={chain}>
        {renderValue}
      </EtherscanLink>
    </div>
  );
}