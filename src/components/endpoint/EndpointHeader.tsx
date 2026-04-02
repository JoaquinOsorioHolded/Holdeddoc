import MethodBadge from "@/components/ui/MethodBadge";
import type { ParsedEndpoint } from "@/types/endpoint";

function renderDescription(description: string) {
  // Simple markdown-ish rendering: bold, code, newlines
  const lines = description.split("\n").filter((l) => l.trim() !== "");

  return lines.map((line, i) => {
    // Replace **bold** with <strong>
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold text-(--color-content-text)">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={j} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-pink-600 dark:text-pink-400">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });

    return (
      <p key={i} className="text-sm text-(--color-muted) leading-relaxed">
        {parts}
      </p>
    );
  });
}

export default function EndpointHeader({ endpoint }: { endpoint: ParsedEndpoint }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <MethodBadge method={endpoint.method} size="md" />
        <code className="text-sm font-mono text-(--color-muted)">{endpoint.path}</code>
      </div>
      <h1 className="text-2xl font-bold mb-2">{endpoint.summary}</h1>

      {/* Description */}
      {endpoint.description && (
        <div className="space-y-1.5 mt-3 pl-0.5">
          {renderDescription(endpoint.description)}
        </div>
      )}

      {/* Security scopes */}
      {endpoint.security[0]?.scopes?.length > 0 && (
        <div className="flex items-center gap-2 mt-4">
          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="flex gap-1.5">
            {endpoint.security.flatMap((s) =>
              s.scopes.map((scope) => (
                <span
                  key={scope}
                  className="text-xs font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                >
                  {scope}
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
