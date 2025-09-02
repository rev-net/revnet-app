"use client";

import Image from "next/image";

export type MiniHeaderCardProps = {
  logoUri?: string;
  name?: string;
  infoUri?: string;
  projectId: string;
  handle?: string;
  peerChainId?: 1 | 10 | 8453 | 42161 | 84532 | 421614 | 11155111 | 11155420;
};

export default function MiniHeaderCard({
  logoUri,
  name,
  infoUri,
  projectId,
  handle,
  peerChainId,
}: MiniHeaderCardProps) {
  return (
    <div className="flex items-center gap-4 mb-2">
      {logoUri ? (
        <Image
          src={logoUri}
          alt={`${handle || "Project"} logo`}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 bg-zinc-100 rounded-full"></div>
      )}
      <div>
        <h3 className="text-lg font-bold">{name || handle || `Project ${projectId}`}</h3>
        <p className="text-sm text-zinc-500">{infoUri || "revnet.eth"}</p>
      </div>
    </div>
  );
}
