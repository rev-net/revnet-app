"use client";

import { useEffect, useState } from "react";
import { TierMedia } from "./shopLib";

type MediaKind = "image" | "video" | "audio" | "other";

function mediaKind(media: TierMedia | undefined, url: string): MediaKind {
  const mime = media?.mediaType?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  const path = (url.split(/[?#]/, 1)[0] ?? "").toLowerCase();
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(path) || url.startsWith("data:image/")) return "image";
  if (/\.(mp4|webm|mov|m4v|ogv)$/.test(path)) return "video";
  if (/\.(mp3|wav|ogg|m4a|aac|flac)$/.test(path)) return "audio";
  // An extension-less URL from the `image` field is an image — IPFS gateway
  // URLs carry no extension (website/ tierMediaKind parity).
  return url === media?.image ? "image" : "other";
}

/** A tier's media (image/video/audio), with a "#id" placeholder fallback. */
export function TierMediaPreview({
  media,
  tierId,
  alt,
  detail = false,
}: {
  media: TierMedia | undefined;
  tierId: number;
  alt: string;
  /** Larger, interactive rendering for the detail modal. */
  detail?: boolean;
}) {
  const source = media?.animationUrl || media?.image || "";
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);

  if (!source || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
        #{tierId}
      </div>
    );
  }

  const kind = mediaKind(media, source);

  if (kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={source}
        alt={alt}
        loading={detail ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        className={detail ? "max-h-96 w-full object-contain" : "h-full w-full object-contain"}
      />
    );
  }

  if (kind === "video") {
    return (
      <video
        src={source}
        poster={media?.animationUrl && media?.image ? media.image : undefined}
        aria-label={alt}
        controls={detail}
        muted={!detail}
        loop={!detail}
        autoPlay={!detail}
        playsInline
        preload={detail ? "metadata" : "none"}
        onError={() => setFailed(true)}
        className={detail ? "max-h-96 w-full object-contain" : "h-full w-full object-contain"}
      />
    );
  }

  if (kind === "audio" && detail) {
    return (
      <audio
        src={source}
        controls
        preload="none"
        aria-label={alt}
        className="w-full"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-zinc-100 text-xs text-zinc-500">
      <span aria-hidden="true" className="text-2xl">
        {kind === "audio" ? "♪" : "↗"}
      </span>
      {detail ? (
        <a href={source} target="_blank" rel="noreferrer" className="underline underline-offset-4">
          Open media
        </a>
      ) : (
        <span>{kind === "audio" ? "Audio" : "Media"}</span>
      )}
    </div>
  );
}
