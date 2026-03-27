"use client";
// src/app/(admin-pusat)/perhitungan-final/page.tsx

import { useState, useEffect, useCallback } from "react";

interface DistribusiItem {
  sekolahId: string; namaSekolah: string; jenisSekolah: string;
  kecamatan?: string; kabupatenKota?: string; tahunAjaran: string;
  jumlahGuruPNS: number; jumlahGuruPPPK: number; jumlahGuruTersedia: number;
  kebutuhanGuru: number; kekuranganGuru: number; kelebihanGuru: number;
  statusKebutuhan: string;
}

interface RekomendasiItem {
  sekolahTujuan: string; kecamatanTujuan?: string;
  sekolahSumber?: string; kecamatanSumber?: string;
  jumlahDibutuhkan: number; jumlahTransfer: number;
  sisaKekurangan: number; rekomendasi: string;
}

interface RekapData {
  tahun: string; totalSekolah: number; totalGuruPNS: number; totalGuruPPPK: number;
  totalKebutuhan: number; totalKekurangan: number; totalKelebihan: number;
  distribusiData: DistribusiItem[]; rekomendasiData: RekomendasiItem[];
  sudahDisimpan?: boolean;
}

const TAHUN_OPTIONS = Array.from({ length:6 }, (_,i) => String(new Date().getFullYear() - 1 + i));

