"use client";
// src/components/landing/ContactInfo.tsx

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────
export interface ContactData {
  alamat?: string;
  telepon?: string;
  email?: string;
  websiteUrl?: string;
  namaUnit?: string;
  hakiInfo?: string;
}

// ── Hook ──────────────────────────────────────────────────────
function useVisible(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return visible;
}

// ── Contact Cards ─────────────────────────────────────────────
const CONTACT_ITEMS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Alamat",
    key: "alamat" as keyof ContactData,
    warna: "#3b82f6",
    href: (val: string) => `https://maps.google.com/?q=${encodeURIComponent(val)}`,
    defaultVal: "Jl. Frans Seda No. 2, Kupang\nNusa Tenggara Timur 85111",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.6 4.93 2 2 0 0 1 3.58 3H6.59a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.55a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.46 18l.46-1.08z" />
      </svg>
    ),
    label: "Telepon",
    key: "telepon" as keyof ContactData,
    warna: "#10b981",
    href: (val: string) => `tel:${val.replace(/\D/g, "")}`,
    defaultVal: "(0380) 823456",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "Email",
    key: "email" as keyof ContactData,
    warna: "#f59e0b",
    href: (val: string) => `mailto:${val}`,
    defaultVal: "disdikbudntt@gmail.com",
  },
];

// ── ContactInfo Component ─────────────────────────────────────
interface ContactInfoProps {
  data?: ContactData;
}

export function ContactInfo({ data }: ContactInfoProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const headerVisible = useVisible(headerRef);
  const cardsVisible = useVisible(cardsRef);
  const footerVisible = useVisible(footerRef as React.RefObject<HTMLElement>);

  const namaUnit = data?.namaUnit || "Dinas Pendidikan dan Kebudayaan Provinsi NTT";
  const hakiInfo = data?.hakiInfo || "© 2024 Dinas Pendidikan dan Kebudayaan Provinsi NTT. Hak Cipta Dilindungi.";

  const NAV_LINKS = ["Beranda", "Fitur", "Statistik", "Kontak"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&display=swap');
        .ci-card { transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
        .ci-card:hover { transform:translateY(-5px)!important; box-shadow:0 12px 32px rgba(0,0,0,0.3)!important; }
        .ci-footer-link { color:rgba(255,255,255,0.38); text-decoration:none; font-size:13px; transition:color .2s; }
        .ci-footer-link:hover { color:white; }
      `}</style>

      {/* ── Kontak Section ── */}
      <section id="kontak" style={{ padding: "0 28px 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
          <div
            ref={headerRef}
            style={{
              textAlign: "center", marginBottom: 52,
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#3b82f6", marginBottom: 12 }}>
              Hubungi Kami
            </div>
            <h2 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(22px, 3.5vw, 34px)",
              fontWeight: 700, color: "white", marginBottom: 10,
            }}>
              Informasi Kontak
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.38)", fontWeight: 300 }}>
              {namaUnit}
            </p>
          </div>

          {/* Kartu kontak */}
          <div
            ref={cardsRef}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
              opacity: cardsVisible ? 1 : 0,
              transform: cardsVisible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.7s 0.1s ease, transform 0.7s 0.1s ease",
            }}
          >
            {CONTACT_ITEMS.map((item, i) => {
              const val = (data?.[item.key] as string) || item.defaultVal;
              return (
                <a
                  key={i}
                  href={item.href(val)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ci-card"
                  style={{
                    padding: "26px 22px",
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    display: "flex", flexDirection: "column", gap: 12,
                    textDecoration: "none",
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${item.warna}18`,
                    border: `1px solid ${item.warna}28`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: item.warna,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: item.warna,
                      letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 5,
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: 14, color: "rgba(255,255,255,0.7)",
                      lineHeight: 1.65, whiteSpace: "pre-line",
                    }}>
                      {val}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        ref={footerRef as React.RefObject<HTMLElement>}
        style={{
          background: "rgba(0,0,0,0.35)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "44px 28px 28px",
          opacity: footerVisible ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Footer grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40, marginBottom: 36,
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 34, height: 34,
                  background: "linear-gradient(135deg, #1a4fa0, #0d6efd)",
                  borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(13,110,253,0.35)",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700, color: "white" }}>
                  E-SIPKG
                </div>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.85, fontWeight: 300 }}>
                Sistem Informasi Perhitungan Kebutuhan Guru SMA, SMK, dan SLB Provinsi Nusa Tenggara Timur.
              </p>
            </div>

            {/* Navigasi */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
                Navigasi
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {NAV_LINKS.map((label) => (
                  <a key={label} href={`#${label.toLowerCase()}`} className="ci-footer-link">
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Kontak ringkas */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
                Kontak
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {data?.telepon && (
                  <a href={`tel:${data.telepon.replace(/\D/g, "")}`} className="ci-footer-link">
                    📞 {data.telepon}
                  </a>
                )}
                {data?.email && (
                  <a href={`mailto:${data.email}`} className="ci-footer-link">
                    ✉ {data.email}
                  </a>
                )}
                {!data?.telepon && <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>📞 (0380) 823456</span>}
                {!data?.email && <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>✉ disdikbudntt@gmail.com</span>}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 10,
          }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)" }}>
              {hakiInfo}
            </span>
            <Link href="/login" style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "#3b82f6",
              textDecoration: "none", fontWeight: 700,
              transition: "color 0.2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3b82f6")}
            >
              Portal Login
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}