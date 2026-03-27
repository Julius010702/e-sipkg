"use client";
// src/components/ui/Card.tsx

import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: number | string;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  accent?: string;
}

export function Card({
  children,
  title,
  description,
  header,
  footer,
  padding = "20px 24px",
  style,
  onClick,
  hoverable = false,
  accent,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        overflow: "hidden",
        cursor: onClick || hoverable ? "pointer" : "default",
        transition: hoverable ? "all 0.2s ease" : "none",
        borderTop: accent ? `2px solid ${accent}` : undefined,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          (e.currentTarget as HTMLElement).style.borderColor = accent ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.07)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }
      }}
    >
      {/* Custom header */}
      {header && (
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {header}
        </div>
      )}

      {/* Title + desc */}
      {(title || description) && !header && (
        <div style={{ padding: "16px 24px 0" }}>
          {title && (
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>{title}</h3>
          )}
          {description && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, lineHeight: 1.5 }}>{description}</p>
          )}
        </div>
      )}

      {/* Body */}
      <div style={{ padding }}>{children}</div>

      {/* Footer */}
      {footer && (
        <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.15)" }}>
          {footer}
        </div>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  change?: { value: number; label?: string };
  loading?: boolean;
}

export function StatCard({ label, value, icon, color = "#3b82f6", change, loading }: StatCardProps) {
  return (
    <div style={{
      background: "#0d1117",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      padding: "20px 20px",
      display: "flex", flexDirection: "column", gap: 12,
      borderLeft: `3px solid ${color}`,
      transition: "all 0.2s",
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: color,
          }}>
            {icon}
          </div>
        )}
      </div>
      {loading ? (
        <div style={{ height: 28, width: "60%", borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "shimmer 1.5s infinite" }} />
      ) : (
        <div style={{ fontSize: 26, fontWeight: 900, color: "white", lineHeight: 1 }}>{value}</div>
      )}
      {change && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
          <span style={{ color: change.value >= 0 ? "#10b981" : "#ef4444", fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
            {change.value >= 0 ? "▲" : "▼"} {Math.abs(change.value)}%
          </span>
          {change.label && <span style={{ color: "rgba(255,255,255,0.3)" }}>{change.label}</span>}
        </div>
      )}
      <style>{`@keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
    </div>
  );
}