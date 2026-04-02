import type { ParsedEndpoint } from "@/types/endpoint";

export function generatePython(endpoint: ParsedEndpoint, serverUrl: string): string {
  const pathParams = endpoint.parameters.filter((p) => p.in === "path");
  const queryParams = endpoint.parameters.filter((p) => p.in === "query");

  let url = `${serverUrl}${endpoint.path}`;
  for (const p of pathParams) {
    url = url.replace(`{${p.name}}`, `{${p.name}}`);
  }

  const lines: string[] = ["import requests", ""];

  lines.push(`url = f"${url}"`);

  // Headers
  lines.push(`headers = {`);
  lines.push(`    "Authorization": "Bearer <your-api-key>",`);
  if (endpoint.requestBody?.contentType !== "multipart/form-data") {
    lines.push(`    "Content-Type": "application/json",`);
  }
  lines.push(`}`);

  // Path params
  if (pathParams.length > 0) {
    lines.push("");
    for (const p of pathParams) {
      lines.push(`${p.name} = "${p.example || `<${p.name}>`}"`);
    }
  }

  // Query params
  const filteredQuery = queryParams.filter((p) => p.required || p.example);
  if (filteredQuery.length > 0) {
    lines.push("");
    lines.push(`params = {`);
    for (const p of filteredQuery) {
      lines.push(`    "${p.name}": "${p.example || `<${p.name}>`}",`);
    }
    lines.push(`}`);
  }

  // Body
  const hasBody = endpoint.requestBody && ["POST", "PUT"].includes(endpoint.method);
  if (hasBody && endpoint.requestBody?.contentType !== "multipart/form-data") {
    const body = generateExampleBody(endpoint.requestBody!.schema.properties);
    lines.push("");
    lines.push(`payload = ${pythonDict(body)}`);
  }

  // Request
  lines.push("");
  const method = endpoint.method.toLowerCase();
  const args = [`url`, `headers=headers`];
  if (filteredQuery.length > 0) args.push(`params=params`);
  if (hasBody && endpoint.requestBody?.contentType !== "multipart/form-data") args.push(`json=payload`);

  lines.push(`response = requests.${method}(${args.join(", ")})`);
  lines.push(`print(response.json())`);

  return lines.join("\n");
}

function generateExampleBody(properties: { name: string; type: string; example?: unknown; format?: string }[]): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const prop of properties) {
    if (prop.format === "binary") continue;
    body[prop.name] = prop.example ?? getDefaultValue(prop.type, prop.format);
  }
  return body;
}

function getDefaultValue(type: string, format?: string): unknown {
  switch (type) {
    case "string": return format === "date" ? "2024-01-15" : "string";
    case "integer": case "number": return 0;
    case "boolean": return false;
    case "array": return [];
    default: return {};
  }
}

function pythonDict(obj: Record<string, unknown>): string {
  const entries = Object.entries(obj)
    .map(([k, v]) => {
      const val = typeof v === "string" ? `"${v}"` : typeof v === "boolean" ? (v ? "True" : "False") : JSON.stringify(v);
      return `    "${k}": ${val}`;
    })
    .join(",\n");
  return `{\n${entries}\n}`;
}
