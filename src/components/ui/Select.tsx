"use client";
// src/components/ui/Select.tsx

import React, { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  searchable?: boolean;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  error,
  hint,
  required,
  disabled,
  fullWidth = false,
  searchable = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ width: fullWidth ? "100%" : "auto", display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
      {label && (
        <label style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", color: error ? "#ef4444" : "rgba(255,255,255,0.5)",
        }}>
          {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        style={{
          width: "100%", height: 40,
          padding: "0 36px 0 12px",
          background: "rgba(255,255,255,0.05)",
          border: `1.5px solid ${error ? "#ef4444" : open ? "#0d6efd" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 8,
          color: selected ? "white" : "rgba(255,255,255,0.3)",
          fontSize: 13,
          fontFamily: "'Lato', sans-serif",
          textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: open ? "0 0 0 3px rgba(13,110,253,0.15)" : "none",
          opacity: disabled ? 0.5 : 1,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.4)" strokeWidth="2"
          style={{
            position: "absolute", right: 10, top: "50%", transform: `translateY(-50%) rotate(${open ? "180deg" : "0deg"})`,
            transition: "transform 0.2s", pointerEvents: "none", flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0, right: 0,
          background: "#161b22",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          zIndex: 500,
          overflow: "hidden",
          animation: "selectDrop 0.15s ease",
          maxHeight: 280,
          display: "flex", flexDirection: "column",
        }}>
          <style>{`@keyframes selectDrop { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>

          {searchable && (
            <div style={{ padding: "8px 8px 4px" }}>
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari..."
                style={{
                  width: "100%", height: 32, padding: "0 10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6, color: "white", fontSize: 12,
                  outline: "none", fontFamily: "'Lato', sans-serif",
                }}
              />
            </div>
          )}

          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
                Tidak ada data
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    onChange?.(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  style={{
                    width: "100%", padding: "9px 14px",
                    background: option.value === value ? "rgba(13,110,253,0.15)" : "transparent",
                    color: option.value === value ? "#3b82f6" : option.disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.75)",
                    border: "none", cursor: option.disabled ? "not-allowed" : "pointer",
                    textAlign: "left", fontSize: 13,
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: option.value === value ? 700 : 400,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (option.value !== value && !option.disabled)
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (option.value !== value)
                      (e.currentTarget as HTMLElement).style.background = option.value === value ? "rgba(13,110,253,0.15)" : "transparent";
                  }}
                >
                  {option.label}
                  {option.value === value && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && <span style={{ fontSize: 11, color: "#ef4444" }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{hint}</span>}
    </div>
  );
}