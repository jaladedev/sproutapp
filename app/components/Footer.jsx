"use client";

import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";

const appname = process.env.NEXT_PUBLIC_APP_NAME || "REU.ng";

const footerLinks = [
  {
    heading: "Account",
    links: [
      { label: "Settings", href: "/settings", authOnly: true },
      { label: "Support",  href: "/support" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Verify Certificate", href: "/verify" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        background: "#080f0c",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-48 pointer-events-none opacity-25"
        style={{ background: "radial-gradient(ellipse, #C8873A 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">

        {/* Desktop */}
        <div className="hidden md:grid md:grid-cols-[1.8fr_1fr_1fr_1fr] gap-10 mb-12">
          <BrandBlock user={user} appname={appname} />
          <LinkColumns user={user} />
        </div>

        {/* Mobile */}
        <div className="md:hidden mb-8">
          <div className="mb-8">
            <BrandBlock user={user} appname={appname} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <LinkColumns user={user} />
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs text-center sm:text-left" style={{ color: "rgba(255,255,255,0.6)" }}>
            © {new Date().getFullYear()} {appname}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>crafted by</span>
            <span
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: "1.25rem",
                background: "linear-gradient(90deg, #C8873A, #E8A850, #C8873A)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 3s linear infinite",
              }}
            >
              La Jade
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Rotating Tagline ───────────────────────────────────────── */

function TypingTagline() {
  const taglines = [
    "Land Investment, Reimagined.",
    "Real Estate Investing, Simplified.",
    "Invest in Land. One Unit at a Time.",
    "Own Real Estate. Build Wealth Globally.",
    "Start Small, Own Big.",
  ];

  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = taglines[index];
    let speed = isDeleting
  ? 30 + Math.random() * 20
  : 60 + Math.random() * 40;

    const timeout = setTimeout(() => {
      setText((prev) =>
        isDeleting
          ? current.substring(0, prev.length - 1)
          : current.substring(0, prev.length + 1)
      );

      // finished typing
      if (!isDeleting && text === current) {
        setTimeout(() => setIsDeleting(true), 1200); // pause before delete
      }

      // finished deleting
      if (isDeleting && text === "") {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % taglines.length);
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index]);

  return (
    <p
      className="text-sm leading-relaxed mb-5 max-w-xs flex items-center"
      style={{ color: "rgba(255,255,255,0.7)" }}
    >
      {text}
      <span className="ml-1" style={{ animation: "blink 1s infinite" }}>|</span>
    </p>
  );
}

/* ── Brand Block ────────────────────────────────────────────── */

function BrandBlock({ user, appname }) {
  return (
    <div>
      <Link href={user ? "/dashboard" : "/"} className="inline-flex items-center mb-4 group">
        <img
          src="/reu_ng_logo.png"
          alt={`${appname} logo`}
          className="h-16 w-auto transition-opacity group-hover:opacity-80"
          style={{ maxWidth: "180px", filter: "brightness(2.1)" }}
        />
      </Link>

      <TypingTagline />

      <div className="space-y-2.5">
        {[
          { icon: <MapPin size={12} />, text: "Ibadan, Oyo State, Nigeria" },
          { icon: <Mail size={12} />, text: `hello@${appname.toLowerCase()}` },
          { icon: <Phone size={12} />, text: "+234 808 132 5657" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
            <span className="shrink-0" style={{ color: "#C8873A" }}>{item.icon}</span>
            <span className="truncate">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Link Columns ───────────────────────────────────────────── */

function LinkColumns({ user }) {
  return (
    <>
      {footerLinks.map((col) => {
        const visibleLinks = col.links.filter((l) => !l.authOnly || user);
        return (
          <div key={col.heading}>
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] mb-3"
              style={{ color: "rgba(255,255,255,0.40)" }}
            >
              {col.heading}
            </p>
            <ul className="space-y-2.5">
              {visibleLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.60)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.60)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}