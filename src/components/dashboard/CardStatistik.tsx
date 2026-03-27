"use client";
// src/components/dashboard/CardStatistik.tsx

import React from "react";

// ── Types ─────────────────────────────────────────────────────
export interface StatistikItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: { value: number; label?: string; type?: "up" | "down" | "neutral" };
  loading?: boolean;
  href?: string;
  suffix?: string;
}

interface CardStatistikProps {
  items: StatistikItem[];
  columns?: 2 | 3 | 4;
}

// ── Single Card ───────────────────────────────────────────────
function SingleCard({ item }: { item: StatistikItem }) {
  const content = (
    <div style={{
      background: "#0d1117",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "18px 20px",
      borderLeft: `3px solid ${item.color}`,
      transition: "all 0.2s ease",
      cursor: item.href ? "pointer" : "default",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px rgba(0,0,0,0.35)`;
        (e.currentTarget as HTMLElement).style.borderColor = `${item.color}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLElement).style.borderLeftColor = item.color;
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.4)",
          lineHeight: 1.4,
        }}>
          {item.label}
        </span>
        <div style={{
          width: 38, height: 38, flexShrink: 0,
          borderRadius: 10,
          background: `${item.color}18`,
          border: `1px solid ${item.color}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: item.color,
        }}>
          {item.icon}
        </div>
      </div>

      {/* Value */}
      {item.loading ? (
        <div style={{
          height: 30, width: "55%", borderRadius: 6,
          background: "rgba(255,255,255,0.07)",
          animation: "shimmer 1.5s ease-in-out infinite",
        }} />
      ) : (
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{
            fontSize: 28, fontWeight: 900, color: "white",
            lineHeight: 1, letterSpacing: "-0.02em",
          }}>
            {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
          </span>
          {item.suffix && (
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
              {item.suffix}
            </span>
          )}
        </div>
      )}

      {/* Change indicator */}
      {item.change && !item.loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {item.change.type !== "neutral" && (
            <span style={{
              display: "flex", alignItems: "center", gap: 3,
              fontSize: 11, fontWeight: 700,
              color: item.change.type === "up" || (item.change.value > 0 && item.change.type !== "down")
                ? "#10b981" : "#ef4444",
            }}>
              {item.change.value > 0 ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polyline points="18 15 12 9 6 15" strokeWidth="3" stroke="currentColor" fill="none" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polyline points="6 9 12 15 18 9" strokeWidth="3" stroke="currentColor" fill="none" />
                </svg>
              )}
              {Math.abs(item.change.value)}%
            </span>
          )}
          {item.change.label && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {item.change.label}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (item.href) {
    return (
      <a href={item.href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        {content}
      </a>
    );
  }
  return content;
}

// ── Grid Cards ────────────────────────────────────────────────
export function CardStatistik({ items, columns = 4 }: CardStatistikProps) {
  return (
    <>
      <style>{`@keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 16,
      }}
        className="card-statistik-grid"
      >
        <style>{`
          @media (max-width: 1024px) { .card-statistik-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 640px)  { .card-statistik-grid { grid-template-columns: 1fr !important; } }
        `}</style>
        {items.map((item, i) => (
          <SingleCard key={i} item={item} />
        ))}
      </div>
    </>
  );
}

// ── Preset icon helpers ───────────────────────────────────────
export const StatIcons = {
  guru: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  sekolah: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  kurang: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  lebih: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  chart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  jabatan: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  pns: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};