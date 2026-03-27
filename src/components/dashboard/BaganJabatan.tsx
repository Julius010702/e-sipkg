"use client";
// src/components/dashboard/BaganJabatan.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────
export interface JabatanNode {
  id: string;
  kodeJabatan: string;
  namaJabatan: string;
  jenisJabatan: "STRUKTURAL" | "FUNGSIONAL" | "PELAKSANA";
  pemangku?: string;
  jumlahPemangku?: number;
  progressAnjab?: number;
  children?: JabatanNode[];
}

interface BaganJabatanProps {
  data: JabatanNode[];
  onNodeClick?: (node: JabatanNode) => void;
  loading?: boolean;
}

// ── Warna & style per jenis jabatan ──────────────────────────
const JENIS_STYLE = {
  STRUKTURAL: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Struktural" },
  FUNGSIONAL: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Fungsional" },
  PELAKSANA:  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Pelaksana"  },
};

// ── Node Card ─────────────────────────────────────────────────
function NodeCard({
  node,
  onClick,
  isRoot = false,
}: {
  node: JabatanNode;
  onClick?: (n: JabatanNode) => void;
  isRoot?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const style = JENIS_STYLE[node.jenisJabatan];

  return (
    <div
      onClick={() => onClick?.(node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.06)" : "#0d1117",
        border: `1.5px solid ${hovered ? style.color : "rgba(255,255,255,0.1)"}`,
        borderTop: `3px solid ${style.color}`,
        borderRadius: 10,
        padding: "12px 14px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        minWidth: isRoot ? 200 : 160,
        maxWidth: isRoot ? 240 : 180,
        boxShadow: hovered ? `0 6px 20px rgba(0,0,0,0.35), 0 0 0 1px ${style.color}22` : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        userSelect: "none",
      }}
    >
      {/* Badge jenis */}
      <div style={{
        display: "inline-flex", alignItems: "center",
        padding: "2px 7px",
        background: style.bg,
        borderRadius: 100,
        fontSize: 9, fontWeight: 700,
        color: style.color,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 8,
      }}>
        {style.label}
      </div>

      {/* Nama jabatan */}
      <div style={{
        fontSize: isRoot ? 13 : 12,
        fontWeight: 700,
        color: "white",
        lineHeight: 1.35,
        marginBottom: 5,
      }}>
        {node.namaJabatan}
      </div>

      {/* Kode */}
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
        {node.kodeJabatan}
      </div>

      {/* Pemangku */}
      {node.pemangku && (
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 8px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 6, marginBottom: 6,
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            background: `${style.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 8, fontWeight: 700, color: style.color, flexShrink: 0,
          }}>
            {node.pemangku.charAt(0)}
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {node.pemangku}
          </span>
        </div>
      )}

      {node.jumlahPemangku !== undefined && !node.pemangku && (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
          {node.jumlahPemangku} pemangku
        </div>
      )}

      {/* Progress ANJAB */}
      {node.progressAnjab !== undefined && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>ANJAB</span>
            <span style={{ fontSize: 9, color: node.progressAnjab === 100 ? "#10b981" : "rgba(255,255,255,0.4)", fontWeight: 700 }}>
              {node.progressAnjab}%
            </span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${node.progressAnjab}%`,
              background: node.progressAnjab === 100 ? "#10b981" : style.color,
              borderRadius: 2,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      )}

      {/* Klik hint */}
      {onClick && hovered && (
        <div style={{ fontSize: 9, color: style.color, marginTop: 6, textAlign: "center" }}>
          Klik untuk ANJAB →
        </div>
      )}
    </div>
  );
}

