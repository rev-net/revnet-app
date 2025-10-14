"use server";

export type Profile = {
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
  links?: { farcaster?: { link?: string; handle?: string; sources?: string[] } };
  social?: { uid?: number; follower?: number; following?: number };
};

const priority: Record<string, number> = { farcaster: 3, ens: 2, ethereum: 1 };

export async function fetchProfiles(addresses: string[], chunkSize = 10) {
  const uniqueAddresses = Array.from(new Set(addresses.map((a) => a.toLowerCase()))).sort();
  const profiles: Record<string, Profile | null> = {};

  for (let i = 0; i < uniqueAddresses.length; i += chunkSize) {
    const chunk = uniqueAddresses.slice(i, i + chunkSize);
    const ids = chunk.flatMap((addr) => [`farcaster,${addr}`, `ethereum,${addr}`, `ens,${addr}`]);

    try {
      const res = await fetch(
        `https://api.web3.bio/profile/batch/${encodeURIComponent(JSON.stringify(ids))}`,
        { next: { revalidate: 60 * 60 * 24 } }, // Cache for 24 hours
      );

      if (!res.ok) {
        console.warn(`Failed to fetch profiles for batch ${i / chunkSize + 1}: ${res.status}`);
        continue;
      }

      const data = await res.json();

      for (const item of data) {
        const match = chunk.find((addr) => item.address?.toLowerCase() === addr);
        if (!match) continue;

        const current = profiles[match] ?? null;
        profiles[match] = selectPreferredProfile(current, item);
      }
    } catch (error) {
      console.error(`Error fetching profiles for batch ${i / chunkSize + 1}:`, error);
    }
  }

  return profiles;
}

export async function fetchProfile(address: string): Promise<Profile | null> {
  const addr = address.toLowerCase();
  try {
    const res = await fetch(`https://api.web3.bio/profile/${addr}`, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!res.ok) {
      console.warn(`Failed to fetch profile for ${addr}: ${res.status}`);
      return null;
    }

    const items = (await res.json()) as unknown;
    if (!Array.isArray(items)) return null;
    return (items as Profile[]).reduce<Profile | null>(
      (best, item) => selectPreferredProfile(best, item),
      null,
    );
  } catch (error) {
    console.error(`Error fetching profile for ${addr}:`, error);
    return null;
  }
}

function selectPreferredProfile(
  current: Profile | null | undefined,
  candidate: Profile | null | undefined,
): Profile | null {
  if (!current) return candidate ?? null;
  if (!candidate) return current ?? null;
  const currentPriority = getPlatformPriority(current.platform);
  const candidatePriority = getPlatformPriority(candidate.platform);
  return candidatePriority > currentPriority ? candidate : current;
}

function getPlatformPriority(platform?: string): number {
  return platform ? priority[platform] || 0 : 0;
}
