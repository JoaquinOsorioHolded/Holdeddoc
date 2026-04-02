import { notFound } from "next/navigation";
import Link from "next/link";
import parsedData from "@/data/parsed-endpoints.json";
import { locales } from "@/i18n/config";
import type { ParsedData, ParsedEndpoint } from "@/types/endpoint";
import EndpointHeader from "@/components/endpoint/EndpointHeader";
import ParametersTable from "@/components/endpoint/ParametersTable";
import RequestBodySchema from "@/components/endpoint/RequestBodySchema";
import ResponseSchema from "@/components/endpoint/ResponseSchema";
import CodeSnippets from "@/components/endpoint/CodeSnippets";
import TryItPlayground from "@/components/playground/TryItPlayground";
import { generateCurl } from "@/lib/code-generators/curl";
import { generateJavaScript } from "@/lib/code-generators/javascript";
import { generatePython } from "@/lib/code-generators/python";

const data = parsedData as unknown as ParsedData;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    data.endpoints.map((ep) => ({
      locale,
      tag: ep.tagSlug,
      operationId: ep.operationSlug,
    }))
  );
}

export default async function EndpointPage({
  params,
}: {
  params: Promise<{ locale: string; tag: string; operationId: string }>;
}) {
  const { locale, tag, operationId } = await params;

  const endpoint = data.endpoints.find(
    (ep) => ep.tagSlug === tag && ep.operationSlug === operationId
  ) as ParsedEndpoint | undefined;

  if (!endpoint) notFound();

  const category = data.categories.find((c) => c.slug === tag);
  const pathParams = endpoint.parameters.filter((p) => p.in === "path");
  const queryParams = endpoint.parameters.filter((p) => p.in === "query");
  const successResponses = endpoint.responses.filter((r) => r.statusCode.startsWith("2"));
  const errorResponses = endpoint.responses.filter((r) => !r.statusCode.startsWith("2"));

  const snippets = [
    { label: "cURL", language: "bash", code: generateCurl(endpoint, data.serverUrl) },
    { label: "JavaScript", language: "javascript", code: generateJavaScript(endpoint, data.serverUrl) },
    { label: "Python", language: "python", code: generatePython(endpoint, data.serverUrl) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-(--color-muted) mb-6">
        <Link href={`/${locale}`} className="hover:text-blue-600 transition-colors">API</Link>
        <span>/</span>
        <Link href={`/${locale}/${tag}`} className="hover:text-blue-600 transition-colors">{category?.name}</Link>
        <span>/</span>
        <span className="text-(--color-content-text)">{endpoint.summary}</span>
      </div>

      <EndpointHeader endpoint={endpoint} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left column: Documentation */}
        <div>
          {/* Parameters */}
          {pathParams.length > 0 && (
            <ParametersTable parameters={pathParams} title="Path Parameters" />
          )}
          {queryParams.length > 0 && (
            <ParametersTable parameters={queryParams} title="Query Parameters" />
          )}
          {pathParams.length === 0 && queryParams.length === 0 && !endpoint.requestBody && (
            <p className="text-sm text-(--color-muted) mb-6">No parameters required.</p>
          )}

          {/* Request Body */}
          {endpoint.requestBody && (
            <RequestBodySchema requestBody={endpoint.requestBody} />
          )}

          {/* Responses */}
          {successResponses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-(--color-muted) uppercase tracking-wide">
                Success Response
              </h3>
              {successResponses.map((r) => (
                <ResponseSchema key={r.statusCode} response={r} />
              ))}
            </div>
          )}

          {errorResponses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-(--color-muted) uppercase tracking-wide">
                Error Responses
              </h3>
              <div className="space-y-2">
                {errorResponses.map((r) => (
                  <div key={r.statusCode} className="flex items-start gap-3 p-3 rounded-lg border border-(--color-border)">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                      {r.statusCode}
                    </span>
                    <span className="text-sm text-(--color-muted)">{r.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Code & Playground */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-(--color-muted) uppercase tracking-wide">
              Code Examples
            </h3>
            <CodeSnippets snippets={snippets} />
          </div>

          <TryItPlayground endpoint={endpoint} serverUrl={data.serverUrl} />
        </div>
      </div>
    </div>
  );
}
