"use client";
// src/components/jabatan/BaganOrgChart.tsx

import { useState, useCallback } from "react";

export interface OrgNode {
  id: string;
  kodeJabatan: string;
  namaJabatan: string;
  jenisJabatan: "STRUKTURAL" | "FUNGSIONAL" | "PELAKSANA";
  pemangku?: string;
  jumlahPemangku?: number;
  progressAnjab?: number;
  children?: OrgNode[];
}

interface BaganOrgChartProps {
  data: OrgNode[];
  onNodeClick?: (node: OrgNode) => void;
  loading?: boolean;
  title?: string;
}

const JENIS = {
  STRUKTURAL: { color: "#3b82f6", label: "Struktural" },
  FUNGSIONAL: { color: "#10b981", label: "Fungsional" },
  PELAKSANA:  { color: "#f59e0b", label: "Pelaksana"  },
};

// ── Node ──────────────────────────────────────────────────────
function OrgNodeCard({ node, onClick, isRoot }: { node: OrgNode; onClick?: (n: OrgNode) => void; isRoot?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const jenis  = JENIS[node.jenisJabatan] || JENIS.PELAKSANA;
  const pct    = node.progressAnjab ?? 0;

  return (
    <div
      onClick={() => onClick?.(node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#161b22" : "#0d1117",
        border: `1.5px solid ${hovered ? jenis.color : "rgba(255,255,255,0.09)"}`,
        borderTop: `3px solid ${jenis.color}`,
        borderRadius: 10,
        padding: isRoot ? "14px 16px" : "11px 13px",
        minWidth: isRoot ? 210 : 160,
        maxWidth: isRoot ? 250 : 190,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.18s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `0 6px 20px rgba(0,0,0,0.4), 0 0 0 1px ${jenis.color}22` : "none",
        userSelect: "none",
      }}
    >
      {/* Jenis badge */}
      <span style={{
        display: "inline-block", padding: "2px 7px",
        background: `${jenis.color}18`, color: jenis.color,
        borderRadius: 100, fontSize: 9, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 7,
      }}>
        {jenis.label}
      </span>

      <div style={{ fontSize: isRoot ? 13 : 11, fontWeight: 700, color: "white", lineHeight: 1.3, marginBottom: 4 }}>
        {node.namaJabatan}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginBottom: node.pemangku || node.jumlahPemangku !== undefined ? 7 : 0 }}>
        {node.kodeJabatan}
      </div>

      {(node.pemangku || node.jumlahPemangku !== undefined) && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: `${jenis.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: jenis.color }}>
            {node.pemangku ? node.pemangku.charAt(0) : node.jumlahPemangku}
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {node.pemangku || `${node.jumlahPemangku} pemangku`}
          </span>
        </div>
      )}

      {node.progressAnjab !== undefined && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.28)" }}>ANJAB</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: pct === 100 ? "#10b981" : pct > 0 ? "#f59e0b" : "rgba(255,255,255,0.3)" }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#10b981" : jenis.color, borderRadius: 2, transition: "width 0.5s" }} />
          </div>
        </div>
      )}

      {hovered && onClick && (
        <div style={{ fontSize: 9, color: jenis.color, marginTop: 6, textAlign: "center" }}>→ Buka ANJAB</div>
      )}
    </div>
  );
}

// ── Tree ──────────────────────────────────────────────────────
function TreeBranch({ node, onClick, depth = 0 }: { node: OrgNode; onClick?: (n: OrgNode) => void; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = !!node.children?.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative" }}>
        <OrgNodeCard node={node} onClick={onClick} isRoot={depth === 0} />
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
            style={{
              position: "absolute", bottom: -10, left: "50%",
              transform: "translateX(-50%)",
              width: 20, height: 20, borderRadius: "50%",
              background: "#161b22",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.5)",
              zIndex: 2, padding: 0, transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLElement).style.color = "white";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#161b22";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: expanded ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.09)", marginTop: 10 }} />
          {node.children!.length > 1 && (
            <div style={{
              height: 1,
              width: `calc(${(node.children!.length - 1) * 100}% + ${(node.children!.length - 1) * 16}px)`,
              background: "rgba(255,255,255,0.09)",
              maxWidth: node.children!.length * 210,
            }} />
          )}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "center", flexWrap: node.children!.length > 5 ? "wrap" : "nowrap" }}>
            {node.children!.map((child) => (
              <div key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.09)" }} />
                <TreeBranch node={child} onClick={onClick} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export function BaganOrgChart({ data, onNodeClick, loading = false, title = "Struktur Organisasi Jabatan" }: BaganOrgChartProps) {
  const [zoom, setZoom] = useState(1);
  const clampZoom = useCallback((v: number) => Math.min(1.5, Math.max(0.5, v)), []);

  if (loading) return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24, minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.05)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 10px" }} />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Memuat bagan...</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!data?.length) return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" style={{ margin: "0 auto 10px", display: "block" }}>
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Belum ada data jabatan</div>
    </div>
  );

  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>{title}</h3>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Klik node untuk membuka ANJAB</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Legend */}
          <div style={{ display: "flex", gap: 10, marginRight: 8 }}>
            {Object.entries(JENIS).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: v.color }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>{v.label}</span>
              </div>
            ))}
          </div>

          {/* Zoom controls */}
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { icon: "−", action: () => setZoom((z) => clampZoom(z - 0.1)) },
              { icon: "⊙", action: () => setZoom(1) },
              { icon: "+", action: () => setZoom((z) => clampZoom(z + 0.1)) },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} style={{
                width: 26, height: 26, borderRadius: 6,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)", cursor: "pointer",
                fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
              >{btn.icon}</button>
            ))}
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", paddingLeft: 4 }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 540, padding: "28px 32px" }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease", minWidth: "max-content" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            {data.map((root) => (
              <TreeBranch key={root.id} node={root} onClick={onNodeClick} depth={0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}