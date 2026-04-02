"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import routeMap from "@/data/route-map.json";

const endpointMap = routeMap.endpoints as Record<
  string,
  Record<string, { tag: string; op: string }>
>;
const tagMap = routeMap.tags as Record<string, Record<string, string>>;

/**
 * Build reverse lookups:
 * - From (locale, tagSlug, opSlug) → operationId
 * - From (locale, tagSlug) → tag mapping
 */
function buildReverseLookup() {
  const map = new Map<string, string>(); // "locale/tag/op" → operationId
  for (const [opId, locales] of Object.entries(endpointMap)) {
    for (const [locale, route] of Object.entries(locales)) {
      map.set(`${locale}/${route.tag}/${route.op}`, opId);
    }
  }
  return map;
}

const reverseLookup = buildReverseLookup();

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = locales.find((l) => pathname.startsWith(`/${l}`)) || "en";

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    const segments = pathname.split("/").filter(Boolean);
    // segments: [locale, tag?, operationSlug?]
    const currentLang = segments[0];
    const currentTag = segments[1];
    const currentOp = segments[2];

    // Case 1: Endpoint page — /locale/tag/operationSlug
    if (currentTag && currentOp) {
      const key = `${currentLang}/${currentTag}/${currentOp}`;
      const operationId = reverseLookup.get(key);

      if (operationId && endpointMap[operationId]?.[newLocale]) {
        const target = endpointMap[operationId][newLocale];
        router.push(`/${newLocale}/${target.tag}/${target.op}`);
        return;
      }
    }

    // Case 2: Tag/category page — /locale/tag
    if (currentTag && !currentOp) {
      const targetTag = tagMap[currentTag]?.[newLocale];
      if (targetTag) {
        router.push(`/${newLocale}/${targetTag}`);
        return;
      }
    }

    // Case 3: Root or auth — just swap locale
    const newSegments = [...segments];
    newSegments[0] = newLocale;
    router.push(`/${newSegments.join("/")}`);
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
