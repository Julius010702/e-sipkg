"use client";
// src/components/ui/Table.tsx

import React, { useState } from "react";

export interface Column<T> {
  key: string;
  header: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  stickyHeader?: boolean;
  rowKey?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
}

export function Table<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = "Tidak ada data",
  striped = true,
  stickyHeader = false,
  rowKey,
  onRowClick,
  pagination,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(col: Column<T>) {
    if (!col.sortable) return;
    if (sortKey === col.key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(col.key); setSortDir("asc"); }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey]; const bv = (b as Record<string, unknown>)[sortKey];
        if (av == null) return 1; if (bv == null) return -1;
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : data;

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  return (
    <div>
      <div style={{
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            {/* Head */}
            <thead style={{
              background: "rgba(255,255,255,0.03)",
              position: stickyHeader ? "sticky" : "static",
              top: 0, zIndex: 1,
            }}>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col)}
                    style={{
                      padding: "11px 14px",
                      textAlign: col.align || "left",
                      fontSize: 11, fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "rgba(255,255,255,0.4)",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                      width: col.width,
                      cursor: col.sortable ? "pointer" : "default",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: col.align === "center" ? "center" : col.align === "right" ? "flex-end" : "flex-start" }}>
                      {col.header}
                      {col.sortable && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={sortKey === col.key ? "#3b82f6" : "rgba(255,255,255,0.2)"} strokeWidth="2.5">
                          {sortKey === col.key && sortDir === "asc"
                            ? <polyline points="18 15 12 9 6 15" />
                            : sortKey === col.key && sortDir === "desc"
                              ? <polyline points="6 9 12 15 18 9" />
                              : <><polyline points="18 15 12 9 6 15" opacity="0.4" /><polyline points="6 15 12 21 18 15" opacity="0.4" /></>
                          }
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{
                          height: 14, borderRadius: 4,
                          background: "rgba(255,255,255,0.06)",
                          animation: "shimmer 1.5s ease-in-out infinite",
                          width: `${60 + Math.random() * 30}%`,
                        }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ padding: "48px 24px", textAlign: "center" }}>
                    <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 10px", display: "block", opacity: 0.4 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                      </svg>
                      {emptyMessage}
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((row, i) => (
                  <tr
                    key={rowKey ? rowKey(row) : i}
                    onClick={() => onRowClick?.(row)}
                    style={{
                      background: striped && i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                      cursor: onRowClick ? "pointer" : "default",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (onRowClick) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = striped && i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent";
                    }}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{
                          padding: "11px 14px",
                          fontSize: 13,
                          color: "rgba(255,255,255,0.75)",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          textAlign: col.align || "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col.render
                          ? col.render((row as Record<string, unknown>)[col.key], row, i)
                          : String((row as Record<string, unknown>)[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total > pagination.pageSize && (
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 10,
          }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              Menampilkan {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} dari {pagination.total} data
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { label: "‹", page: pagination.page - 1, disabled: pagination.page <= 1 },
                ...Array.from({ length: totalPages }, (_, i) => ({ label: String(i + 1), page: i + 1, disabled: false }))
                  .filter((p) => Math.abs(p.page - pagination.page) <= 2),
                { label: "›", page: pagination.page + 1, disabled: pagination.page >= totalPages },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => !item.disabled && pagination.onChange(item.page)}
                  style={{
                    width: 30, height: 30,
                    border: `1px solid ${item.page === pagination.page ? "#0d6efd" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 6,
                    background: item.page === pagination.page ? "rgba(13,110,253,0.2)" : "transparent",
                    color: item.page === pagination.page ? "#3b82f6" : item.disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                    fontSize: 12, fontWeight: item.page === pagination.page ? 700 : 400,
                    cursor: item.disabled ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
    </div>
  );
}