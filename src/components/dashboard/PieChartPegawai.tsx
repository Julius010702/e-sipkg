"use client";
// src/components/dashboard/PieChartPegawai.tsx

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────
export interface PegawaiData {
  name: string;
  value: number;
  color: string;
}

interface PieChartPegawaiProps {
  title: string;
  data: PegawaiData[];
  loading?: boolean;
  height?: number;
  showTotal?: boolean;
}

// ── Custom Tooltip ────────────────────────────────────────────
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: PegawaiData }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const total = payload.reduce((s, p) => s + p.value, 0);

  return (
    <div style={{
      background: "#161b22",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.payload.color }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{item.name}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: item.payload.color }}>{item.value.toLocaleString()}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
        {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}% dari total
      </div>
    </div>
  );
}

// ── Custom Legend ─────────────────────────────────────────────
function CustomLegend({ payload }: { payload?: { value: string; color: string; payload: PegawaiData }[] }) {
  if (!payload) return null;
  const total = payload.reduce((s, p) => s + p.payload.value, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 8px" }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{entry.value}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
              {entry.payload.value.toLocaleString()}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
              ({total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Custom Center Label ───────────────────────────────────────
function CenterLabel({ viewBox, total }: { viewBox?: { cx: number; cy: number }; total: number }) {
  if (!viewBox) return null;
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize={22} fontWeight={900}>
        {total.toLocaleString()}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10}>
        Total
      </text>
    </g>
  );
}

// ── Main Component ────────────────────────────────────────────
export function PieChartPegawai({
  title,
  data,
  loading = false,
  height = 280,
  showTotal = true,
}: PieChartPegawaiProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{
      background: "#0d1117",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "20px 20px 16px",
      height: "100%",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>{title}</h3>
        {showTotal && !loading && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
            Total: <span style={{ color: "white", fontWeight: 700 }}>{total.toLocaleString()}</span> pegawai
          </div>
        )}
      </div>

      {loading ? (
        <div style={{
          height, display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 12,
        }}>
          <div style={{
            width: height * 0.55, height: height * 0.55,
            borderRadius: "50%",
            background: "conic-gradient(rgba(255,255,255,0.05) 0deg, rgba(255,255,255,0.1) 360deg)",
            animation: "spin 1.5s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : total === 0 ? (
        <div style={{
          height, display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 8,
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="15" x2="16" y2="15" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Belum ada data</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={height * 0.22}
              outerRadius={height * 0.36}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={0.9} />
              ))}
              {showTotal && (
                <CenterLabel viewBox={{ cx: 0, cy: 0 }} total={total} />
              )}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={<CustomLegend />}
              layout="vertical"
              align="right"
              verticalAlign="middle"
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Preset data helpers ───────────────────────────────────────
export const COLORS_PEGAWAI = {
  PNS:  "#3b82f6",
  PPPK: "#8b5cf6",
  KURANG: "#ef4444",
  LEBIH:  "#f59e0b",
  SESUAI: "#10b981",
};

export function makePegawaiData(pns: number, pppk: number): PegawaiData[] {
  return [
    { name: "PNS",  value: pns,  color: COLORS_PEGAWAI.PNS  },
    { name: "PPPK", value: pppk, color: COLORS_PEGAWAI.PPPK },
  ];
}

export function makeKebutuhanData(kurang: number, lebih: number, sesuai: number): PegawaiData[] {
  return [
    { name: "Kurang", value: kurang, color: COLORS_PEGAWAI.KURANG },
    { name: "Lebih",  value: lebih,  color: COLORS_PEGAWAI.LEBIH  },
    { name: "Sesuai", value: sesuai, color: COLORS_PEGAWAI.SESUAI },
  ];
}