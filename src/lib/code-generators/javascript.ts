import type { ParsedEndpoint } from "@/types/endpoint";

export function generateJavaScript(endpoint: ParsedEndpoint, serverUrl: string): string {
  const pathParams = endpoint.parameters.filter((p) => p.in === "path");
  const queryParams = endpoint.parameters.filter((p) => p.in === "query");

  let url = `${serverUrl}${endpoint.path}`;
  for (const p of pathParams) {
    url = url.replace(`{${p.name}}`, `\${${p.name}}`);
  }

  const lines: string[] = [];

  // Path param variables
  if (pathParams.length > 0) {
    for (const p of pathParams) {
      lines.push(`const ${p.name} = "${p.example || `<${p.name}>`}";`);
    }
    lines.push("");
  }

  // Query params
  if (queryParams.length > 0) {
    const filtered = queryParams.filter((p) => p.required || p.example);
    if (filtered.length > 0) {
      lines.push("const params = new URLSearchParams({");
      for (const p of filtered) {
        lines.push(`  ${p.name}: "${p.example || `<${p.name}>`}",`);
      }
      lines.push("});");
      lines.push("");
    }
  }

  // Fetch options
  const hasBody = endpoint.requestBody && ["POST", "PUT"].includes(endpoint.method);
  const hasQuery = queryParams.some((p) => p.required || p.example);

  const urlStr = pathParams.length > 0 ? `\`${url}\`` : `"${url}"`;
  const fullUrl = hasQuery ? `${urlStr} + "?" + params` : urlStr;

  lines.push(`const response = await fetch(${fullUrl}, {`);
  lines.push(`  method: "${endpoint.method}",`);
  lines.push(`  headers: {`);
  lines.push(`    "Authorization": "Bearer <your-api-key>",`);
  if (endpoint.requestBody?.contentType !== "multipart/form-data") {
    lines.push(`    "Content-Type": "application/json",`);
  }
  lines.push(`  },`);

  if (hasBody && endpoint.requestBody?.contentType !== "multipart/form-data") {
    const body = generateExampleBody(endpoint.requestBody!.schema.properties);
    lines.push(`  body: JSON.stringify(${JSON.stringify(body, null, 4).split("\n").map((l, i) => i === 0 ? l : "  " + l).join("\n")}),`);
  }

  lines.push(`});`);
  lines.push("");
  lines.push(`const data = await response.json();`);
  lines.push(`console.log(data);`);

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
