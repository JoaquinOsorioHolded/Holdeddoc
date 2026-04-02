import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

export default async function AuthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">{dict.auth.title}</h1>
      <p className="text-(--color-muted) mb-8">{dict.auth.description}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{dict.auth.how_to}</h2>
        <pre className="bg-[#0f172a] text-gray-200 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <code>{`curl -X GET "https://api.holded.com/api/v2/invoices" \\
  -H "Authorization: Bearer <your-api-key>" \\
  -H "Content-Type: application/json"`}</code>
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{dict.auth.rate_limit}</h2>
        <div className="p-4 rounded-lg border border-(--color-border) bg-(--color-sidebar-bg)">
          <p className="text-sm">{dict.auth.rate_limit_desc}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-(--color-content-bg) border border-(--color-border)">
              <div className="text-lg font-bold text-blue-600">100</div>
              <div className="text-xs text-(--color-muted)">Requests / minute</div>
            </div>
            <div className="p-3 rounded-lg bg-(--color-content-bg) border border-(--color-border)">
              <div className="text-lg font-bold text-blue-600">Bearer</div>
              <div className="text-xs text-(--color-muted)">Auth type</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">{dict.auth.errors}</h2>
        <p className="text-sm text-(--color-muted) mb-4">{dict.auth.errors_desc}</p>
        <div className="space-y-3">
          {[
            { code: "400", title: "Bad Request", desc: "The request body or parameters are invalid." },
            { code: "401", title: "Unauthorized", desc: "Missing or invalid API key." },
            { code: "403", title: "Forbidden", desc: "The API key does not have the required permissions." },
            { code: "404", title: "Not Found", desc: "The requested resource was not found." },
            { code: "429", title: "Too Many Requests", desc: "Rate limit exceeded. Wait and retry." },
          ].map((err) => (
            <div key={err.code} className="flex items-start gap-3 p-3 rounded-lg border border-(--color-border)">
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                err.code.startsWith("4") ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700"
              }`}>
                {err.code}
              </span>
              <div>
                <div className="font-medium text-sm">{err.title}</div>
                <div className="text-xs text-(--color-muted)">{err.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Error Response Format</h3>
          <pre className="bg-[#0f172a] text-gray-200 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <code>{`{
  "type": "https://api.holded.com/problems/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid or missing API key"
}`}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}
