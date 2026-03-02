"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const mobileNav = [
  { href: "/dashboard",  label: "Home",      icon: "⌂" },
  { href: "/lands",      label: "Lands",     icon: "◉" },
  { href: "/portfolio",  label: "Portfolio", icon: "◎" },
  { href: "/wallet",     label: "Wallet",    icon: "◈" },
  { href: "/settings",   label: "Settings",  icon: "◐" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 pb-safe transition-colors duration-300 md:hidden"
      style={{
        background: "var(--nav-bg)",
        borderTop: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
        paddingTop: 8,
        paddingBottom: 12,
      }}
    >
      {mobileNav.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
            style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
          </Link>
        );
      })}
      {/* Theme toggle in mobile nav */}
      <div className="flex flex-col items-center gap-0.5 px-3 py-1">
        <ThemeToggle size="sm" />
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Theme</span>
      </div>
    </nav>
  );
}