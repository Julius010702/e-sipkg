"use client";
// src/hooks/useToast.ts
// Wrapper hook untuk toast — memudahkan penggunaan di komponen

import { useCallback } from "react";
import { toast as hotToast } from "react-hot-toast";

interface ToastOptions {
  duration?: number;
}

interface UseToastReturn {
  success:  (msg: string, opts?: ToastOptions) => void;
  error:    (msg: string, opts?: ToastOptions) => void;
  info:     (msg: string, opts?: ToastOptions) => void;
  warning:  (msg: string, opts?: ToastOptions) => void;
  loading:  (msg: string) => string;
  dismiss:  (id?: string) => void;
  promise:  <T>(
    p: Promise<T>,
    msgs: { loading: string; success: string; error: string }
  ) => Promise<T>;
  // Shortcut untuk feedback API
  apiSuccess: (action?: string) => void;
  apiError:   (err?: unknown, fallback?: string) => void;
  saved:      () => void;
  deleted:    () => void;
}

export function useToast(): UseToastReturn {
  const success = useCallback((msg: string, opts?: ToastOptions) => {
    hotToast.success(msg, {
      duration: opts?.duration ?? 3500,
      style: {
        background: "#161b22",
        border: "1px solid rgba(16,185,129,0.25)",
        borderLeft: "3px solid #10b981",
        color: "white", fontSize: 13,
        fontFamily: "'Lato', sans-serif",
      },
      iconTheme: { primary: "#10b981", secondary: "#0d1117" },
    });
  }, []);

  const error = useCallback((msg: string, opts?: ToastOptions) => {
    hotToast.error(msg, {
      duration: opts?.duration ?? 5000,
      style: {
        background: "#161b22",
        border: "1px solid rgba(239,68,68,0.25)",
        borderLeft: "3px solid #ef4444",
        color: "white", fontSize: 13,
        fontFamily: "'Lato', sans-serif",
      },
      iconTheme: { primary: "#ef4444", secondary: "#0d1117" },
    });
  }, []);

  const info = useCallback((msg: string, opts?: ToastOptions) => {
    hotToast(msg, {
      duration: opts?.duration ?? 4000,
      icon: "ℹ️",
      style: {
        background: "#161b22",
        border: "1px solid rgba(59,130,246,0.25)",
        borderLeft: "3px solid #3b82f6",
        color: "white", fontSize: 13,
        fontFamily: "'Lato', sans-serif",
      },
    });
  }, []);

  const warning = useCallback((msg: string, opts?: ToastOptions) => {
    hotToast(msg, {
      duration: opts?.duration ?? 4000,
      icon: "⚠️",
      style: {
        background: "#161b22",
        border: "1px solid rgba(245,158,11,0.25)",
        borderLeft: "3px solid #f59e0b",
        color: "white", fontSize: 13,
        fontFamily: "'Lato', sans-serif",
      },
    });
  }, []);

  const loading = useCallback((msg: string) => {
    return hotToast.loading(msg, {
      style: {
        background: "#161b22",
        border: "1px solid rgba(59,130,246,0.25)",
        borderLeft: "3px solid #3b82f6",
        color: "white", fontSize: 13,
        fontFamily: "'Lato', sans-serif",
      },
      iconTheme: { primary: "#3b82f6", secondary: "#0d1117" },
    });
  }, []);

  const dismiss = useCallback((id?: string) => {
    hotToast.dismiss(id);
  }, []);

  const promise = useCallback(
    <T>(p: Promise<T>, msgs: { loading: string; success: string; error: string }) => {
      return hotToast.promise(p, msgs);
    },
    []
  );

  // ── Shortcut helpers ─────────────────────────────────────────

  const apiSuccess = useCallback(
    (action = "disimpan") => success(`Data berhasil ${action}`),
    [success]
  );

  const apiError = useCallback(
    (err?: unknown, fallback = "Terjadi kesalahan. Coba lagi.") => {
      const msg =
        err instanceof Error ? err.message :
        typeof err === "string" ? err :
        fallback;
      error(msg);
    },
    [error]
  );

  const saved   = useCallback(() => success("Data berhasil disimpan"), [success]);
  const deleted = useCallback(() => success("Data berhasil dihapus"), [success]);

  return {
    success, error, info, warning,
    loading, dismiss, promise,
    apiSuccess, apiError, saved, deleted,
  };
}