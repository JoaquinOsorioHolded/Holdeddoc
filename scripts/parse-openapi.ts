import * as fs from "fs";
import * as path from "path";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OpenAPISpec {
  openapi: string;
  info: { title: string; description: string; version: string };
  servers: { url: string; description: string }[];
  paths: Record<string, Record<string, OpenAPIOperation>>;
  components?: { schemas?: Record<string, unknown>; securitySchemes?: Record<string, unknown> };
}

interface OpenAPIOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: {
    required?: boolean;
    content: Record<string, { schema: Record<string, unknown> }>;
  };
  responses?: Record<string, { description: string; content?: Record<string, { schema: Record<string, unknown> }> }>;
  security?: Record<string, string[]>[];
}

interface OpenAPIParameter {
  name: string;
  in: string;
  required?: boolean;
  schema?: Record<string, unknown>;
  description?: string;
}

// ─── Slug utils ──────────────────────────────────────────────────────────────

function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function summaryToSlug(summary: string): string {
  return summary
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-");
}

// ─── Schema parsing ─────────────────────────────────────────────────────────

function resolveRef(ref: string, spec: OpenAPISpec): Record<string, unknown> {
  const parts = ref.replace("#/", "").split("/");
  let current: unknown = spec;
  for (const part of parts) {
    current = (current as Record<string, unknown>)[part];
  }
  return (current as Record<string, unknown>) || {};
}

function parseSchemaProperties(
  schema: Record<string, unknown>,
  spec: OpenAPISpec,
  requiredFields: string[] = []
): Array<{
  name: string;
  type: string;
  format?: string;
  nullable: boolean;
  required: boolean;
  description?: string;
  example?: unknown;
  enum?: string[];
  items?: { type: string; properties: unknown[]; required?: string[] };
  properties?: unknown[];
}> {
  if (schema.$ref) {
    schema = resolveRef(schema.$ref as string, spec);
  }

  const properties = (schema.properties || {}) as Record<string, Record<string, unknown>>;
  const schemaRequired = (schema.required || []) as string[];
  const allRequired = [...new Set([...requiredFields, ...schemaRequired])];

  return Object.entries(properties).map(([name, prop]) => {
    let resolvedProp = prop;
    if (prop.$ref) {
      resolvedProp = resolveRef(prop.$ref as string, spec);
    }

    const result: {
      name: string;
      type: string;
      format?: string;
      nullable: boolean;
      required: boolean;
      description?: string;
      example?: unknown;
      enum?: string[];
      items?: { type: string; properties: unknown[]; required?: string[] };
      properties?: unknown[];
    } = {
      name,
      type: (resolvedProp.type as string) || "object",
      nullable: (resolvedProp.nullable as boolean) || false,
      required: allRequired.includes(name),
    };

    if (resolvedProp.format) result.format = resolvedProp.format as string;
    if (resolvedProp.description) result.description = resolvedProp.description as string;
    if (resolvedProp.example !== undefined) result.example = resolvedProp.example;
    if (resolvedProp.enum) result.enum = resolvedProp.enum as string[];

    // Nested object
    if (resolvedProp.properties) {
      result.properties = parseSchemaProperties(resolvedProp as Record<string, unknown>, spec);
    }

    // Array items
    if (resolvedProp.type === "array" && resolvedProp.items) {
      const itemSchema = resolvedProp.items as Record<string, unknown>;
      const resolved = itemSchema.$ref ? resolveRef(itemSchema.$ref as string, spec) : itemSchema;
      result.items = {
        type: (resolved.type as string) || "object",
        properties: resolved.properties ? parseSchemaProperties(resolved as Record<string, unknown>, spec) : [],
      };
    }

    return result;
  });
}

// ─── Main parser ────────────────────────────────────────────────────────────

