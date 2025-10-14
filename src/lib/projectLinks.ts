import { JBProjectMetadata } from "juice-sdk-core";

const linkFields = ["twitter", "telegram", "discord", "infoUri", "farcaster", "x"] as const;
type LinkField = (typeof linkFields)[number];

export interface ProjectLink {
  type: LinkField;
  label: string;
  url: string;
}

export function getProjectLinks(metadata?: JBProjectMetadata | null): ProjectLink[] {
  if (!metadata) return [];

  return Object.entries(metadata)
    .filter(([field]) => linkFields.includes(field as LinkField))
    .filter(([, value]) => value && value.toString().trim() !== "")
    .map(([field, value]) => formatLink(field, value.toString()))
    .filter(Boolean) as ProjectLink[];
}

function formatLink(type: string, value: string): ProjectLink | null {
  switch (type) {
    case "twitter":
    case "x":
      return { label: "X", url: formatTwitterUsername(value), type };
    case "telegram":
      return { label: "Telegram", url: formatUrl(value), type };
    case "discord":
      return { label: "Discord", url: formatUrl(value), type };
    case "infoUri":
      return { label: "Website", url: formatUrl(value), type };
    case "farcaster":
      return { label: "Farcaster", url: formatFarcasterUsername(value), type };
    default:
      return null;
  }
}

function formatTwitterUsername(url: string): string {
  return url.startsWith("http") ? url : `https://x.com/${url}`;
}

function formatUrl(url: string): string {
  return (url.startsWith("http") ? url : `https://${url}`).replace(/\/$/, "");
}

function formatFarcasterUsername(url: string): string {
  return url.startsWith("http") ? url : `https://farcaster.xyz/${url}`;
}
