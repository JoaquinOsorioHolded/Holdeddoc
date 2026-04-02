import type { ParsedParameter } from "@/types/endpoint";

export default function ParametersTable({
  parameters,
  title,
}: {
  parameters: ParsedParameter[];
  title: string;
}) {
  if (parameters.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 text-(--color-muted) uppercase tracking-wide">
        {title}
      </h3>
      <div className="border border-(--color-border) rounded-lg overflow-hidden">
        {parameters.map((param, i) => (
          <div
            key={param.name}
            className={`flex flex-col sm:flex-row sm:items-start gap-2 p-3 ${
              i > 0 ? "border-t border-(--color-border)" : ""
            }`}
          >
            <div className="sm:w-48 flex-shrink-0">
              <code className="text-sm font-mono font-medium">{param.name}</code>
              {param.required && (
                <span className="ml-2 text-[10px] font-medium text-red-500 uppercase">required</span>
              )}
            </div>
            <div className="flex-1 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-(--color-muted)">
                  {param.type}
                  {param.format ? ` (${param.format})` : ""}
                </span>
                {param.nullable && (
                  <span className="text-xs text-(--color-muted)">nullable</span>
                )}
              </div>
              {param.description && (
                <p className="text-(--color-muted) text-xs">{param.description}</p>
              )}
              {param.enum && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {param.enum.map((v) => (
                    <code key={v} className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                      {v}
                    </code>
                  ))}
                </div>
              )}
              {param.default !== undefined && (
                <div className="text-xs text-(--color-muted) mt-1">
                  Default: <code className="font-mono">{String(param.default)}</code>
                </div>
              )}
              {param.maximum !== undefined && (
                <div className="text-xs text-(--color-muted) mt-1">
                  Max: <code className="font-mono">{param.maximum}</code>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