// ── Tree Recursive ────────────────────────────────────────────
function TreeNode({
  node,
  onClick,
  depth = 0,
}: {
  node: JabatanNode;
  onClick?: (n: JabatanNode) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = !!node.children?.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Node */}
      <div style={{ position: "relative" }}>
        <NodeCard node={node} onClick={onClick} isRoot={depth === 0} />
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{
              position: "absolute", bottom: -10, left: "50%",
              transform: "translateX(-50%)",
              width: 20, height: 20,
              background: "#161b22",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.5)",
              zIndex: 1,
              transition: "all 0.2s",
              padding: 0,
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
            <svg
              width="10" height="10" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: expanded ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <>
          {/* Vertical connector */}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", marginTop: 10 }} />

          {/* Horizontal connector */}
          {node.children!.length > 1 && (
            <div style={{
              height: 1,
              width: `calc(${node.children!.length * 100}% - ${node.children!.length * 20}px)`,
              background: "rgba(255,255,255,0.1)",
              maxWidth: node.children!.length * 220,
            }} />
          )}

          {/* Children row */}
          <div style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: node.children!.length > 4 ? "wrap" : "nowrap",
            justifyContent: "center",
          }}>
            {node.children!.map((child) => (
              <div key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Down connector */}
                <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
                <TreeNode node={child} onClick={onClick} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export function BaganJabatan({ data, onNodeClick, loading = false }: BaganJabatanProps) {
  const router = useRouter();

  function handleClick(node: JabatanNode) {
    if (onNodeClick) {
      onNodeClick(node);
    } else {
      router.push(`/sekolah/jabatan/${node.id}/anjab`);
    }
  }

  if (loading) {
    return (
      <div style={{
        background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: "24px",
        minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40,
            border: "3px solid rgba(255,255,255,0.05)",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            margin: "0 auto 12px",
          }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Memuat bagan jabatan...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{
        background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: "48px 24px",
        textAlign: "center",
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"
          style={{ margin: "0 auto 12px", display: "block" }}>
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Belum ada data jabatan</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 6 }}>
          Tambahkan jabatan terlebih dahulu
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#0d1117",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>Bagan Struktur Jabatan</h3>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
            Klik jabatan untuk membuka form ANJAB
          </p>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", gap: 12 }}>
          {Object.entries(JENIS_STYLE).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: val.color }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{val.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart area — scrollable */}
      <div style={{
        padding: "28px 24px",
        overflowX: "auto",
        overflowY: "auto",
        minHeight: 280,
        maxHeight: 520,
      }}>
        <div style={{ minWidth: "max-content", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          {data.map((root) => (
            <TreeNode key={root.id} node={root} onClick={handleClick} depth={0} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sample data untuk testing ────────────────────────────────
export const SAMPLE_BAGAN: JabatanNode[] = [
  {
    id: "jab-kepala-sekolah",
    kodeJabatan: "S.001.KS",
    namaJabatan: "Kepala Sekolah",
    jenisJabatan: "STRUKTURAL",
    pemangku: "Drs. Yohannes Benu",
    progressAnjab: 100,
    children: [
      {
        id: "jab-wakasek-kurikulum",
        kodeJabatan: "S.001.WKK",
        namaJabatan: "Wakasek Kurikulum",
        jenisJabatan: "STRUKTURAL",
        pemangku: "Maria Takaeb",
        progressAnjab: 100,
        children: [
          {
            id: "jab-guru-mapel",
            kodeJabatan: "F.001.GM",
            namaJabatan: "Guru Mata Pelajaran",
            jenisJabatan: "FUNGSIONAL",
            jumlahPemangku: 24,
            progressAnjab: 85,
          },
        ],
      },
      {
        id: "jab-wakasek-kesiswaan",
        kodeJabatan: "S.001.WKS",
        namaJabatan: "Wakasek Kesiswaan",
        jenisJabatan: "STRUKTURAL",
        pemangku: "Thomas Lende",
        progressAnjab: 75,
        children: [
          {
            id: "jab-guru-bk",
            kodeJabatan: "F.001.GBK",
            namaJabatan: "Guru BK",
            jenisJabatan: "FUNGSIONAL",
            jumlahPemangku: 2,
            progressAnjab: 60,
          },
        ],
      },
      {
        id: "jab-kepala-tu",
        kodeJabatan: "S.001.KTU",
        namaJabatan: "Kepala TU",
        jenisJabatan: "STRUKTURAL",
        pemangku: "Agustinus Lelo",
        progressAnjab: 100,
        children: [
          {
            id: "jab-staf-tu",
            kodeJabatan: "P.001.STU",
            namaJabatan: "Staf TU",
            jenisJabatan: "PELAKSANA",
            jumlahPemangku: 3,
            progressAnjab: 40,
          },
        ],
      },
    ],
  },
];