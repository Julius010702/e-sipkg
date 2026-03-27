"use client";
// src/components/ui/Button.tsx

import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "success" | "warning";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
    color: "white",
    border: "1px solid transparent",
    boxShadow: "0 4px 14px rgba(13,110,253,0.3)",
  },
  secondary: {
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  danger: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "1px solid transparent",
    boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
  },
  ghost: {
    background: "transparent",
    color: "rgba(255,255,255,0.6)",
    border: "1px solid transparent",
  },
  outline: {
    background: "transparent",
    color: "#0d6efd",
    border: "1px solid #0d6efd",
  },
  success: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "1px solid transparent",
    boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
  },
  warning: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "white",
    border: "1px solid transparent",
    boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
  },
};

const SIZES: Record<Size, React.CSSProperties> = {
  xs: { fontSize: 11, padding: "4px 10px", borderRadius: 6, height: 26 },
  sm: { fontSize: 12, padding: "6px 14px", borderRadius: 7, height: 32 },
  md: { fontSize: 13, padding: "8px 18px", borderRadius: 8, height: 38 },
  lg: { fontSize: 14, padding: "11px 24px", borderRadius: 10, height: 46 },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        fontFamily: "'Lato', sans-serif",
        fontWeight: 700,
        letterSpacing: "0.02em",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.55 : 1,
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        width: fullWidth ? "100%" : "auto",
        outline: "none",
        position: "relative",
        overflow: "hidden",
        ...VARIANTS[variant],
        ...SIZES[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (isDisabled) return;
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.filter = "brightness(1)";
      }}
      onMouseDown={(e) => {
        if (isDisabled) return;
        (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(0.98)";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      {...props}
    >
      {loading ? (
        <span style={{
          width: 14, height: 14,
          border: "2px solid rgba(255,255,255,0.3)",
          borderTopColor: "white",
          borderRadius: "50%",
          animation: "btnSpin 0.6s linear infinite",
          flexShrink: 0,
        }} />
      ) : leftIcon ? (
        <span style={{ display: "flex", flexShrink: 0 }}>{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && (
        <span style={{ display: "flex", flexShrink: 0 }}>{rightIcon}</span>
      )}
      <style>{`@keyframes btnSpin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}