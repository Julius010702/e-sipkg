"use client";
// src/app/(admin-pusat)/anjab-abk/bezeting/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";

interface BezetingItem {
  id: string; jabatanId: string; namaJabatan: string; kodeJabatan: string;
  jenisJabatan: string; unitOrganisasi?: string;
  golonganSaranRendah?: string; golonganSaranTinggi?: string;
  jumlahPNS: number; jumlahPPPK: number;
  kebutuhanPegawai?: number; statusKebutuhan?: string;
}

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

export default function AdminBezetingPage() {
  const [data, setData]       = useState<BezetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/bezeting?rekap=true");
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
      d.namaJabatan.toLowerCase().includes(q) ||
      d.kodeJabatan.toLowerCase().includes(q) ||
      (d.unitOrganisasi || "").toLowerCase().includes(q);
    return matchSearch && (!filterStatus || d.statusKebutuhan === filterStatus);
  });

  const totalPNS    = data.reduce((s, d) => s + d.jumlahPNS,  0);
  const totalPPPK   = data.reduce((s, d) => s + d.jumlahPPPK, 0);
  const totalKurang = data.filter((d) => d.statusKebutuhan === "KURANG").length;
  const totalLebih  = data.filter((d) => d.statusKebutuhan === "LEBIH").length;
  const totalSesuai = data.filter((d) => d.statusKebutuhan === "SESUAI").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6 }}>ANJAB & ABK</div>
          <h1 style={{ fontSize: isMobile?18:22, fontWeight:800, color:"white", margin:0 }}>Rekap Bezeting Jabatan</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:3, marginBottom:0 }}>Data pegawai PNS & PPPK seluruh jabatan</p>
        </div>
        <div style={{ display:"flex", gap:8, flexShrink:0 }}>
          <Link href="/anjab-abk" style={navLink("rgba(255,255,255,0.06)","rgba(255,255,255,0.1)","rgba(255,255,255,0.6)", isMobile)}>← Rekap</Link>
          <Link href="/anjab-abk/anjab" style={navLink("rgba(59,130,246,0.12)","rgba(59,130,246,0.25)","#3b82f6", isMobile)}>📋 ANJAB</Link>
          <Link href="/anjab-abk/abk" style={navLink("rgba(16,185,129,0.12)","rgba(16,185,129,0.25)","#10b981", isMobile)}>📊 ABK</Link>
        </div>
      </div>

      {/* ── Summary — 2 col mobile, 5 col desktop ── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile?"repeat(2,1fr)":"repeat(5,1fr)", gap:10 }}>
        {[
          { label:"Total PNS",      value:totalPNS,    color:"#3b82f6" },
          { label:"Total PPPK",     value:totalPPPK,   color:"#8b5cf6" },
          { label:"Jabatan Kurang", value:totalKurang, color:"#ef4444" },
          { label:"Jabatan Lebih",  value:totalLebih,  color:"#f59e0b" },
          { label:"Jabatan Sesuai", value:totalSesuai, color:"#10b981" },
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
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ height:38, padding:"0 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"white", fontSize:13, outline:"none", cursor:"pointer" }}>
          {[["","Semua Status"],["KURANG","Kurang"],["LEBIH","Lebih"],["SESUAI","Sesuai"]].map(([v,l]) => (
            <option key={v} value={v} style={{ background:"#161b22" }}>{l}</option>
          ))}
        </select>
      </div>

      {/* ── Content: Cards (mobile) / Table (desktop) ── */}
      {isMobile ? (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {loading ? (
            Array.from({length:3}).map((_,i) => (
              <div key={i} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:14, height:100, animation:"pulse 1.5s ease infinite" }} />
            ))
          ) : filtered.length === 0 ? (
            <div style={{ padding:48, textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:13, background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10 }}>
              {data.length === 0 ? "Belum ada data Bezeting" : "Tidak ada hasil pencarian"}
            </div>
          ) : filtered.map((item) => (
            <div key={item.id} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"white" }}>{item.namaJabatan}</div>
                <div style={{ fontSize:11, color:"#60a5fa", fontFamily:"monospace", marginTop:1 }}>{item.kodeJabatan}</div>
                {item.unitOrganisasi && <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:1 }}>{item.unitOrganisasi}</div>}
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>PNS: <strong style={{ color:"#3b82f6" }}>{item.jumlahPNS}</strong></span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>PPPK: <strong style={{ color:"#8b5cf6" }}>{item.jumlahPPPK}</strong></span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Total: <strong style={{ color:"white" }}>{item.jumlahPNS + item.jumlahPPPK}</strong></span>
                {item.kebutuhanPegawai && (
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Butuh: <strong style={{ color:"#f59e0b" }}>{Math.ceil(item.kebutuhanPegawai)}</strong></span>
                )}
                {item.statusKebutuhan && (
                  <span style={{ padding:"2px 9px", borderRadius:100, fontSize:10, fontWeight:700, background:`${STATUS_COLOR[item.statusKebutuhan]}18`, color:STATUS_COLOR[item.statusKebutuhan], border:`1px solid ${STATUS_COLOR[item.statusKebutuhan]}30` }}>
                    {item.statusKebutuhan}
                  </span>
                )}
              </div>
            </div>
          ))}
          {!loading && filtered.length > 0 && (
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center" }}>
              {filtered.length} dari {data.length} bezeting
            </div>
          )}
        </div>
      ) : (
        <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
              <thead>
                <tr style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                  {["No","Kode","Nama Jabatan","Unit Organisasi","Gol. Rendah","Gol. Tinggi","PNS","PPPK","Total","Kebutuhan","Status"].map((h) => (
                    <th key={h} style={{ padding:"11px 12px", textAlign:"left", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(255,255,255,0.4)", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length:5}).map((_,i) => (
                    <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      {Array.from({length:11}).map((_,j) => (
                        <td key={j} style={{ padding:"12px 12px" }}>
                          <div style={{ height:12, background:"rgba(255,255,255,0.05)", borderRadius:4, width:`${50+Math.random()*50}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={11} style={{ padding:"48px 24px", textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:13 }}>
                    {data.length === 0 ? "Belum ada data Bezeting" : "Tidak ada hasil pencarian"}
                  </td></tr>
                ) : filtered.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background="rgba(255,255,255,0.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background="transparent")}
                  >
                    <td style={td}>{i+1}</td>
                    <td style={td}><span style={{ fontFamily:"monospace", fontSize:11, color:"#60a5fa" }}>{item.kodeJabatan}</span></td>
                    <td style={td}>
                      <div style={{ fontSize:13, fontWeight:600, color:"white" }}>{item.namaJabatan}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{item.jenisJabatan}</div>
                    </td>
                    <td style={{ ...td, color:"rgba(255,255,255,0.5)" }}>{item.unitOrganisasi || "—"}</td>
                    <td style={{ ...td, textAlign:"center" }}>
                      <span style={{ padding:"2px 8px", borderRadius:100, fontSize:10, fontWeight:700, background:"rgba(59,130,246,0.12)", color:"#60a5fa" }}>{item.golonganSaranRendah || "—"}</span>
                    </td>
                    <td style={{ ...td, textAlign:"center" }}>
                      <span style={{ padding:"2px 8px", borderRadius:100, fontSize:10, fontWeight:700, background:"rgba(139,92,246,0.12)", color:"#a78bfa" }}>{item.golonganSaranTinggi || "—"}</span>
                    </td>
                    <td style={{ ...td, textAlign:"center", fontSize:14, fontWeight:700, color:"#3b82f6" }}>{item.jumlahPNS}</td>
                    <td style={{ ...td, textAlign:"center", fontSize:14, fontWeight:700, color:"#8b5cf6" }}>{item.jumlahPPPK}</td>
                    <td style={{ ...td, textAlign:"center", fontSize:14, fontWeight:900, color:"white" }}>{item.jumlahPNS + item.jumlahPPPK}</td>
                    <td style={{ ...td, textAlign:"center", color:"rgba(255,255,255,0.5)" }}>
                      {item.kebutuhanPegawai ? `${Math.ceil(item.kebutuhanPegawai)} org` : "—"}
                    </td>
                    <td style={td}>
                      {item.statusKebutuhan ? (
                        <span style={{ padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700, background:`${STATUS_COLOR[item.statusKebutuhan]}18`, color:STATUS_COLOR[item.statusKebutuhan], border:`1px solid ${STATUS_COLOR[item.statusKebutuhan]}30` }}>
                          {item.statusKebutuhan}
                        </span>
                      ) : <span style={{ color:"rgba(255,255,255,0.2)", fontSize:12 }}>—</span>}
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length > 0 && (
                  <tr style={{ background:"rgba(255,255,255,0.03)", borderTop:"2px solid rgba(255,255,255,0.08)" }}>
                    <td colSpan={6} style={{ padding:"12px 12px", textAlign:"right", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)" }}>TOTAL</td>
                    <td style={{ padding:"12px 12px", textAlign:"center", fontSize:14, fontWeight:900, color:"#3b82f6" }}>{filtered.reduce((s,d)=>s+d.jumlahPNS,0)}</td>
                    <td style={{ padding:"12px 12px", textAlign:"center", fontSize:14, fontWeight:900, color:"#8b5cf6" }}>{filtered.reduce((s,d)=>s+d.jumlahPPPK,0)}</td>
                    <td style={{ padding:"12px 12px", textAlign:"center", fontSize:14, fontWeight:900, color:"white" }}>{filtered.reduce((s,d)=>s+d.jumlahPNS+d.jumlahPPPK,0)}</td>
                    <td colSpan={2} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div style={{ padding:"10px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", fontSize:11, color:"rgba(255,255,255,0.3)" }}>
              Menampilkan {filtered.length} dari {data.length} bezeting
            </div>
          )}
        </div>
      )}

      <style>{`input::placeholder{color:rgba(255,255,255,0.2)!important}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

const td: React.CSSProperties = { padding:"11px 12px", color:"rgba(255,255,255,0.7)", fontSize:13 };
const navLink = (bg: string, border: string, color: string, isMobile: boolean): React.CSSProperties => ({
  padding: isMobile ? "7px 10px" : "9px 16px",
  background: bg, border:`1px solid ${border}`, borderRadius:8,
  color, fontSize: isMobile ? 12 : 13, fontWeight:600, textDecoration:"none", whiteSpace:"nowrap",
});