import type { ParsedResponse, ParsedSchemaProperty } from "@/types/endpoint";

function generateExampleJson(properties: ParsedSchemaProperty[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const prop of properties) {
    if (prop.type === "array" && prop.items) {
      if (prop.items.properties && (prop.items.properties as ParsedSchemaProperty[]).length > 0) {
        obj[prop.name] = [generateExampleJson(prop.items.properties as ParsedSchemaProperty[])];
      } else {
        obj[prop.name] = [];
      }
    } else if (prop.properties && prop.properties.length > 0) {
      obj[prop.name] = generateExampleJson(prop.properties);
    } else {
      obj[prop.name] = prop.example ?? getDefault(prop.type, prop.nullable);
    }
  }
  return obj;
}

function getDefault(type: string, nullable: boolean): unknown {
  if (nullable) return null;
  switch (type) {
    case "string": return "string";
    case "integer": case "number": return 0;
    case "boolean": return false;
    case "array": return [];
    default: return {};
  }
}

export default function ResponseSchema({ response }: { response: ParsedResponse }) {
  const statusColor = response.statusCode.startsWith("2")
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
    : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";

  const example = response.schema?.properties
    ? generateExampleJson(response.schema.properties)
    : null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${statusColor}`}>
          {response.statusCode}
        </span>
        <span className="text-sm text-(--color-muted)">{response.description}</span>
      </div>
      {example && (
        <pre className="bg-[#0f172a] text-gray-200 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <code>{JSON.stringify(example, null, 2)}</code>
        </pre>
      )}
    </div>
  );
}
