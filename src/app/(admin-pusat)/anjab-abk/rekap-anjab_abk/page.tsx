"use client";
// src/app/(admin-pusat)/anjab-abk/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";

interface RekapItem {
  id: string; namaJabatan: string; kodeJabatan: string;
  jenisJabatan: string; namaSekolah?: string; namaOPD?: string;
  progressAnjab: number; statusABK?: string;
  efektivitasJabatan?: string; kebutuhanPegawai?: number;
}

const EJ_COLOR: Record<string, string> = {
  A:"#10b981", B:"#3b82f6", C:"#06b6d4", D:"#f59e0b", E:"#ef4444",
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

export default function RekapAnjabABKPage() {
  const [data, setData]       = useState<RekapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterEJ, setFilterEJ]       = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/anjab?rekap=true");
        const json = await res.json();
        setData(json.data || []);
      } catch { setData([]); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = data.filter((d) => {
    const matchSearch = !search ||
      d.namaJabatan.toLowerCase().includes(search.toLowerCase()) ||
      d.kodeJabatan.toLowerCase().includes(search.toLowerCase()) ||
      (d.namaSekolah || "").toLowerCase().includes(search.toLowerCase());
    return matchSearch &&
      (!filterJenis || d.jenisJabatan === filterJenis) &&
      (!filterEJ    || d.efektivitasJabatan === filterEJ);
  });

  const total      = data.length;
  const selesai    = data.filter((d) => d.progressAnjab === 100).length;
  const belumMulai = data.filter((d) => d.progressAnjab === 0).length;
  const proses     = total - selesai - belumMulai;

  const jenisColor = (j: string) =>
    j==="STRUKTURAL" ? { bg:"rgba(59,130,246,0.15)", color:"#3b82f6" } :
    j==="FUNGSIONAL"  ? { bg:"rgba(16,185,129,0.15)", color:"#10b981" } :
    { bg:"rgba(245,158,11,0.15)", color:"#f59e0b" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6 }}>Admin Pusat</div>
          <h1 style={{ fontSize: isMobile?18:22, fontWeight:800, color:"white", margin:0 }}>Rekap ANJAB & ABK</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:3, marginBottom:0 }}>Rekap analisis jabatan dan beban kerja seluruh OPD/Sekolah</p>
        </div>
        <div style={{ display:"flex", gap:8, flexShrink:0 }}>
          <Link href="/anjab-abk/anjab"    style={navLink("rgba(59,130,246,0.15)","rgba(59,130,246,0.3)","#3b82f6", isMobile)}>📋 ANJAB</Link>
          <Link href="/anjab-abk/abk"      style={navLink("rgba(16,185,129,0.15)","rgba(16,185,129,0.3)","#10b981", isMobile)}>📊 ABK</Link>
          <Link href="/anjab-abk/bezeting" style={navLink("rgba(245,158,11,0.15)","rgba(245,158,11,0.3)","#f59e0b", isMobile)}>📁 Bezeting</Link>
        </div>
      </div>

      {/* ── Summary — 2 col mobile, 4 col desktop ── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:10 }}>
        {[
          { label:"Total Jabatan", value:total,      color:"#3b82f6" },
          { label:"ANJAB Selesai", value:selesai,    color:"#10b981" },
          { label:"Sedang Proses", value:proses,     color:"#f59e0b" },
          { label:"Belum Dimulai", value:belumMulai, color:"#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderLeft:`3px solid ${color}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</div>
            <div style={{ fontSize:22, fontWeight:900, color, marginTop:4 }}>{loading ? "—" : value}</div>
          </div>
        ))}
      </div>

      {/* ── Filter ── */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:160 }}>
          <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari jabatan, kode, sekolah..."
            style={{ width:"100%", height:38, paddingLeft:32, paddingRight:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"white", fontSize:13, outline:"none", boxSizing:"border-box" }}
            onFocus={(e) => (e.target.style.borderColor="#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor="rgba(255,255,255,0.1)")}
          />
        </div>
        {[
          { val:filterJenis, set:setFilterJenis, opts:[["","Semua Jenis"],["STRUKTURAL","Struktural"],["FUNGSIONAL","Fungsional"],["PELAKSANA","Pelaksana"]] },
          { val:filterEJ,    set:setFilterEJ,    opts:[["","Semua EJ"],["A","EJ-A"],["B","EJ-B"],["C","EJ-C"],["D","EJ-D"],["E","EJ-E"]] },
        ].map((f, i) => (
          <select key={i} value={f.val} onChange={(e) => f.set(e.target.value)}
            style={{ height:38, padding:"0 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"white", fontSize:13, outline:"none", cursor:"pointer" }}>
            {f.opts.map(([v,l]) => <option key={v} value={v} style={{ background:"#161b22" }}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* ── Content: Cards (mobile) / Table (desktop) ── */}
      {isMobile ? (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {loading ? (
            Array.from({length:3}).map((_,i) => (
              <div key={i} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:14, height:110, animation:"pulse 1.5s ease infinite" }} />
            ))
          ) : filtered.length === 0 ? (
            <div style={{ padding:48, textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:13, background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10 }}>
              {data.length === 0 ? "Belum ada data ANJAB & ABK" : "Tidak ada hasil pencarian"}
            </div>
          ) : filtered.map((item) => {
            const jc = jenisColor(item.jenisJabatan);
            return (
              <div key={item.id} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:8 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"white", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.namaJabatan}</div>
                    <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ fontFamily:"monospace", fontSize:11, color:"#60a5fa" }}>{item.kodeJabatan}</span>
                      <span style={{ padding:"2px 7px", borderRadius:100, fontSize:10, fontWeight:700, background:jc.bg, color:jc.color }}>{item.jenisJabatan}</span>
                    </div>
                    {(item.namaSekolah || item.namaOPD) && (
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:3 }}>{item.namaSekolah || item.namaOPD}</div>
                    )}
                  </div>
                  {item.efektivitasJabatan && (
                    <span style={{ width:30, height:30, borderRadius:"50%", background:`${EJ_COLOR[item.efektivitasJabatan]}18`, border:`1.5px solid ${EJ_COLOR[item.efektivitasJabatan]}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:EJ_COLOR[item.efektivitasJabatan], flexShrink:0 }}>
                      {item.efektivitasJabatan}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ flex:1, height:5, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${item.progressAnjab}%`, borderRadius:3,
                      background: item.progressAnjab===100?"#10b981":item.progressAnjab>0?"#3b82f6":"rgba(255,255,255,0.1)", transition:"width 0.5s" }} />
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, minWidth:30,
                    color: item.progressAnjab===100?"#10b981":item.progressAnjab>0?"#60a5fa":"rgba(255,255,255,0.25)" }}>
                    {item.progressAnjab}%
                  </span>
                </div>

                <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                  <Link href={`/anjab-abk/anjab?jabatanId=${item.id}`} style={{ padding:"5px 10px", background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)", borderRadius:6, fontSize:11, fontWeight:700, color:"#3b82f6", textDecoration:"none" }}>ANJAB</Link>
                  <Link href={`/anjab-abk/abk?jabatanId=${item.id}`}   style={{ padding:"5px 10px", background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:6, fontSize:11, fontWeight:700, color:"#10b981", textDecoration:"none" }}>ABK</Link>
                </div>
              </div>
            );
          })}
          {!loading && filtered.length > 0 && (
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center" }}>
              {filtered.length} dari {data.length} jabatan
            </div>
          )}
        </div>
      ) : (
        <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
              <thead>
                <tr style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                  {["No","Kode","Nama Jabatan","Jenis","OPD / Sekolah","Progress ANJAB","EJ","Kebutuhan","Aksi"].map((h) => (
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
                          <div style={{ height:12, background:"rgba(255,255,255,0.05)", borderRadius:4, width:`${60+Math.random()*40}%`, animation:"pulse 1.5s ease infinite" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding:"48px 24px", textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:13 }}>
                    {data.length === 0 ? "Belum ada data ANJAB & ABK" : "Tidak ada hasil pencarian"}
                  </td></tr>
                ) : filtered.map((item, i) => {
                  const jc = jenisColor(item.jenisJabatan);
                  return (
                    <tr key={item.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background="rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background="transparent")}
                    >
                      <td style={td}>{i+1}</td>
                      <td style={td}><span style={{ fontFamily:"monospace", fontSize:11, color:"#60a5fa" }}>{item.kodeJabatan}</span></td>
                      <td style={td}><span style={{ fontSize:13, fontWeight:600, color:"white" }}>{item.namaJabatan}</span></td>
                      <td style={td}>
                        <span style={{ padding:"3px 8px", borderRadius:100, fontSize:10, fontWeight:700, background:jc.bg, color:jc.color }}>{item.jenisJabatan}</span>
                      </td>
                      <td style={{ ...td, color:"rgba(255,255,255,0.5)" }}>{item.namaSekolah || item.namaOPD || "—"}</td>
                      <td style={{ ...td, minWidth:120 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ flex:1, height:5, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${item.progressAnjab}%`, borderRadius:3,
                              background: item.progressAnjab===100?"#10b981":item.progressAnjab>0?"#3b82f6":"rgba(255,255,255,0.1)", transition:"width 0.5s" }} />
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, minWidth:30,
                            color: item.progressAnjab===100?"#10b981":item.progressAnjab>0?"#60a5fa":"rgba(255,255,255,0.25)" }}>
                            {item.progressAnjab}%
                          </span>
                        </div>
                      </td>
                      <td style={{ ...td, textAlign:"center" }}>
                        {item.efektivitasJabatan ? (
                          <span style={{ width:28, height:28, borderRadius:"50%", background:`${EJ_COLOR[item.efektivitasJabatan]}18`, border:`1.5px solid ${EJ_COLOR[item.efektivitasJabatan]}`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:EJ_COLOR[item.efektivitasJabatan] }}>
                            {item.efektivitasJabatan}
                          </span>
                        ) : <span style={{ color:"rgba(255,255,255,0.2)", fontSize:12 }}>—</span>}
                      </td>
                      <td style={{ ...td, textAlign:"center", fontSize:13, fontWeight:700, color: item.kebutuhanPegawai?"white":"rgba(255,255,255,0.2)" }}>
                        {item.kebutuhanPegawai?.toFixed(1) || "—"}
                      </td>
                      <td style={td}>
                        <div style={{ display:"flex", gap:6 }}>
                          <Link href={`/anjab-abk/anjab?jabatanId=${item.id}`} style={{ padding:"5px 10px", background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)", borderRadius:6, fontSize:11, fontWeight:700, color:"#3b82f6", textDecoration:"none", whiteSpace:"nowrap" }}>ANJAB</Link>
                          <Link href={`/anjab-abk/abk?jabatanId=${item.id}`}   style={{ padding:"5px 10px", background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:6, fontSize:11, fontWeight:700, color:"#10b981", textDecoration:"none" }}>ABK</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div style={{ padding:"10px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", fontSize:11, color:"rgba(255,255,255,0.3)" }}>
              Menampilkan {filtered.length} dari {data.length} jabatan
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}input::placeholder{color:rgba(255,255,255,0.2)!important}`}</style>
    </div>
  );
}

const td: React.CSSProperties = { padding:"12px 14px", color:"rgba(255,255,255,0.7)", fontSize:13 };
const navLink = (bg: string, border: string, color: string, isMobile: boolean): React.CSSProperties => ({
  padding: isMobile ? "7px 10px" : "9px 18px",
  background: bg, border:`1px solid ${border}`, borderRadius:8,
  color, fontSize: isMobile ? 12 : 13, fontWeight:700, textDecoration:"none", whiteSpace:"nowrap",
});