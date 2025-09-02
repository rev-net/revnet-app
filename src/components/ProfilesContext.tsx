"use client";

import { fetchProfiles, Profile } from "@/lib/profile";
import { useQuery } from "@tanstack/react-query";
import { createContext, PropsWithChildren, useCallback, useContext } from "react";
import { Address } from "viem";

type ProfilesContextType = {
  getProfile: (address: Address) => Profile | null;
};

const ProfilesContext = createContext<ProfilesContextType | null>(null);

export function ProfilesProvider(props: PropsWithChildren<{ addresses: Address[] }>) {
  const { children } = props;

  const { data: profiles } = useQuery({
    queryKey: ["profiles", props.addresses],
    queryFn: () => fetchProfiles(props.addresses),
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const getProfile = useCallback(
    (address: Address) => profiles?.[address.toLowerCase()] || null,
    [profiles],
  );

  return <ProfilesContext.Provider value={{ getProfile }}>{children}</ProfilesContext.Provider>;
}

export function useProfile(address?: Address) {
  const context = useContext(ProfilesContext);
  if (!address || !context) return null;

  return context.getProfile(address);
}
