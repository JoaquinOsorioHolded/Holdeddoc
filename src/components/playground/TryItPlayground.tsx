"use client";

import { useState, useEffect } from "react";
import type { ParsedEndpoint } from "@/types/endpoint";

interface PlaygroundResponse {
  status: number;
  statusText: string;
  body: string;
  elapsed: number;
}

export default function TryItPlayground({
  endpoint,
  serverUrl,
}: {
  endpoint: ParsedEndpoint;
  serverUrl: string;
}) {
  const [apiKey, setApiKey] = useState("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [bodyValues, setBodyValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<PlaygroundResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("holded-api-key");
    if (saved) setApiKey(saved);
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    if (key) sessionStorage.setItem("holded-api-key", key);
  };

  const pathParams = endpoint.parameters.filter((p) => p.in === "path");
  const queryParams = endpoint.parameters.filter((p) => p.in === "query");

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);

    let url = `${serverUrl}${endpoint.path}`;
    for (const p of pathParams) {
      url = url.replace(`{${p.name}}`, paramValues[p.name] || "");
    }

    const activeQuery = queryParams.filter((p) => paramValues[p.name]);
    if (activeQuery.length > 0) {
      const qp = new URLSearchParams();
      for (const p of activeQuery) {
        qp.set(p.name, paramValues[p.name]);
      }
      url += `?${qp.toString()}`;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
    };

    let body: string | undefined;
    if (endpoint.requestBody && ["POST", "PUT"].includes(endpoint.method)) {
      headers["Content-Type"] = "application/json";
      const bodyObj: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(bodyValues)) {
        if (value) {
          try {
            bodyObj[key] = JSON.parse(value);
          } catch {
            bodyObj[key] = value;
          }
        }
      }
      body = JSON.stringify(bodyObj);
    }

    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: endpoint.method, url, headers, body }),
      });
      const data = await res.json();
      setResponse(data);
    } catch {
      setResponse({ status: 0, statusText: "Network Error", body: "Failed to connect", elapsed: 0 });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = response
    ? response.status >= 200 && response.status < 300
      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
      : "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
    : "";

  return (
    <div className="border border-(--color-border) rounded-xl overflow-hidden">
      <div className="bg-(--color-sidebar-bg) px-4 py-3 border-b border-(--color-border)">
        <h3 className="font-semibold text-sm">Try It</h3>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          This sends real requests to the Holded API. Use a test API key.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* API Key */}
        <div>
          <label className="text-xs font-medium text-(--color-muted) block mb-1">Authorization</label>
          <div className="flex gap-2">
            <span className="px-2 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-l border border-r-0 border-(--color-border) text-(--color-muted)">
              Bearer
            </span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => saveApiKey(e.target.value)}
              placeholder="your-api-key"
              className="flex-1 px-3 py-1.5 text-sm border border-(--color-border) rounded-r bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
            />
          </div>
        </div>

        {/* Path Parameters */}
        {pathParams.length > 0 && (
          <div>
            <label className="text-xs font-medium text-(--color-muted) block mb-2">Path Parameters</label>
            <div className="space-y-2">
              {pathParams.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <code className="text-xs font-mono w-32 flex-shrink-0">{p.name}</code>
                  <input
                    value={paramValues[p.name] || ""}
                    onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                    placeholder={String(p.example || p.name)}
                    className="flex-1 px-3 py-1.5 text-sm border border-(--color-border) rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Query Parameters */}
        {queryParams.length > 0 && (
          <div>
            <label className="text-xs font-medium text-(--color-muted) block mb-2">Query Parameters</label>
            <div className="space-y-2">
              {queryParams.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <code className="text-xs font-mono w-32 flex-shrink-0">
                    {p.name}
                    {p.required && <span className="text-red-500">*</span>}
                  </code>
                  {p.enum ? (
                    <select
                      value={paramValues[p.name] || ""}
                      onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-sm border border-(--color-border) rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">-- select --</option>
                      {p.enum.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={paramValues[p.name] || ""}
                      onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                      placeholder={String(p.example || p.default || p.type)}
                      className="flex-1 px-3 py-1.5 text-sm border border-(--color-border) rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Body */}
        {endpoint.requestBody && endpoint.requestBody.contentType !== "multipart/form-data" && (
          <div>
            <label className="text-xs font-medium text-(--color-muted) block mb-2">Request Body</label>
            <div className="space-y-2">
              {endpoint.requestBody.schema.properties.map((prop) => (
                <div key={prop.name} className="flex items-center gap-2">
                  <code className="text-xs font-mono w-32 flex-shrink-0">
                    {prop.name}
                    {prop.required && <span className="text-red-500">*</span>}
                  </code>
                  <input
                    value={bodyValues[prop.name] || ""}
                    onChange={(e) => setBodyValues({ ...bodyValues, [prop.name]: e.target.value })}
                    placeholder={prop.example !== undefined ? String(prop.example) : prop.type}
                    className="flex-1 px-3 py-1.5 text-sm border border-(--color-border) rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading || !apiKey}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
        >
          {loading ? "Sending..." : "Send Request"}
        </button>

        {/* Response */}
        {response && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${statusColor}`}>
                {response.status} {response.statusText}
              </span>
              <span className="text-xs text-(--color-muted)">{response.elapsed}ms</span>
            </div>
            <pre className="bg-[#0f172a] text-gray-200 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-96">
              <code>
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(response.body), null, 2);
                  } catch {
                    return response.body;
                  }
                })()}
              </code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
