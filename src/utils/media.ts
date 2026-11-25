import type { ImageMetadata } from "astro";

export type PublicationImageSource = ImageMetadata | string;

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
