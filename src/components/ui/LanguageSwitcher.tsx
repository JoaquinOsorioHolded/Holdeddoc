"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = locales.find((l) => pathname.startsWith(`/${l}`)) || "en";

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join("/"));
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-(--color-border) p-0.5">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            currentLocale === locale
              ? "bg-blue-500 text-white"
              : "text-(--color-muted) hover:text-(--color-content-text)"
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
