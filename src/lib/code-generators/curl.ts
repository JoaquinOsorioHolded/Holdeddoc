import type { ParsedEndpoint } from "@/types/endpoint";

export function generateCurl(endpoint: ParsedEndpoint, serverUrl: string): string {
  const pathParams = endpoint.parameters.filter((p) => p.in === "path");
  const queryParams = endpoint.parameters.filter((p) => p.in === "query");

  let url = `${serverUrl}${endpoint.path}`;

  // Replace path params with examples
  for (const p of pathParams) {
    url = url.replace(`{${p.name}}`, (p.example as string) || `<${p.name}>`);
  }

  // Add query params
  if (queryParams.length > 0) {
    const qp = queryParams
      .filter((p) => p.required || p.example)
      .map((p) => `${p.name}=${p.example || `<${p.name}>`}`)
      .join("&");
    if (qp) url += `?${qp}`;
  }

  const lines: string[] = [
    `curl -X ${endpoint.method} "${url}" \\`,
    `  -H "Authorization: Bearer <your-api-key>" \\`,
    `  -H "Content-Type: application/json"`,
  ];

  // Add body for POST/PUT
  if (endpoint.requestBody && ["POST", "PUT"].includes(endpoint.method)) {
    if (endpoint.requestBody.contentType === "multipart/form-data") {
      // Remove Content-Type header and add -F flag
      lines[2] = `  -H "Accept: application/json"`;
      const fileField = endpoint.requestBody.schema.properties.find((p) => p.format === "binary");
      if (fileField) {
        lines.push(`  -F "${fileField.name}=@/path/to/file"`);
      }
    } else {
      const body = generateExampleBody(endpoint.requestBody.schema.properties);
      if (Object.keys(body).length > 0) {
        lines[2] += " \\";
        lines.push(`  -d '${JSON.stringify(body, null, 2)}'`);
      }
    }
  }

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
    case "string": return format === "date" ? "2024-01-15" : format === "date-time" ? "2024-01-15T10:00:00Z" : "string";
    case "integer": case "number": return 0;
    case "boolean": return false;
    case "array": return [];
    default: return {};
  }
}
