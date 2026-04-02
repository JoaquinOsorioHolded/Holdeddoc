import Link from "next/link";
import { getApiData } from "@/lib/get-api-data";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import MethodBadge from "@/components/ui/MethodBadge";

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = getApiData(locale);
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{dict.landing.welcome}</h1>
        <p className="text-lg text-(--color-muted) mb-6">{dict.landing.subtitle}</p>
        <div className="flex gap-3">
          <Link
            href={`/${locale}/auth`}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {dict.landing.get_started}
          </Link>
          <Link
            href={`/${locale}/${data.categories[0]?.slug}`}
            className="px-5 py-2.5 border border-(--color-border) rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {dict.landing.explore_api}
          </Link>
        </div>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-sidebar-bg)">
          <div className="text-2xl font-bold text-blue-600 mb-1">{data.endpoints.length}</div>
          <div className="text-sm text-(--color-muted)">Endpoints</div>
        </div>
        <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-sidebar-bg)">
          <div className="text-2xl font-bold text-blue-600 mb-1">{data.categories.length}</div>
          <div className="text-sm text-(--color-muted)">{dict.nav.categories}</div>
        </div>
        <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-sidebar-bg)">
          <div className="text-2xl font-bold text-blue-600 mb-1">REST</div>
          <div className="text-sm text-(--color-muted)">JSON API</div>
        </div>
      </div>

      {/* Categories grid */}
      <h2 className="text-2xl font-bold mb-6">{dict.nav.api_reference}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.categories.map((category) => (
          <Link
            key={category.slug}
            href={`/${locale}/${category.slug}`}
            className="group p-5 rounded-xl border border-(--color-border) hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <span className="text-xs text-(--color-muted)">
                {category.endpoints.length} {dict.common.endpoints}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {category.endpoints.slice(0, 4).map((ep) => (
                <span key={ep.operationId} className="flex items-center gap-1 text-xs text-(--color-muted)">
                  <MethodBadge method={ep.method} size="sm" />
                  <span className="truncate max-w-[150px]">{ep.summary}</span>
                </span>
              ))}
              {category.endpoints.length > 4 && (
                <span className="text-xs text-(--color-muted)">
                  +{category.endpoints.length - 4} more
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
