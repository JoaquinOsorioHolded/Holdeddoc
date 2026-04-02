const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  DELETE: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  PATCH: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
};

export default function MethodBadge({ method, size = "sm" }: { method: string; size?: "sm" | "md" }) {
  const colors = METHOD_COLORS[method] || METHOD_COLORS.GET;
  const sizeClasses = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span className={`inline-block font-mono font-bold uppercase rounded border ${colors} ${sizeClasses}`}>
      {method}
    </span>
  );
}
