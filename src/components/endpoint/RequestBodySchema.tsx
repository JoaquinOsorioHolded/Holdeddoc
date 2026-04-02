import type { ParsedRequestBody, ParsedSchemaProperty } from "@/types/endpoint";

function PropertyRow({ prop, depth = 0 }: { prop: ParsedSchemaProperty; depth?: number }) {
  return (
    <>
      <div className={`flex flex-col sm:flex-row sm:items-start gap-2 p-3 border-t border-(--color-border)`} style={{ paddingLeft: `${12 + depth * 16}px` }}>
        <div className="sm:w-48 flex-shrink-0">
          <code className="text-sm font-mono font-medium">{prop.name}</code>
          {prop.required && (
            <span className="ml-2 text-[10px] font-medium text-red-500 uppercase">required</span>
          )}
        </div>
        <div className="flex-1 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-(--color-muted)">
              {prop.type}
              {prop.format ? ` (${prop.format})` : ""}
            </span>
            {prop.nullable && <span className="text-xs text-(--color-muted)">nullable</span>}
          </div>
          {prop.description && <p className="text-(--color-muted) text-xs">{prop.description}</p>}
          {prop.enum && (
            <div className="flex flex-wrap gap-1 mt-1">
              {prop.enum.map((v) => (
                <code key={v} className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  {v}
                </code>
              ))}
            </div>
          )}
          {prop.example !== undefined && (
            <div className="text-xs text-(--color-muted) mt-1">
              Example: <code className="font-mono">{JSON.stringify(prop.example)}</code>
            </div>
          )}
        </div>
      </div>
      {/* Nested properties */}
      {prop.properties?.map((nested) => (
        <PropertyRow key={nested.name} prop={nested} depth={depth + 1} />
      ))}
      {/* Array item properties */}
      {prop.items?.properties?.map((nested) => (
        <PropertyRow key={(nested as ParsedSchemaProperty).name} prop={nested as ParsedSchemaProperty} depth={depth + 1} />
      ))}
    </>
  );
}

export default function RequestBodySchema({ requestBody }: { requestBody: ParsedRequestBody }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 text-(--color-muted) uppercase tracking-wide">
        Request Body
      </h3>
      <div className="text-xs text-(--color-muted) mb-2 flex items-center gap-2">
        <span className="font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
          {requestBody.contentType}
        </span>
        {requestBody.required && <span className="text-red-500">required</span>}
      </div>
      <div className="border border-(--color-border) rounded-lg overflow-hidden">
        {requestBody.schema.properties.map((prop) => (
          <PropertyRow key={prop.name} prop={prop} />
        ))}
      </div>
    </div>
  );
}
