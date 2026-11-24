interface Window {
  theme?: {
    themeValue: string;
    setPreference: () => void;
    reflectPreference: () => void;
    getTheme: () => string;
    setTheme: (val: string) => void;
  };
}

// Per-entry alternates are set by the page route before rendering its layout.
declare namespace App {
  interface Locals {
    galleryEmbedCount?: number;
    entryAlternates?: import("./i18n/locales").LocaleAlternates;
  }
}
