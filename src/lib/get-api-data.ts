import type { ParsedData } from "@/types/endpoint";

import dataEN from "@/data/parsed-endpoints-en.json";
import dataES from "@/data/parsed-endpoints-es.json";

const datasets: Record<string, ParsedData> = {
  en: dataEN as unknown as ParsedData,
  es: dataES as unknown as ParsedData,
};

/**
 * Returns the parsed API data for the given locale.
 * Falls back to English if locale not found.
 */
export function getApiData(locale: string): ParsedData {
  return datasets[locale] || datasets.en;
}
