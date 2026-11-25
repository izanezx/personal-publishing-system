import type { ImageMetadata } from "astro";

export type PublicationImageSource = ImageMetadata | string;

export function isSafeRemoteMediaUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function mediaSourcePath(source: PublicationImageSource) {
  return typeof source === "string" ? source : source.src;
}

export function mediaSourceUrl(
  source: PublicationImageSource,
  site: string | URL
) {
  return new URL(mediaSourcePath(source), site).href;
}

export function sameMediaSource(
  left: PublicationImageSource,
  right: PublicationImageSource
) {
  return mediaSourcePath(left) === mediaSourcePath(right);
}
