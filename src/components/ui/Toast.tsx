"use client";
// src/components/ui/Toast.tsx
// Gunakan bersama react-hot-toast yang sudah terinstall

import { Toaster, toast as hotToast } from "react-hot-toast";

// ── Toaster Provider (taruh di layout root) ───────────────────
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{ top: 76 }}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#161b22",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          color: "white",
          fontSize: 13,
          fontFamily: "'Lato', sans-serif",
          fontWeight: 500,
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          maxWidth: 380,
        },
        success: {
          iconTheme: { primary: "#10b981", secondary: "#0d1117" },
          style: {
            background: "#161b22",
            border: "1px solid rgba(16,185,129,0.25)",
            borderLeft: "3px solid #10b981",
          },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#0d1117" },
          style: {
            background: "#161b22",
            border: "1px solid rgba(239,68,68,0.25)",
            borderLeft: "3px solid #ef4444",
          },
        },
        loading: {
          iconTheme: { primary: "#3b82f6", secondary: "#0d1117" },
          style: {
            background: "#161b22",
            border: "1px solid rgba(59,130,246,0.25)",
            borderLeft: "3px solid #3b82f6",
          },
        },
      }}
    />
  );
}

// ── Toast helper functions ────────────────────────────────────
export const toast = {
  success: (msg: string) => hotToast.success(msg),
  error: (msg: string) => hotToast.error(msg),
  loading: (msg: string) => hotToast.loading(msg),
  dismiss: (id?: string) => hotToast.dismiss(id),
  promise: <T,>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string }
  ) => hotToast.promise(promise, msgs),

  // Custom info toast
  info: (msg: string) =>
    hotToast(msg, {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ) as unknown as string,
      style: {
        background: "#161b22",
        border: "1px solid rgba(59,130,246,0.25)",
        borderLeft: "3px solid #3b82f6",
        color: "white",
        fontSize: 13,
        fontFamily: "'Lato', sans-serif",
      },
    }),

  // Custom warning toast
  warning: (msg: string) =>
    hotToast(msg, {
      icon: "⚠️",
      style: {
        background: "#161b22",
        border: "1px solid rgba(245,158,11,0.25)",
        borderLeft: "3px solid #f59e0b",
        color: "white",
        fontSize: 13,
        fontFamily: "'Lato', sans-serif",
      },
    }),
};