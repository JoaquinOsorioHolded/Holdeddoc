import Link from "next/link";
import { notFound } from "next/navigation";
import { getApiData } from "@/lib/get-api-data";
import { getDictionary } from "@/i18n/get-dictionary";
import { locales, type Locale } from "@/i18n/config";
import MethodBadge from "@/components/ui/MethodBadge";

const enData = getApiData("en");

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    enData.categories.map((cat) => ({ locale, tag: cat.slug }))
  );
}

export default async function TagPage({ params }: { params: Promise<{ locale: string; tag: string }> }) {
  const { locale, tag } = await params;
  const data = getApiData(locale);
  const dict = await getDictionary(locale as Locale);
  const category = data.categories.find((c) => c.slug === tag);

  if (!category) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      <p className="text-(--color-muted) mb-8">
        {category.endpoints.length} {dict.common.endpoints}
      </p>

      <div className="space-y-3">
        {category.endpoints.map((ep) => (
          <Link
            key={ep.operationId}
            href={`/${locale}/${tag}/${ep.operationSlug}`}
            className="group flex items-start gap-4 p-4 rounded-xl border border-(--color-border) hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
          >
            <MethodBadge method={ep.method} size="md" />
            <div className="flex-1 min-w-0">
              <div className="font-medium group-hover:text-blue-600 transition-colors">
                {ep.summary}
              </div>
              <div className="text-xs font-mono text-(--color-muted) mt-0.5 truncate">
                {ep.path}
              </div>
              {ep.description && (
                <p className="text-sm text-(--color-muted) mt-1.5 line-clamp-2">
                  {ep.description.replace(/\*\*[^*]+\*\*\s*/g, "").split("\n")[0]}
                </p>
              )}
            </div>
            {ep.security[0]?.scopes[0] && (
              <span className="hidden sm:inline text-xs px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-mono shrink-0">
                {ep.security[0].scopes[0]}
              </span>
            )}
            <svg
              className="w-4 h-4 text-(--color-muted) group-hover:text-blue-600 transition-colors shrink-0 mt-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
