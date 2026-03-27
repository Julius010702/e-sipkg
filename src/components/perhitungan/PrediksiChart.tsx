"use client";
// src/components/perhitungan/PrediksiChart.tsx

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart,
} from "recharts";

export interface PrediksiPoint {
  tahun: string;
  prediksi: number;
  aktual?: number;
  tersedia?: number;
}

interface PrediksiChartProps {
  data: PrediksiPoint[];
  currentTahun?: string;
  loading?: boolean;
  title?: string;
  onGeneratePrediksi?: () => void;
}

// ── Custom Tooltip ────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#161b22", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"10px 14px", boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
      <div style={{ fontSize:12, fontWeight:700, color:"white", marginBottom:8 }}>Tahun {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }} />
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>{p.name}:</span>
          <span style={{ fontSize:12, fontWeight:700, color:"white" }}>{p.value.toFixed(1)} guru</span>
        </div>
      ))}
    </div>
  );
}

// ── Linear Regression ─────────────────────────────────────────
function generatePrediksi(historis: { tahun: string; kebutuhan: number }[], yearsFwd = 5): PrediksiPoint[] {
  if (historis.length < 2) return [];
  const n  = historis.length;
  const xs = historis.map((_, i) => i);
  const ys = historis.map((d) => d.kebutuhan);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  const num   = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0);
  const den   = xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
  const slope = den !== 0 ? num / den : 0;
  const inter = yMean - slope * xMean;

  const lastYear = parseInt(historis[historis.length - 1].tahun.split("/")[0]);
  return Array.from({ length: yearsFwd }, (_, i) => {
    const yr  = lastYear + i + 1;
    const idx = n + i;
    return {
      tahun: `${yr}/${yr + 1}`,
      prediksi: Math.max(0, parseFloat((slope * idx + inter).toFixed(1))),
    };
  });
}

export function PrediksiChart({
  data,
  currentTahun,
  loading = false,
  title = "Grafik Prediksi Kebutuhan Guru",
  onGeneratePrediksi,
}: PrediksiChartProps) {
  const [showArea, setShowArea] = useState(true);

  // Separate aktual vs prediksi
  const aktualData  = data.filter((d) => d.aktual  !== undefined);
  const predData    = data.filter((d) => d.prediksi !== undefined);

  // Merge untuk chart continuous
  const chartData = data.map((d) => ({
    tahun: d.tahun,
    Aktual:   d.aktual,
    Prediksi: d.prediksi,
    Tersedia: d.tersedia,
  }));

  if (loading) return (
    <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, minHeight:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36, height:36, border:"3px solid rgba(255,255,255,0.05)", borderTopColor:"#3b82f6", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 10px" }} />
        <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>Memuat grafik...</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!data.length) return (
    <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, minHeight:200, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" style={{ display:"block" }}>
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
      <div style={{ fontSize:13, color:"rgba(255,255,255,0.25)" }}>Belum ada data prediksi</div>
      {onGeneratePrediksi && (
        <button onClick={onGeneratePrediksi} style={{ padding:"8px 18px", background:"rgba(59,130,246,0.15)", border:"1px solid rgba(59,130,246,0.3)", borderRadius:7, color:"#60a5fa", fontSize:12, cursor:"pointer", fontFamily:"'Lato',sans-serif" }}>
          Generate Prediksi
        </button>
      )}
    </div>
  );

  return (
    <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h3 style={{ fontSize:13, fontWeight:700, color:"white", margin:0 }}>{title}</h3>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2 }}>
            {aktualData.length > 0 && `${aktualData.length} data historis`}
            {predData.length > 0 && ` · ${predData.length} tahun prediksi`}
          </p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button
            onClick={() => setShowArea(!showArea)}
            style={{ padding:"5px 12px", background: showArea ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)", border: showArea ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.08)", borderRadius:6, color: showArea ? "#60a5fa" : "rgba(255,255,255,0.4)", fontSize:11, cursor:"pointer", transition:"all 0.15s" }}
          >
            {showArea ? "Area" : "Line"}
          </button>
          {onGeneratePrediksi && (
            <button onClick={onGeneratePrediksi} style={{ padding:"5px 12px", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:6, color:"#10b981", fontSize:11, cursor:"pointer" }}>
              Perbarui
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding:"16px 8px 8px" }}>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top:5, right:20, left:0, bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="tahun"
              tick={{ fill:"rgba(255,255,255,0.4)", fontSize:10 }}
              axisLine={{ stroke:"rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill:"rgba(255,255,255,0.4)", fontSize:10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize:11, color:"rgba(255,255,255,0.5)", paddingTop:8 }}
            />

            {/* Garis pemisah aktual vs prediksi */}
            {currentTahun && (
              <ReferenceLine
                x={currentTahun}
                stroke="rgba(255,255,255,0.15)"
                strokeDasharray="4 3"
                label={{ value:"Sekarang", fill:"rgba(255,255,255,0.3)", fontSize:9, position:"insideTopRight" }}
              />
            )}

            {/* Area/Line Aktual */}
            {showArea ? (
              <Area type="monotone" dataKey="Aktual" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth={2} dot={{ r:4, fill:"#3b82f6", strokeWidth:0 }} activeDot={{ r:5 }} connectNulls />
            ) : (
              <Line type="monotone" dataKey="Aktual" stroke="#3b82f6" strokeWidth={2} dot={{ r:4, fill:"#3b82f6", strokeWidth:0 }} activeDot={{ r:5 }} connectNulls />
            )}

            {/* Area/Line Prediksi */}
            {showArea ? (
              <Area type="monotone" dataKey="Prediksi" fill="rgba(139,92,246,0.08)" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 3" dot={{ r:4, fill:"#8b5cf6", strokeWidth:0 }} activeDot={{ r:5 }} connectNulls />
            ) : (
              <Line type="monotone" dataKey="Prediksi" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 3" dot={{ r:4, fill:"#8b5cf6", strokeWidth:0 }} activeDot={{ r:5 }} connectNulls />
            )}

            {/* Line Tersedia */}
            <Line type="monotone" dataKey="Tersedia" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 2" dot={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Info */}
      <div style={{ padding:"8px 20px 14px", display:"flex", gap:16, flexWrap:"wrap" }}>
        {[
          { color:"#3b82f6", label:"Data aktual (historis)" },
          { color:"#8b5cf6", label:"Prediksi (linear regression)" },
          { color:"#10b981", label:"Guru tersedia" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:20, height:2, background:color, borderRadius:1 }} />
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helper export ─────────────────────────────────────────────
export { generatePrediksi };