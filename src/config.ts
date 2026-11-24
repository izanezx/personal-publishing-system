import { resolveSiteSettings } from "@/lib/site-settings";

export const SITE = {
  ...resolveSiteSettings(),
  profile:
    (typeof process !== "undefined" && process.env?.PUBLIC_SOCIAL_GITHUB) ||
    (import.meta.env?.PUBLIC_SOCIAL_GITHUB ?? ""), // set in .env
  ogImage: "",
  lightAndDarkMode: true,
  showBackButton: true, // show back button in post detail
  showTagsInCards: true, // show tag pills at the bottom of post cards
  showCoverImages: false, // show cover images (OG) in post cards (requires pnpm build in dev mode)
  indexPostsGrid: false, // show recent/featured posts in grid layout on the home page (like /posts page)
  heroTerminalPrompt: {
    prefix: "~", // highlighted part on the left
    path: "/zanezx", // central prompt text
    suffix: "$", // terminal symbol on the right
  },
  backdropEffects: {
    cursorGlow: true, // cursor tracking with soft halo
    grain: true, // background visual noise layer
  },
  editPost: {
    enabled: true,
    text: "Edit this post",
    url:
      process.env.PUBLIC_EDIT_POST_URL ??
      import.meta.env?.PUBLIC_EDIT_POST_URL ??
      "",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "zh-CN", // html lang code. Set this empty and default will be "en"
  introAudio: {
    enabled: false, // show/hide intro player in home and compact player while navigating
    // src: path to file (relative to /public or absolute URL). Example: "/intro.mp3" or "https://example.com/stream"
    src: "",
    // src: "/audio/intro-web.mp3",
    isStream: true, // true for radio/live stream URLs (example: https://fluxfm.streamabc.net/flx-chillhop-mp3-128-8581707)
    label: "LOFI", // display label in player
    duration: 30, // duration in seconds (used for local files, ignored on streams)
  },
} as const;