function useIsMobile(bp = 768) {
  const [val, setVal] = useState(false);
  useEffect(() => {
    const fn = () => setVal(window.innerWidth < bp);
    fn(); window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return val;
}

export default function PerhitunganFinalPage() {
  const [tahun, setTahun]         = useState(String(new Date().getFullYear()));
  const [rekap, setRekap]         = useState<RekapData | null>(null);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [activeTab, setActiveTab] = useState<"distribusi"|"rekomendasi">("distribusi");
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState<{ msg: string; type: "success"|"error" } | null>(null);
  const isMobile = useIsMobile(768);

  const showToast = (msg: string, type: "success"|"error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRekap = useCallback(async () => {
    setLoading(true); setRekap(null);
    try {
      const res  = await fetch(`/api/perhitungan/final?tahun=${tahun}`);
      const json = await res.json();
      if (json.data && !Array.isArray(json.data)) setRekap(json.data);
    } catch { showToast("Gagal memuat data", "error"); }
    finally { setLoading(false); }
  }, [tahun]);

  useEffect(() => { fetchRekap(); }, [fetchRekap]);

  async function handleSimpan() {
    setSaving(true);
    try {
      const res = await fetch("/api/perhitungan/final", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ tahun }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      showToast(`Rekap tahun ${tahun} berhasil disimpan`, "success");
      fetchRekap();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  const distribusiFiltered = rekap?.distribusiData?.filter((d) =>
    d.namaSekolah.toLowerCase().includes(search.toLowerCase()) ||
    (d.kecamatan||"").toLowerCase().includes(search.toLowerCase())
  ) || [];

  const statusColor = (s: string) => s==="KURANG"?"#ef4444":s==="LEBIH"?"#f59e0b":"#22c55e";
  const statusLabel = (s: string) => s==="KURANG"?"Kurang":s==="LEBIH"?"Lebih":"Sesuai";

  return (
    <div style={{ minHeight:"100vh" }}>
      <Toast toast={toast} />

      {/* ── Header ── */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        flexDirection: isMobile ? "column" : "row",
        marginBottom: isMobile ? 20 : 28, gap:14,
      }}>
        <div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6 }}>Admin Pusat</div>
          <h1 style={{ fontSize: isMobile?20:24, fontWeight:800, color:"white", margin:0 }}>Perhitungan Final</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:4, marginBottom:0 }}>
            Rekap kebutuhan guru seluruh sekolah dan rekomendasi pemerataan
          </p>
        </div>

        {/* Controls */}
        <div style={{
          display:"flex", gap:10, alignItems:"center",
          width: isMobile ? "100%" : "auto",
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}>
          <div style={{ position:"relative", flex: isMobile ? 1 : "none" }}>
            <select value={tahun} onChange={(e) => setTahun(e.target.value)}
              style={{ width: isMobile ? "100%" : "auto", padding:"10px 36px 10px 14px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, color:"white", fontSize:14, fontWeight:700, outline:"none", cursor:"pointer", appearance:"none" }}>
              {TAHUN_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <svg style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"rgba(255,255,255,0.4)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <button onClick={handleSimpan} disabled={saving || !rekap}
            style={{ flex: isMobile ? 1 : "none", padding:"10px 18px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", border:"none", borderRadius:8, color:"white", fontSize:13, fontWeight:700, cursor: saving||!rekap?"not-allowed":"pointer", opacity: saving||!rekap?0.6:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            {saving ? "Menyimpan..." : rekap?.sudahDisimpan ? "Perbarui Rekap" : "Simpan Rekap"}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : !rekap || rekap.totalSekolah === 0 ? (
        <EmptyState tahun={tahun} />
      ) : (
        <>
          {/* ── Stat cards — 2 col mobile, 6 col desktop ── */}
          <div style={{ display:"grid", gridTemplateColumns: isMobile?"repeat(2,1fr)":"repeat(6,1fr)", gap:10, marginBottom: isMobile?20:28 }}>
            <StatCard label="Total Sekolah" value={rekap.totalSekolah}     icon="🏫" color="#3b82f6" />
            <StatCard label="Guru PNS"      value={rekap.totalGuruPNS}     icon="👨‍🏫" color="#8b5cf6" />
            <StatCard label="Guru PPPK"     value={rekap.totalGuruPPPK}    icon="📋" color="#06b6d4" />
            <StatCard label="Kebutuhan"     value={rekap.totalKebutuhan}   icon="📊" color="#f59e0b" />
            <StatCard label="Kekurangan"    value={rekap.totalKekurangan}  icon="⬇️" color="#ef4444" />
            <StatCard label="Kelebihan"     value={rekap.totalKelebihan}   icon="⬆️" color="#22c55e" />
          </div>

          <JenisDistribusiChart data={rekap.distribusiData} />

          {/* ── Tabs ── */}
          <div style={{
            display:"flex", gap:4, marginBottom:16,
            background:"rgba(255,255,255,0.04)", borderRadius:10, padding:4,
            width: isMobile ? "100%" : "fit-content",
          }}>
            {(["distribusi","rekomendasi"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ flex: isMobile ? 1 : "none", padding: isMobile ? "9px 10px" : "8px 20px", borderRadius:7, border:"none", cursor:"pointer", fontSize: isMobile ? 12 : 13, fontWeight:700, transition:"all 0.2s",
                  background: activeTab===tab?"#3b82f6":"transparent",
                  color: activeTab===tab?"white":"rgba(255,255,255,0.45)",
                  whiteSpace:"nowrap",
                }}>
                {tab==="distribusi" ? "📋 Distribusi" : "🔄 Rekomendasi"}
              </button>
            ))}
          </div>

          {/* ── Distribusi tab ── */}
          {activeTab === "distribusi" && (
            <>
              <div style={{ marginBottom:12 }}>
                <SearchInput value={search} onChange={setSearch} placeholder="Cari sekolah atau kecamatan..." />
              </div>
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth: isMobile ? 600 : 800 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                      {["No","Nama Sekolah","Jenis","Kecamatan","PNS","PPPK","Tersedia","Kebutuhan","Selisih","Status"].map((h) => (
                        <th key={h} style={{ padding:"11px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.07em", textTransform:"uppercase", background:"rgba(255,255,255,0.02)", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {distribusiFiltered.length === 0 ? (
                      <tr><td colSpan={10} style={{ padding:32, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:13 }}>Tidak ada data</td></tr>
                    ) : distribusiFiltered.map((item, i) => {
                      const selisih = item.kekuranganGuru>0 ? -item.kekuranganGuru : item.kelebihanGuru;
                      return (
                        <tr key={item.sekolahId} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background="rgba(255,255,255,0.03)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background="transparent")}
                        >
                          <td style={tdStyle}>{i+1}</td>
                          <td style={{ ...tdStyle, color:"white", fontWeight:600, maxWidth:160 }}>
                            <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.namaSekolah}</div>
                          </td>
                          <td style={tdStyle}><Chip label={item.jenisSekolah} color="#8b5cf6" /></td>
                          <td style={{ ...tdStyle, fontSize:12, color:"rgba(255,255,255,0.5)" }}>{item.kecamatan||"-"}</td>
                          <td style={{ ...tdStyle, textAlign:"center" }}>{item.jumlahGuruPNS}</td>
                          <td style={{ ...tdStyle, textAlign:"center" }}>{item.jumlahGuruPPPK}</td>
                          <td style={{ ...tdStyle, textAlign:"center", fontWeight:700, color:"white" }}>{item.jumlahGuruTersedia}</td>
                          <td style={{ ...tdStyle, textAlign:"center", color:"#f59e0b", fontWeight:700 }}>{Math.ceil(item.kebutuhanGuru)}</td>
                          <td style={{ ...tdStyle, textAlign:"center", fontWeight:700, color: selisih<0?"#ef4444":"#22c55e" }}>
                            {selisih>0?`+${selisih}`:selisih}
                          </td>
                          <td style={tdStyle}>
                            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", background:`${statusColor(item.statusKebutuhan)}18`, color:statusColor(item.statusKebutuhan), borderRadius:100 }}>
                              {statusLabel(item.statusKebutuhan)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ padding:"10px 14px", borderTop:"1px solid rgba(255,255,255,0.05)", fontSize:12, color:"rgba(255,255,255,0.25)" }}>
                  {distribusiFiltered.length} sekolah ditampilkan
                </div>
              </div>
            </>
          )}

          {/* ── Rekomendasi tab ── */}
          {activeTab === "rekomendasi" && (
            <div>
              {rekap.rekomendasiData?.length === 0 ? (
                <div style={{ padding:40, textAlign:"center", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12 }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>✅</div>
                  <p style={{ color:"rgba(255,255,255,0.5)", fontSize:14 }}>Tidak ada kekurangan guru — tidak diperlukan pemerataan</p>
                </div>
              ) : (
                <div style={{ display:"grid", gap:12 }}>
                  {rekap.rekomendasiData.map((item, i) => (
                    <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding: isMobile ? "14px 16px" : "16px 20px" }}>
                      <div style={{ display:"flex", alignItems: isMobile?"flex-start":"center", gap:12, flexDirection: isMobile?"column":"row", flexWrap:"wrap" }}>
                        <div style={{ flex:1, minWidth:140 }}>
                          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Sekolah Tujuan</div>
                          <div style={{ fontSize:14, fontWeight:700, color:"white" }}>{item.sekolahTujuan}</div>
                          {item.kecamatanTujuan && <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{item.kecamatanTujuan}</div>}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:2 }}>Dibutuhkan</div>
                            <span style={{ fontSize:22, fontWeight:800, color:"#ef4444" }}>{item.jumlahDibutuhkan}</span>
                          </div>
                          {item.sekolahSumber && (
                            <>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                              <div style={{ textAlign:"center" }}>
                                <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:2 }}>Transfer dari</div>
                                <div style={{ fontSize:12, fontWeight:700, color:"#22c55e" }}>{item.sekolahSumber}</div>
                                <div style={{ fontSize:18, fontWeight:800, color:"#22c55e" }}>+{item.jumlahTransfer}</div>
                              </div>
                            </>
                          )}
                        </div>
                        <div style={{ flex:1, minWidth:140, textAlign: isMobile?"left":"right" }}>
                          <div style={{ fontSize:12, color: item.sisaKekurangan>0?"#f59e0b":"#22c55e", fontWeight:600, marginBottom:6 }}>
                            {item.sisaKekurangan>0 ? `Sisa kekurangan: ${item.sisaKekurangan} guru` : "Terpenuhi dari pemerataan"}
                          </div>
                          <div style={{ fontSize:12, padding:"6px 12px", background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:8, color:"#93c5fd", display:"inline-block" }}>
                            💡 {item.rekomendasi}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      <GlobalStyles />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px" }}>
      <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
      <div style={{ fontSize:24, fontWeight:800, color, lineHeight:1 }}>{value.toLocaleString("id-ID")}</div>
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div>
    </div>
  );
}

function JenisDistribusiChart({ data }: { data: DistribusiItem[] }) {
  const byJenis = data.reduce((acc, d) => { acc[d.jenisSekolah] = (acc[d.jenisSekolah]||0)+1; return acc; }, {} as Record<string,number>);
  const total = data.length;
  const jenisColors: Record<string,string> = { SMA:"#3b82f6", SMK:"#10b981", SLB:"#f59e0b" };
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
      <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Distribusi Jenis</div>
      {Object.entries(byJenis).map(([jenis, count]) => (
        <div key={jenis} style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:10, height:10, borderRadius:3, background:jenisColors[jenis]||"#666" }} />
          <span style={{ fontSize:13, color:"white", fontWeight:700 }}>{jenis}</span>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>{count} sekolah ({Math.round(count/total*100)}%)</span>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return <div style={{ padding:80, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:14 }}>Memuat data rekap...</div>;
}

function EmptyState({ tahun }: { tahun: string }) {
  return (
    <div style={{ padding:60, textAlign:"center", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16 }}>
      <div style={{ fontSize:40, marginBottom:14 }}>📊</div>
      <div style={{ fontSize:17, fontWeight:700, color:"white", marginBottom:8 }}>Belum ada data perhitungan</div>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", maxWidth:320, margin:"0 auto" }}>
        Belum ada data perhitungan kebutuhan guru untuk tahun <strong style={{ color:"white" }}>{tahun}</strong>. Admin sekolah perlu mengisi data terlebih dahulu.
      </p>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v:string)=>void; placeholder: string }) {
  return (
    <div style={{ position:"relative", maxWidth:320 }}>
      <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", paddingLeft:38, paddingRight:14, paddingTop:10, paddingBottom:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"white", fontSize:13, outline:"none", boxSizing:"border-box" }} />
    </div>
  );
}

function Toast({ toast }: { toast: { msg:string; type:"success"|"error" }|null }) {
  if (!toast) return null;
  const ok = toast.type==="success";
  return <div style={{ position:"fixed", top:20, right:16, left:16, maxWidth:360, margin:"0 auto", zIndex:9999, padding:"12px 20px", background:ok?"#0d2b1a":"#2b0d0d", border:`1px solid ${ok?"#22c55e":"#ef4444"}`, borderRadius:10, color:ok?"#22c55e":"#ef4444", fontSize:13, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.4)", animation:"slideIn 0.2s ease" }}>{ok?"✓":"✕"} {toast.msg}</div>;
}

function Chip({ label, color }: { label:string; color:string }) {
  return <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", background:`${color}18`, color, borderRadius:100 }}>{label}</span>;
}

function GlobalStyles() {
  return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}input::placeholder{color:rgba(255,255,255,0.2)!important}input:focus{border-color:rgba(59,130,246,0.5)!important}select option{background:#1c2330}`}</style>;
}

const tdStyle: React.CSSProperties = { padding:"11px 12px", color:"rgba(255,255,255,0.7)", fontSize:12 };