function parseOpenAPI(specPath: string) {
  const raw = fs.readFileSync(specPath, "utf-8");
  const spec: OpenAPISpec = JSON.parse(raw);

  const endpoints: Array<{
    operationId: string;
    method: string;
    path: string;
    tag: string;
    tagSlug: string;
    operationSlug: string;
    summary: string;
    description?: string;
    parameters: unknown[];
    requestBody?: unknown;
    responses: unknown[];
    security: { scheme: string; scopes: string[] }[];
  }> = [];

  const categoryMap = new Map<string, typeof endpoints>();

  for (const [pathStr, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (!operation || typeof operation !== "object" || !operation.summary) continue;

      const tag = operation.tags?.[0] || "Other";
      const tSlug = tagToSlug(tag);
      const opSlug = summaryToSlug(operation.summary || operation.operationId || "");

      // Parse parameters
      const parameters = (operation.parameters || []).map((p: OpenAPIParameter) => {
        const schema = p.schema || {};
        return {
          name: p.name,
          in: p.in,
          required: p.required || false,
          type: (schema.type as string) || "string",
          format: schema.format as string | undefined,
          default: schema.default,
          description: p.description,
          example: schema.example,
          enum: schema.enum as string[] | undefined,
          maximum: schema.maximum as number | undefined,
          nullable: (schema.nullable as boolean) || false,
        };
      });

      // Parse request body
      let requestBody = undefined;
      if (operation.requestBody) {
        const contentTypes = Object.keys(operation.requestBody.content || {});
        const contentType = contentTypes[0] || "application/json";
        const bodySchema = operation.requestBody.content?.[contentType]?.schema || {};

        requestBody = {
          required: operation.requestBody.required || false,
          contentType,
          schema: {
            type: (bodySchema.type as string) || "object",
            properties: parseSchemaProperties(bodySchema as Record<string, unknown>, spec, (bodySchema.required as string[]) || []),
            required: bodySchema.required as string[] | undefined,
          },
        };
      }

      // Parse responses
      const responses = Object.entries(operation.responses || {}).map(([statusCode, response]) => {
        const contentType = Object.keys(response.content || {})[0];
        const schema = contentType ? response.content?.[contentType]?.schema : undefined;

        return {
          statusCode,
          description: response.description,
          schema: schema
            ? {
                type: (schema.type as string) || "object",
                properties: parseSchemaProperties(schema as Record<string, unknown>, spec),
              }
            : undefined,
        };
      });

      // Parse security
      const security = (operation.security || []).map((sec: Record<string, string[]>) => {
        const [scheme, scopes] = Object.entries(sec)[0] || ["bearerAuth", []];
        return { scheme, scopes };
      });

      const endpoint = {
        operationId: operation.operationId || `${method}_${pathStr}`,
        method: method.toUpperCase(),
        path: pathStr,
        tag,
        tagSlug: tSlug,
        operationSlug: opSlug,
        summary: operation.summary || "",
        description: operation.description || undefined,
        parameters,
        requestBody,
        responses,
        security,
      };

      endpoints.push(endpoint);

      if (!categoryMap.has(tag)) {
        categoryMap.set(tag, []);
      }
      categoryMap.get(tag)!.push(endpoint);
    }
  }

  // Build categories
  const categories = Array.from(categoryMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, eps]) => ({
      name,
      slug: tagToSlug(name),
      endpoints: eps,
    }));

  const result = {
    info: {
      title: spec.info.title,
      description: spec.info.description,
      version: spec.info.version,
    },
    serverUrl: spec.servers?.[0]?.url || "https://api.holded.com",
    categories,
    endpoints,
  };

  return result;
}

// ─── Run for all locales ────────────────────────────────────────────────────

const locales = ["en", "es"] as const;

for (const locale of locales) {
  const specFile = `openapi-${locale}.json`;
  const specPath = path.resolve(__dirname, "..", specFile);

  if (!fs.existsSync(specPath)) {
    console.warn(`⚠ Skipping ${locale}: ${specFile} not found`);
    continue;
  }

  console.log(`\n📖 Parsing ${specFile}...`);
  const data = parseOpenAPI(specPath);
  console.log(`   Found ${data.endpoints.length} endpoints in ${data.categories.length} categories`);

  const withDesc = data.endpoints.filter((e) => e.description).length;
  console.log(`   ${withDesc} endpoints with descriptions`);

  const outputPath = path.resolve(__dirname, "..", "src", "data", `parsed-endpoints-${locale}.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`   ✅ Written to src/data/parsed-endpoints-${locale}.json`);
}

// Also generate the default (en) as the legacy file for backward compat
const enPath = path.resolve(__dirname, "..", "src", "data", "parsed-endpoints-en.json");
const legacyPath = path.resolve(__dirname, "..", "src", "data", "parsed-endpoints.json");
if (fs.existsSync(enPath)) {
  fs.copyFileSync(enPath, legacyPath);
  console.log("\n📋 Copied EN → parsed-endpoints.json (legacy fallback)");
}

console.log("\n🎉 Done!");
