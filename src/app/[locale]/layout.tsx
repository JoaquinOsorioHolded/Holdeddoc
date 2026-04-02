import Shell from "@/components/layout/Shell";
import parsedData from "@/data/parsed-endpoints.json";
import { locales, isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import type { ParsedData } from "@/types/endpoint";

const data = parsedData as unknown as ParsedData;

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

  return (
    <Shell categories={data.categories} locale={locale}>
      {children}
    </Shell>
  );
}
