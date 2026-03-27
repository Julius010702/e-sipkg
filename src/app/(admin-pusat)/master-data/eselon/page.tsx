"use client";
// src/app/(admin-pusat)/master-data/eselon/page.tsx

import { useState, useEffect, useCallback } from "react";

interface Eselon { id: string; kode: string; nama: string; createdAt: string; }

const API = "/api/master/eselon";
const ESELON_DEFAULTS = [
  { kode:"I", nama:"Eselon I" }, { kode:"II", nama:"Eselon II" },
  { kode:"III", nama:"Eselon III" }, { kode:"IV", nama:"Eselon IV" },
  { kode:"NON", nama:"Non Eselon" },
];

function useIsMobile(bp = 768) {
  const [val, setVal] = useState(false);
  useEffect(() => {
    const fn = () => setVal(window.innerWidth < bp);
    fn(); window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return val;
}

export default function EselonPage() {
  const [data, setData]         = useState<Eselon[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Eselon | null>(null);
  const [form, setForm]         = useState({ kode:"", nama:"" });
  const [toast, setToast]       = useState<{ msg:string; type:"success"|"error" }|null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string|null>(null);
  const isMobile = useIsMobile();

  const showToast = (msg: string, type: "success"|"error") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API); const json = await res.json();
      setData(json.data || []);
    } catch { showToast("Gagal memuat data","error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openAdd() { setEditItem(null); setForm({ kode:"", nama:"" }); setShowForm(true); }
  function openEdit(item: Eselon) { setEditItem(item); setForm({ kode:item.kode, nama:item.nama }); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditItem(null); setForm({ kode:"", nama:"" }); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.kode.trim() || !form.nama.trim()) return;
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const body   = editItem ? { id:editItem.id, ...form } : form;
      const res = await fetch(API, { method, headers:{ "Content-Type":"application/json" }, body:JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error||"Gagal menyimpan"); }
      showToast(editItem ? "Eselon diperbarui" : "Eselon ditambahkan","success");
      closeForm(); fetchData();
    } catch (err: any) { showToast(err.message,"error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${API}?id=${id}`, { method:"DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error||"Gagal menghapus"); }
      showToast("Eselon dihapus","success"); fetchData();
    } catch (err: any) { showToast(err.message,"error"); }
    finally { setDeleteConfirm(null); }
  }

  async function seedDefault() {
    setSaving(true);
    try {
      for (const e of ESELON_DEFAULTS)
        await fetch(API, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(e) });
      showToast("Data default berhasil ditambahkan","success"); fetchData();
    } catch { showToast("Gagal menambah data default","error"); }
    finally { setSaving(false); }
  }

  const filtered = data.filter((d) =>
    d.nama.toLowerCase().includes(search.toLowerCase()) ||
    d.kode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight:"100vh" }}>
      <Toast toast={toast} />
      <PageHeader breadcrumb="Master Data" title="Eselon" subtitle="Kelola tingkatan eselon untuk unit organisasi" isMobile={isMobile} />

      {/* Toolbar */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Cari eselon..." />
        {data.length === 0 && (
          <button onClick={seedDefault} disabled={saving}
            style={{ padding:"10px 14px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
            + Data Default
          </button>
        )}
        <AddButton onClick={openAdd} label={isMobile ? "Tambah" : "Tambah Eselon"} />
      </div>

      {/* Content */}
      {isMobile ? (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {loading ? (
            <LoadingCards />
          ) : filtered.length === 0 ? (
            <EmptyCard msg={data.length === 0 ? "Belum ada data eselon. Klik '+ Data Default' untuk mengisi." : "Tidak ada hasil pencarian"} />
          ) : filtered.map((item, i) => (
            <div key={item.id} style={cardSt}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontFamily:"monospace", fontSize:14, fontWeight:800, padding:"4px 12px", background:"#3b82f618", color:"#3b82f6", borderRadius:8, flexShrink:0 }}>{item.kode}</span>
                  <span style={{ fontSize:14, fontWeight:600, color:"white" }}>{item.nama}</span>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <button onClick={() => openEdit(item)} style={RB("#3b82f6")}>Edit</button>
                  <button onClick={() => setDeleteConfirm(item.id)} style={RB("#ef4444")}>Hapus</button>
                </div>
              </div>
            </div>
          ))}
          {!loading && filtered.length > 0 && <CountBadge count={filtered.length} label="eselon" />}
        </div>
      ) : (
        <div style={tableCont}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                {["No","Kode","Nama Eselon","Aksi"].map((h) => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={tdEmpty}>Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} style={tdEmpty}>{data.length === 0 ? "Belum ada data eselon." : "Tidak ada hasil pencarian"}</td></tr>
              ) : filtered.map((item, i) => (
                <tr key={item.id} style={trSt} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                  <td style={TD}>{i+1}</td>
                  <td style={TD}><span style={{ fontFamily:"monospace", fontSize:13, fontWeight:700, padding:"3px 10px", background:"#3b82f618", color:"#3b82f6", borderRadius:6 }}>{item.kode}</span></td>
                  <td style={{ ...TD, color:"white", fontWeight:600 }}>{item.nama}</td>
                  <td style={TD}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => openEdit(item)} style={RB("#3b82f6")}>Edit</button>
                      <button onClick={() => setDeleteConfirm(item.id)} style={RB("#ef4444")}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && <div style={footer}>{filtered.length} eselon</div>}
        </div>
      )}

      {showForm && (
        <Modal onClose={closeForm} title={editItem ? "Edit Eselon" : "Tambah Eselon"}>
          <form onSubmit={handleSubmit}>
            <Field label="Kode Eselon" required>
              <input autoFocus value={form.kode} onChange={(e) => setForm((p) => ({ ...p, kode:e.target.value }))} placeholder="I, II, III, IV, NON" style={IS} required />
            </Field>
            <Field label="Nama Eselon" required>
              <input value={form.nama} onChange={(e) => setForm((p) => ({ ...p, nama:e.target.value }))} placeholder="contoh: Eselon II" style={IS} required />
            </Field>
            <ModalActions onCancel={closeForm} saving={saving} label={editItem ? "Simpan" : "Tambahkan"} />
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus">
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:14, marginBottom:20 }}>Yakin ingin menghapus eselon ini? Unit organisasi terkait mungkin terpengaruh.</p>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={() => setDeleteConfirm(null)} style={CS}>Batal</button>
            <button onClick={() => handleDelete(deleteConfirm)} style={{ ...SS, background:"linear-gradient(135deg,#ef4444,#dc2626)" }}>Hapus</button>
          </div>
        </Modal>
      )}
      <GS />
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function Toast({ toast }: { toast:{ msg:string; type:"success"|"error" }|null }) {
  if (!toast) return null;
  const ok = toast.type === "success";
  return <div style={{ position:"fixed", top:20, right:16, left:16, maxWidth:360, margin:"0 auto", zIndex:9999, padding:"12px 18px", background:ok?"#0d2b1a":"#2b0d0d", border:`1px solid ${ok?"#22c55e":"#ef4444"}`, borderRadius:10, color:ok?"#22c55e":"#ef4444", fontSize:13, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.4)", animation:"slideIn 0.2s ease" }}>{ok?"✓":"✕"} {toast.msg}</div>;
}
function PageHeader({ breadcrumb, title, subtitle, isMobile }: { breadcrumb:string; title:string; subtitle:string; isMobile:boolean }) {
  return <div style={{ marginBottom:isMobile?16:24 }}><div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:5 }}>{breadcrumb}</div><h1 style={{ fontSize:isMobile?19:24, fontWeight:800, color:"white", margin:0 }}>{title}</h1><p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:3, marginBottom:0 }}>{subtitle}</p></div>;
}
function SearchInput({ value, onChange, placeholder }: { value:string; onChange:(v:string)=>void; placeholder:string }) {
  return <div style={{ position:"relative", flex:1, minWidth:160 }}><svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ width:"100%", paddingLeft:38, paddingRight:14, paddingTop:10, paddingBottom:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"white", fontSize:13, outline:"none", boxSizing:"border-box" }} /></div>;
}
function AddButton({ onClick, label }: { onClick:()=>void; label:string }) {
  return <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 16px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", border:"none", borderRadius:8, color:"white", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(59,130,246,0.3)", whiteSpace:"nowrap" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>{label}</button>;
}
function Modal({ children, title, onClose }: { children:React.ReactNode; title:string; onClose:()=>void }) {
  return <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}><div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)" }} onClick={onClose} /><div style={{ position:"relative", width:"100%", maxWidth:440, background:"#161b22", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:24, boxShadow:"0 24px 80px rgba(0,0,0,0.6)", animation:"slideIn 0.2s ease", maxHeight:"90vh", overflowY:"auto" }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}><h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"white" }}>{title}</h3><button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:18, lineHeight:1, padding:4 }}>✕</button></div>{children}</div></div>;
}
function Field({ label, required, children }: { label:string; required?:boolean; children:React.ReactNode }) {
  return <div style={{ marginBottom:14 }}><label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", marginBottom:7, letterSpacing:"0.05em", textTransform:"uppercase" }}>{label}{required&&<span style={{ color:"#ef4444" }}>*</span>}</label>{children}</div>;
}
function ModalActions({ onCancel, saving, label }: { onCancel:()=>void; saving?:boolean; label:string }) {
  return <div style={{ display:"flex", gap:10, marginTop:22, justifyContent:"flex-end" }}><button type="button" onClick={onCancel} style={CS}>Batal</button><button type="submit" disabled={saving} style={SS}>{saving?"Menyimpan...":label}</button></div>;
}
function LoadingCards() { return <>{Array.from({length:3}).map((_,i) => <div key={i} style={{ ...cardSt, height:52, animation:"pulse 1.5s ease infinite" }} />)}</>; }
function EmptyCard({ msg }: { msg:string }) { return <div style={{ padding:40, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:13, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10 }}>{msg}</div>; }
function CountBadge({ count, label }: { count:number; label:string }) { return <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center" }}>{count} {label}</div>; }
function GS() { return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}input:focus{border-color:rgba(59,130,246,0.5)!important}`}</style>; }

const cardSt: React.CSSProperties = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px" };
const tableCont: React.CSSProperties = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" };
const TH: React.CSSProperties = { padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.08em", textTransform:"uppercase", background:"rgba(255,255,255,0.02)" };
const TD: React.CSSProperties = { padding:"12px 16px", color:"rgba(255,255,255,0.7)", fontSize:13 };
const trSt: React.CSSProperties = { borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" };
const hoverOn  = (e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)");
const hoverOff = (e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background = "transparent");
const footer: React.CSSProperties = { padding:"10px 16px", borderTop:"1px solid rgba(255,255,255,0.05)", fontSize:12, color:"rgba(255,255,255,0.25)" };
const tdEmpty: React.CSSProperties = { padding:40, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:13 };
const RB = (c: string): React.CSSProperties => ({ padding:"5px 11px", fontSize:12, fontWeight:600, background:`${c}15`, color:c, border:`1px solid ${c}30`, borderRadius:6, cursor:"pointer" });
const IS: React.CSSProperties = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"white", fontSize:14, outline:"none", boxSizing:"border-box" };
const CS: React.CSSProperties = { padding:"9px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:600, cursor:"pointer" };
const SS: React.CSSProperties = { padding:"9px 18px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", border:"none", borderRadius:8, color:"white", fontSize:13, fontWeight:700, cursor:"pointer" };