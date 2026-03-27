"use client";
// src/components/layout/LandingNavbar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";

interface LandingNavbarProps {
  accentColor?: string;
}

export function LandingNavbar({ accentColor = "#3b82f6" }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const NAV_LINKS = [
    { label: "Beranda", href: "#beranda" },
    { label: "Fitur",   href: "#fitur"   },
    { label: "Statistik", href: "#statistik" },
    { label: "Kontak",  href: "#kontak"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&display=swap');
        .lnav-link { color: rgba(255,255,255,0.55); text-decoration:none; font-size:13px; font-weight:500; transition:color .2s; }
        .lnav-link:hover { color:white; }
        @keyframes mobileSlide { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px",
        background: scrolled ? "rgba(10,15,30,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 36, height: 36,
            background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor})`,
            borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 14px ${accentColor}44`,
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", fontFamily: "'Cinzel',serif", letterSpacing: "0.05em" }}>E-SIPKG</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: -1 }}>Prov. NTT</div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="lnav-desktop">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} className="lnav-link">{l.label}</a>
          ))}
          <Link href="/login" style={{
            padding: "8px 20px",
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            color: "white", borderRadius: 8,
            textDecoration: "none", fontSize: 13, fontWeight: 700,
            boxShadow: `0 4px 14px ${accentColor}44`,
            transition: "all 0.2s",
            letterSpacing: "0.02em",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >
            Masuk
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 7, padding: 7, cursor: "pointer",
            color: "white",
          }}
          className="lnav-mobile-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            {mobileOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
            }
          </svg>
        </button>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div style={{
            position: "absolute", top: 64, left: 0, right: 0,
            background: "rgba(10,15,30,0.98)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 24px",
            animation: "mobileSlide 0.2s ease",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                style={{ padding: "11px 0", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {l.label}
              </a>
            ))}
            <Link href="/login" onClick={() => setMobileOpen(false)}
              style={{
                marginTop: 10, padding: "12px", textAlign: "center",
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                color: "white", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 700,
              }}>
              Masuk ke Sistem
            </Link>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .lnav-desktop { display: none !important; }
          .lnav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}