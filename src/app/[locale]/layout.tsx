import Shell from "@/components/layout/Shell";
import { getApiData } from "@/lib/get-api-data";
import { locales, isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const data = getApiData(locale);

  return (
    <Shell categories={data.categories} locale={locale}>
      {children}
    </Shell>
  );
}
