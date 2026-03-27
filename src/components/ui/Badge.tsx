"use client";
// src/components/ui/Badge.tsx

import React from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  style?: React.CSSProperties;
}

const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "rgba(255,255,255,0.12)" },
  primary: { bg: "rgba(13,110,253,0.15)", color: "#60a5fa", border: "rgba(13,110,253,0.25)" },
  success: { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
  warning: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.25)" },
  danger:  { bg: "rgba(239,68,68,0.15)",  color: "#f87171", border: "rgba(239,68,68,0.25)"  },
  info:    { bg: "rgba(6,182,212,0.15)",   color: "#22d3ee", border: "rgba(6,182,212,0.25)"   },
  purple:  { bg: "rgba(139,92,246,0.15)",  color: "#a78bfa", border: "rgba(139,92,246,0.25)"  },
};

export function Badge({ children, variant = "default", size = "md", dot = false, style }: BadgeProps) {
  const s = BADGE_STYLES[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: size === "sm" ? "2px 7px" : "3px 9px",
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 100,
      color: s.color,
      fontSize: size === "sm" ? 10 : 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
      whiteSpace: "nowrap",
      ...style,
    }}>
      {dot && (
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      )}
      {children}
    </span>
  );
}

// ── Status Badge helper ───────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    AKTIF: "success", NONAKTIF: "danger",
    PNS: "primary", PPPK: "purple",
    KURANG: "danger", LEBIH: "warning", SESUAI: "success",
    A: "success", B: "success", C: "info", D: "warning", E: "danger",
    SMA: "primary", SMK: "info", SLB: "purple",
  };
  return <Badge variant={map[status] || "default"} dot>{status}</Badge>;
}