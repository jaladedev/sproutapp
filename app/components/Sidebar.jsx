"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: "◈" },
  { href: "/lands",         label: "Explore Lands", icon: "◉" },
  { href: "/portfolio",     label: "Portfolio",     icon: "◎" },
  { href: "/wallet",        label: "Wallet",        icon: "◈" },
  { href: "/referrals",     label: "Referrals",     icon: "◇" },
  { href: "/notifications", label: "Alerts",        icon: "◆" },
  { href: "/settings",      label: "Settings",      icon: "◐" },
  { href: "/support",       label: "Support",       icon: "◑" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-40 transition-colors duration-300"
      style={{
        background: "var(--nav-bg)",
        borderRight: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Brand */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link href="/dashboard">
          <span className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-playfair)" }}>
            Sprout<span style={{ color: "var(--accent)" }}>vest</span>
          </span>
        </Link>
        {user && (
          <p className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>
            {user.email}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: active ? "var(--accent-glow)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: 15 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Appearance
          </span>
          <ThemeToggle size="sm" showLabel />
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-sm px-3 py-2 rounded-xl transition-colors"
          style={{ color: "var(--danger)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-bg)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}