"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Fuse from "fuse.js";
import MethodBadge from "@/components/ui/MethodBadge";
import type { ParsedCategory } from "@/types/endpoint";

interface SidebarProps {
  categories: ParsedCategory[];
  locale: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ categories, locale, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expandedTags, setExpandedTags] = useState<Set<string>>(() => {
    // Expand the active category (either on tag page or endpoint page)
    const activeTag = categories.find((c) =>
      pathname === `/${locale}/${c.slug}` || c.endpoints.some((ep) => pathname.includes(`/${c.slug}/`))
    );
    return new Set(activeTag ? [activeTag.slug] : []);
  });

  const fuse = useMemo(() => {
    const items = categories.flatMap((c) =>
      c.endpoints.map((ep) => ({
        ...ep,
        categoryName: c.name,
        categorySlug: c.slug,
      }))
    );
    return new Fuse(items, {
      keys: ["summary", "path", "method", "categoryName"],
      threshold: 0.4,
    });
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;

    const results = fuse.search(search);
    const matchedSlugs = new Set(results.map((r) => r.item.operationSlug));

    return categories
      .map((c) => ({
        ...c,
        endpoints: c.endpoints.filter((ep) => matchedSlugs.has(ep.operationSlug)),
      }))
      .filter((c) => c.endpoints.length > 0);
  }, [search, categories, fuse]);

  const toggleTag = (slug: string) => {
    const wasExpanded = expandedTags.has(slug);
    setExpandedTags((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    if (!wasExpanded) {
      router.push(`/${locale}/${slug}`);
    }
  };

  const isExpanded = (slug: string) => expandedTags.has(slug) || search.trim() !== "";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:sticky top-14 left-0 z-50 lg:z-0 h-[calc(100vh-3.5rem)] w-72 bg-(--color-sidebar-bg) border-r border-(--color-sidebar-border) flex flex-col transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Search */}
        <div className="p-3 border-b border-(--color-sidebar-border)">
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted)"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search endpoints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-(--color-sidebar-border) bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-(--color-sidebar-text) placeholder:text-(--color-muted)"
            />
          </div>
        </div>

        {/* Auth link */}
        <div className="px-3 pt-3">
          <Link
            href={`/${locale}/auth`}
            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
              pathname.includes("/auth")
                ? "bg-(--color-sidebar-active) text-blue-600 dark:text-blue-400 font-medium"
                : "text-(--color-sidebar-text) hover:bg-(--color-sidebar-hover)"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Authentication
            </div>
          </Link>
        </div>

        {/* Categories */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <div className="text-xs font-semibold text-(--color-muted) uppercase tracking-wider px-3 py-2">
            API Reference
          </div>
          {filteredCategories.map((category) => (
            <div key={category.slug} className="mb-1">
              <button
                onClick={() => toggleTag(category.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === `/${locale}/${category.slug}`
                    ? "bg-(--color-sidebar-active) text-blue-600 dark:text-blue-400 font-medium"
                    : "text-(--color-sidebar-text) hover:bg-(--color-sidebar-hover)"
                }`}
              >
                <span className="font-medium">{category.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-(--color-muted)">{category.endpoints.length}</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${isExpanded(category.slug) ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {isExpanded(category.slug) && (
                <div className="ml-2 pl-2 border-l border-(--color-sidebar-border)">
                  {category.endpoints.map((ep) => {
                    const href = `/${locale}/${category.slug}/${ep.operationSlug}`;
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={ep.operationId}
                        href={href}
                        onClick={onClose}
                        className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors ${
                          isActive
                            ? "bg-(--color-sidebar-active) text-blue-600 dark:text-blue-400 font-medium"
                            : "text-(--color-sidebar-text) hover:bg-(--color-sidebar-hover)"
                        }`}
                      >
                        <MethodBadge method={ep.method} size="sm" />
                        <span className="truncate">{ep.summary}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
