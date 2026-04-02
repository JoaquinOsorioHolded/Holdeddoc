"use client";

import { useState } from "react";

interface Tab {
  label: string;
  content: React.ReactNode;
}

export default function Tabs({ tabs, defaultIndex = 0 }: { tabs: Tab[]; defaultIndex?: number }) {
  const [active, setActive] = useState(defaultIndex);

  return (
    <div>
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              active === i
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-0">{tabs[active]?.content}</div>
    </div>
  );
}
