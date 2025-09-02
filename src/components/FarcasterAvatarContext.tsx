"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Address } from "viem";

type FarcasterProfile = {
  identity?: string;
  displayName?: string;
  avatar?: string;
  address?: string;
  fid?: number;
  description?: string;
  status?: string | null;
  createdAt?: string;
  email?: string | null;
  location?: string | null;
  header?: string | null;
  contenthash?: string | null;
  platform?: string;
  links?: {
    farcaster?: {
      link?: string;
      handle?: string;
      sources?: string[];
    };
  };
  social?: {
    uid?: number;
    follower?: number;
    following?: number;
  };
};

type FarcasterProfilesContextType = Record<string, FarcasterProfile | null>;

const FarcasterProfilesContext = createContext<FarcasterProfilesContextType>({});

export function FarcasterProfilesProvider({
  addresses,
  children,
}: {
  addresses: string[];
  children: ReactNode;
}) {
  const [profiles, setProfiles] = useState<FarcasterProfilesContextType>({});

  useEffect(() => {
    if (!addresses.length) return;

    const normalized = Array.from(new Set(addresses.map((a) => a.toLowerCase()))).sort();

    const fetchProfiles = async () => {
      const result: FarcasterProfilesContextType = {};
      const chunkSize = 10;
      for (let i = 0; i < normalized.length; i += chunkSize) {
        const chunk = normalized.slice(i, i + chunkSize);
        const lookupMap: Record<string, string> = {};
        const ids = chunk.flatMap((addr) => {
          const lower = addr.toLowerCase();
          lookupMap[lower] = lower;
          return [`farcaster,${addr}`, `ethereum,${addr}`, `ens,${addr}`];
        });
        /*  const url = `/api/farcaster/profile?batch=${encodeURIComponent(
          JSON.stringify(ids)
        )}`; */
        const url = `https://api.web3.bio/profile/batch/${encodeURIComponent(JSON.stringify(ids))}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          for (const item of data) {
            const match =
              Object.keys(lookupMap).find(
                (lookupAddr) => item.address?.toLowerCase() === lookupAddr,
              ) ?? item.address?.toLowerCase();

            if (!match) continue;

            const platformPriority: Record<string, number> = {
              farcaster: 3,
              ens: 2,
              ethereum: 1,
            };
            const current = result[match];
            const currentPriority = current?.platform ? platformPriority[current.platform] || 0 : 0;
            const newPriority = item.platform ? platformPriority[item.platform] || 0 : 0;

            if (!current || newPriority > currentPriority) {
              result[match] = item;
            }
          }
        } catch {
          // Skip this batch on error
        }
      }
      setProfiles(result);
    };

    fetchProfiles();
  }, [JSON.stringify([...new Set(addresses.map((a) => a.toLowerCase()))].sort()), addresses]);

  return (
    <FarcasterProfilesContext.Provider value={profiles}>
      {children}
    </FarcasterProfilesContext.Provider>
  );
}

export function useFarcasterProfile(address?: Address) {
  const profiles = useContext(FarcasterProfilesContext);
  if (!address) return null;
  const profile = profiles[address.toLowerCase()];
  if (!profile) return null;

  // Allow Farcaster profile even if the address doesn't match
  if (profile.platform === "farcaster") return profile;

  return profile.address?.toLowerCase() === address.toLowerCase() ? profile : null;
}
