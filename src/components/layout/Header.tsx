import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Header({
  locale,
  onToggleSidebar,
}: {
  locale: string;
  onToggleSidebar?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-(--color-border) bg-(--color-content-bg)/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/holded-icon.svg" alt="Holded" width={28} height={24} />
          <span className="font-semibold text-lg">Holded API</span>
          <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-mono">
            v2.0
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
