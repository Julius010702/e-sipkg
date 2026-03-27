"use client";
// src/components/ui/Modal.tsx

import React, { useEffect } from "react";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  footer?: React.ReactNode;
  closeOnOverlay?: boolean;
}

const SIZES = {
  sm:   480,
  md:   600,
  lg:   760,
  xl:   960,
  full: "calc(100vw - 48px)",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
  closeOnOverlay = true,
}: ModalProps) {
  // Lock body scroll saat modal buka
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ESC untuk tutup
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      <style>{`
        @keyframes modalFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideIn { from { opacity: 0; transform: translateY(-16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* Overlay */}
      <div
        onClick={closeOnOverlay ? onClose : undefined}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          animation: "modalFadeIn 0.2s ease",
        }}
      />

      {/* Dialog */}
      <div
        style={{
          position: "relative", zIndex: 1,
          width: typeof SIZES[size] === "number" ? SIZES[size] : SIZES[size],
          maxWidth: "100%",
          maxHeight: "calc(100vh - 48px)",
          background: "#161b22",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column",
          animation: "modalSlideIn 0.2s ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        {(title || description) && (
          <div style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                {title && (
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: 0 }}>
                    {title}
                  </h2>
                )}
                {description && (
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4, lineHeight: 1.5 }}>
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 28, height: 28, flexShrink: 0,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 6, cursor: "pointer",
                  color: "rgba(255,255,255,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)";
                  (e.currentTarget as HTMLElement).style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: "14px 24px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex", justifyContent: "flex-end", gap: 10,
            flexShrink: 0,
            background: "rgba(0,0,0,0.2)",
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger" | "success";
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah Anda yakin?",
  confirmLabel = "Ya, Lanjutkan",
  confirmVariant = "danger",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: confirmVariant === "danger" ? "rgba(239,68,68,0.15)" : "rgba(13,110,253,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          {confirmVariant === "danger" ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{message}</p>
      </div>
    </Modal>
  );
}