import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

function HoldedLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bottom-left diamond */}
      <rect
        x="8"
        y="42"
        width="44"
        height="62"
        rx="8"
        transform="rotate(-45 30 73)"
        fill="#F25C54"
      />
      {/* Top-right diamond */}
      <rect
        x="40"
        y="10"
        width="44"
        height="62"
        rx="8"
        transform="rotate(-45 62 41)"
        fill="#F25C54"
      />
      {/* White diagonal line on bottom-left diamond */}
      <line
        x1="24"
        y1="52"
        x2="38"
        y2="90"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
          <HoldedLogo />
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
