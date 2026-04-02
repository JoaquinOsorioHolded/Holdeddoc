"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import type { ParsedCategory } from "@/types/endpoint";

export default function Shell({
  children,
  categories,
  locale,
}: {
  children: React.ReactNode;
  categories: ParsedCategory[];
  locale: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar
          categories={categories}
          locale={locale}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
