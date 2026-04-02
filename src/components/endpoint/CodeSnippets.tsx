"use client";

import { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import CopyButton from "@/components/ui/CopyButton";

interface CodeSnippetsProps {
  snippets: { label: string; language: string; code: string }[];
}

export default function CodeSnippets({ snippets }: CodeSnippetsProps) {
  const [active, setActive] = useState(0);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [active]);

  const current = snippets[active];

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between bg-[#1e293b] px-3 py-2">
        <div className="flex gap-1">
          {snippets.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setActive(i)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                active === i
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <CopyButton text={current.code} />
      </div>
      <pre className="!m-0 !rounded-t-none">
        <code ref={codeRef} className={`language-${current.language}`}>
          {current.code}
        </code>
      </pre>
    </div>
  );
}
