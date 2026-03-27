"use client";
// src/app/(admin-pusat)/anjab-abk/abk/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";

interface ABKItem {
  id: string;
  jabatan: {
    id: string; kodeJabatan: string; namaJabatan: string;
    jenisJabatan: string; unitOrganisasi?: { namaUnit: string };
  };
  totalBebanKerja: number; efektivitasNilai: number;
  efektivitasJabatan: string; kebutuhanPegawai: number; statusKebutuhan: string;
}

const EJ_COLOR: Record<string, string> = {
  A:"#10b981", B:"#3b82f6", C:"#06b6d4", D:"#f59e0b", E:"#ef4444",
};
const STATUS_COLOR: Record<string, string> = {
  KURANG:"#ef4444", LEBIH:"#f59e0b", SESUAI:"#10b981",
};

function useIsMobile(bp = 768) {
  const [val, setVal] = useState(false);
  useEffect(() => {
    const fn = () => setVal(window.innerWidth < bp);
    fn(); window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return val;
}

export default function AdminABKPage() {
  const [data, setData]       = useState<ABKItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterEJ, setFilterEJ] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/abk?rekap=true");
        const json = await res.json();
        setData(json.data || []);
      } catch { setData([]); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = data.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      d.jabatan.namaJabatan.toLowerCase().includes(q) ||
      d.jabatan.kodeJabatan.toLowerCase().includes(q) ||
      (d.jabatan.unitOrganisasi?.namaUnit || "").toLowerCase().includes(q);
    return matchSearch && (!filterEJ || d.efektivitasJabatan === filterEJ);
  });

  const totalABK = data.length;
  const ejA  = data.filter((d) => d.efektivitasJabatan === "A").length;
  const ejBC = data.filter((d) => ["B","C"].includes(d.efektivitasJabatan)).length;
  const ejDE = data.filter((d) => ["D","E"].includes(d.efektivitasJabatan)).length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6 }}>ANJAB & ABK</div>
          <h1 style={{ fontSize: isMobile?18:22, fontWeight:800, color:"white", margin:0 }}>Rekap Analisis Beban Kerja</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:3, marginBottom:0 }}>Hasil kalkulasi beban kerja dan kebutuhan pegawai seluruh jabatan</p>
        </div>
        {/* Nav links — scroll horizontal on mobile */}
        <div style={{ display:"flex", gap:8, flexShrink:0 }}>
          <Link href="/anjab-abk" style={navLinkStyle("rgba(255,255,255,0.06)","rgba(255,255,255,0.1)","rgba(255,255,255,0.6)", isMobile)}>← Rekap</Link>
          <Link href="/anjab-abk/anjab" style={navLinkStyle("rgba(59,130,246,0.12)","rgba(59,130,246,0.25)","#3b82f6", isMobile)}>📋 ANJAB</Link>
          <Link href="/anjab-abk/bezeting" style={navLinkStyle("rgba(245,158,11,0.12)","rgba(245,158,11,0.25)","#f59e0b", isMobile)}>📁 Bezeting</Link>
        </div>
      </div>

      {/* ── Summary — 2 col mobile, 4 col desktop ── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:10 }}>
        {[
          { label:"Total ABK",        value:totalABK, color:"#3b82f6" },
          { label:"EJ Sangat Baik (A)",value:ejA,     color:"#10b981" },
          { label:"EJ Baik-Cukup (B-C)",value:ejBC,  color:"#f59e0b" },
          { label:"EJ Cukup-Kurang (D-E)",value:ejDE, color:"#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderLeft:`3px solid ${color}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", lineHeight:1.4 }}>{label}</div>
            <div style={{ fontSize:22, fontWeight:900, color, marginTop:4 }}>{loading ? "—" : value}</div>
          </div>
        ))}
      </div>

      {/* ── Filter ── */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:160 }}>
          <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari jabatan, kode, unit..."
            style={{ width:"100%", height:38, paddingLeft:32, paddingRight:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"white", fontSize:13, outline:"none", boxSizing:"border-box" }}
            onFocus={(e) => (e.target.style.borderColor="#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor="rgba(255,255,255,0.1)")}
          />
        </div>
        <select value={filterEJ} onChange={(e) => setFilterEJ(e.target.value)}
          style={{ height:38, padding:"0 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"white", fontSize:13, outline:"none", cursor:"pointer" }}>
          {[["","Semua EJ"],["A","EJ-A"],["B","EJ-B"],["C","EJ-C"],["D","EJ-D"],["E","EJ-E"]].map(([v,l]) => (
            <option key={v} value={v} style={{ background:"#161b22" }}>{l}</option>
          ))}
        </select>
      </div>

      {/* ── Content: Cards (mobile) / Table (desktop) ── */}
      {isMobile ? (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {loading ? (
            Array.from({length:3}).map((_,i) => (
              <div key={i} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:14, height:90, animation:"pulse 1.5s ease infinite" }} />
            ))
          ) : filtered.length === 0 ? (
            <div style={{ padding:48, textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:13, background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10 }}>
              {data.length === 0 ? "Belum ada data ABK" : "Tidak ada hasil pencarian"}
            </div>
          ) : filtered.map((item) => (
            <div key={item.id} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:8 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"white", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.jabatan.namaJabatan}</div>
                  <div style={{ fontSize:11, color:"#60a5fa", fontFamily:"monospace", marginTop:2 }}>{item.jabatan.kodeJabatan}</div>
                  {item.jabatan.unitOrganisasi && <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{item.jabatan.unitOrganisasi.namaUnit}</div>}
                </div>
                {item.efektivitasJabatan && (
                  <span style={{ width:32, height:32, borderRadius:"50%", background:`${EJ_COLOR[item.efektivitasJabatan]}18`, border:`2px solid ${EJ_COLOR[item.efektivitasJabatan]}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:EJ_COLOR[item.efektivitasJabatan], flexShrink:0 }}>
                    {item.efektivitasJabatan}
                  </span>
                )}
              </div>
              <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>
                  Beban: <strong style={{ color:"white" }}>{item.totalBebanKerja.toLocaleString("id")} jam</strong>
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>
                  Kebutuhan: <strong style={{ color:"#3b82f6" }}>{item.kebutuhanPegawai.toFixed(2)} org</strong>
                </div>
                {item.statusKebutuhan && (
                  <span style={{ padding:"2px 9px", borderRadius:100, fontSize:10, fontWeight:700, background:`${STATUS_COLOR[item.statusKebutuhan]}18`, color:STATUS_COLOR[item.statusKebutuhan], border:`1px solid ${STATUS_COLOR[item.statusKebutuhan]}30` }}>
                    {item.statusKebutuhan}
                  </span>
                )}
                <Link href={`/anjab-abk?jabatanId=${item.jabatan.id}`} style={{ marginLeft:"auto", padding:"4px 10px", background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)", borderRadius:6, fontSize:11, fontWeight:700, color:"#3b82f6", textDecoration:"none" }}>
                  Detail
                </Link>
              </div>
            </div>
          ))}
          {!loading && filtered.length > 0 && (
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center" }}>
              {filtered.length} dari {data.length} ABK
            </div>
          )}
        </div>
      ) : (
        <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
              <thead>
                <tr style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                  {["No","Kode","Nama Jabatan","Unit Organisasi","Total Beban Kerja","Kebutuhan Pegawai","EJ / PJ","Status",""].map((h) => (
                    <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(255,255,255,0.4)", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length:5}).map((_,i) => (
                    <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      {Array.from({length:9}).map((_,j) => (
                        <td key={j} style={{ padding:"12px 14px" }}>
                          <div style={{ height:12, background:"rgba(255,255,255,0.05)", borderRadius:4, width:`${60+Math.random()*40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding:"48px 24px", textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:13 }}>
                    {data.length === 0 ? "Belum ada data ABK" : "Tidak ada hasil pencarian"}
                  </td></tr>
                ) : filtered.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background="rgba(255,255,255,0.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background="transparent")}
                  >
                    <td style={td}>{i+1}</td>
                    <td style={td}><span style={{ fontFamily:"monospace", fontSize:11, color:"#60a5fa" }}>{item.jabatan.kodeJabatan}</span></td>
                    <td style={td}>
                      <div style={{ fontSize:13, fontWeight:600, color:"white" }}>{item.jabatan.namaJabatan}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{item.jabatan.jenisJabatan}</div>
                    </td>
                    <td style={{ ...td, color:"rgba(255,255,255,0.5)" }}>{item.jabatan.unitOrganisasi?.namaUnit || "—"}</td>
                    <td style={td}>
                      <span style={{ fontSize:13, fontWeight:700, color:"white", fontFamily:"monospace" }}>{item.totalBebanKerja.toLocaleString("id")}</span>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginLeft:4 }}>jam</span>
                    </td>
                    <td style={td}>
                      <span style={{ fontSize:14, fontWeight:900, color:"#3b82f6" }}>{item.kebutuhanPegawai.toFixed(2)}</span>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginLeft:4 }}>orang</span>
                    </td>
                    <td style={{ ...td, textAlign:"center" }}>
                      {item.efektivitasJabatan ? (
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                          <span style={{ width:32, height:32, borderRadius:"50%", background:`${EJ_COLOR[item.efektivitasJabatan]}18`, border:`2px solid ${EJ_COLOR[item.efektivitasJabatan]}`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:EJ_COLOR[item.efektivitasJabatan] }}>
                            {item.efektivitasJabatan}
                          </span>
                          <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{item.efektivitasNilai.toFixed(2)}</span>
                        </div>
                      ) : <span style={{ color:"rgba(255,255,255,0.2)" }}>—</span>}
                    </td>
                    <td style={td}>
                      {item.statusKebutuhan ? (
                        <span style={{ padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700, background:`${STATUS_COLOR[item.statusKebutuhan]}18`, color:STATUS_COLOR[item.statusKebutuhan], border:`1px solid ${STATUS_COLOR[item.statusKebutuhan]}30` }}>
                          {item.statusKebutuhan}
                        </span>
                      ) : <span style={{ color:"rgba(255,255,255,0.2)", fontSize:12 }}>—</span>}
                    </td>
                    <td style={td}>
                      <Link href={`/anjab-abk?jabatanId=${item.jabatan.id}`} style={{ padding:"5px 12px", background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)", borderRadius:6, fontSize:11, fontWeight:700, color:"#3b82f6", textDecoration:"none", whiteSpace:"nowrap" }}>
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div style={{ padding:"10px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", fontSize:11, color:"rgba(255,255,255,0.3)" }}>
              Menampilkan {filtered.length} dari {data.length} ABK
            </div>
          )}
        </div>
      )}

      <style>{`input::placeholder{color:rgba(255,255,255,0.2)!important}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

const td: React.CSSProperties = { padding:"12px 14px", color:"rgba(255,255,255,0.7)", fontSize:13 };
const navLinkStyle = (bg: string, border: string, color: string, isMobile: boolean): React.CSSProperties => ({
  padding: isMobile ? "7px 10px" : "9px 16px",
  background: bg, border:`1px solid ${border}`, borderRadius:8,
  color, fontSize: isMobile ? 12 : 13, fontWeight:600, textDecoration:"none", whiteSpace:"nowrap",
});