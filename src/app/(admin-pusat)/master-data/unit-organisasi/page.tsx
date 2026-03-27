"use client";
// src/app/(admin-pusat)/master-data/unit-organisasi/page.tsx

import { useState, useEffect, useCallback } from "react";

interface UnitOrganisasi {
  id: string; namaUnit: string; opdId: string; eselonId: string;
  opd?: { id:string; nama:string }; eselon?: { id:string; kode:string; nama:string };
  createdAt: string; _count?: { jabatan:number; sekolah:number };
}
interface OPD    { id: string; nama: string; }
interface Eselon { id: string; kode: string; nama: string; }

const emptyForm = { namaUnit:"", opdId:"", eselonId:"" };

function useIsMobile(bp = 768) {
  const [val, setVal] = useState(false);
  useEffect(() => {
    const fn = () => setVal(window.innerWidth < bp);
    fn(); window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return val;
}

export default function UnitOrganisasiPage() {
  const [data, setData]           = useState<UnitOrganisasi[]>([]);
  const [opdList, setOpdList]     = useState<OPD[]>([]);
  const [eselonList, setEselonList] = useState<Eselon[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [filterOpd, setFilterOpd] = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState<UnitOrganisasi|null>(null);
  const [form, setForm]           = useState(emptyForm);
  const [toast, setToast]         = useState<{ msg:string; type:"success"|"error" }|null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string|null>(null);
  const isMobile = useIsMobile();

  const showToast = (msg: string, type: "success"|"error") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterOpd) params.set("opdId", filterOpd);
      const res = await fetch(`/api/master/unit-organisasi?${params}`);
      const json = await res.json(); setData(json.data || []);
    } catch { showToast("Gagal memuat data","error"); }
    finally { setLoading(false); }
  }, [search, filterOpd]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    fetch("/api/master/opd").then((r) => r.json()).then((j) => setOpdList(j.data||[]));
    fetch("/api/master/eselon").then((r) => r.json()).then((j) => setEselonList(j.data||[]));
  }, []);

  function openAdd() { setEditItem(null); setForm(emptyForm); setShowForm(true); }
  function openEdit(item: UnitOrganisasi) {
    setEditItem(item);
    setForm({ namaUnit:item.namaUnit, opdId:item.opdId, eselonId:item.eselonId });
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditItem(null); setForm(emptyForm); }
  function setF(key: keyof typeof emptyForm, val: string) { setForm((p) => ({ ...p, [key]:val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.namaUnit.trim() || !form.opdId || !form.eselonId) return;
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const body   = editItem ? { id:editItem.id, ...form } : form;
      const res = await fetch("/api/master/unit-organisasi", { method, headers:{ "Content-Type":"application/json" }, body:JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error||"Gagal menyimpan"); }
      showToast(editItem ? "Berhasil diperbarui" : "Berhasil ditambahkan","success");
      closeForm(); fetchData();
    } catch (err: any) { showToast(err.message,"error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/master/unit-organisasi?id=${id}`, { method:"DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error||"Gagal menghapus"); }
      showToast("Berhasil dihapus","success"); fetchData();
    } catch (err: any) { showToast(err.message,"error"); }
    finally { setDeleteConfirm(null); }
  }

  return (
    <div style={{ minHeight:"100vh" }}>
      <Toast toast={toast} />
      <PageHeader breadcrumb="Master Data" title="Unit Organisasi" subtitle="Kelola unit organisasi dalam OPD beserta eselon jabatannya" isMobile={isMobile} />

      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Cari unit organisasi..." />
        <FilterSelect
          value={filterOpd} onChange={setFilterOpd}
          options={[{ value:"", label:"Semua OPD" }, ...opdList.map((o) => ({ value:o.id, label:o.nama }))]}
        />
        <AddButton onClick={openAdd} label={isMobile ? "Tambah" : "Tambah Unit"} />
      </div>

      {isMobile ? (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {loading ? <LoadingCards count={3} /> : data.length === 0 ? (
            <EmptyCard msg="Belum ada data unit organisasi" />
          ) : data.map((item) => (
            <div key={item.id} style={cardSt}>
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:4 }}>{item.namaUnit}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  {item.eselon && <Chip label={`Eselon ${item.eselon.kode}`} color="#f59e0b" />}
                  <Chip label={`${item._count?.jabatan??0} jabatan`} color="#3b82f6" />
                </div>
                {item.opd && <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.opd.nama}</div>}
              </div>
              <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                <button onClick={() => openEdit(item)} style={RB("#3b82f6")}>Edit</button>
                <button onClick={() => setDeleteConfirm(item.id)} style={RB("#ef4444")}>Hapus</button>
              </div>
            </div>
          ))}
          {!loading && data.length > 0 && <CountBadge count={data.length} label="unit organisasi ditemukan" />}
        </div>
      ) : (
        <div style={tableCont}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:600 }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                  {["No","Nama Unit Organisasi","OPD","Eselon","Jabatan","Aksi"].map((h) => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={tdEmpty}>Memuat data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={6} style={tdEmpty}>Belum ada data unit organisasi</td></tr>
                ) : data.map((item, i) => (
                  <tr key={item.id} style={trSt} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                    <td style={TD}>{i+1}</td>
                    <td style={{ ...TD, color:"white", fontWeight:600 }}>{item.namaUnit}</td>
                    <td style={TD}>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.opd?.nama||"-"}</div>
                    </td>
                    <td style={TD}>
                      {item.eselon ? <Chip label={`Eselon ${item.eselon.kode}`} color="#f59e0b" /> : <span style={{ color:"rgba(255,255,255,0.3)" }}>-</span>}
                    </td>
                    <td style={TD}><Chip label={`${item._count?.jabatan??0} jabatan`} color="#3b82f6" /></td>
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
          </div>
          {!loading && <div style={footer}>{data.length} unit organisasi ditemukan</div>}
        </div>
      )}

      {showForm && (
        <Modal onClose={closeForm} title={editItem ? "Edit Unit Organisasi" : "Tambah Unit Organisasi"}>
          <form onSubmit={handleSubmit}>
            <Field label="Nama Unit Organisasi" required>
              <input autoFocus value={form.namaUnit} onChange={(e) => setF("namaUnit",e.target.value)} placeholder="contoh: Bidang Pendidikan Menengah" style={IS} required />
            </Field>
            <Field label="OPD" required>
              <div style={{ position:"relative" }}>
                <select value={form.opdId} onChange={(e) => setF("opdId",e.target.value)} style={SEL} required>
                  <option value="">-- Pilih OPD --</option>
                  {opdList.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
                </select>
                <ChevronDown />
              </div>
            </Field>
            <Field label="Eselon" required>
              <div style={{ position:"relative" }}>
                <select value={form.eselonId} onChange={(e) => setF("eselonId",e.target.value)} style={SEL} required>
                  <option value="">-- Pilih Eselon --</option>
                  {eselonList.map((e) => <option key={e.id} value={e.id}>Eselon {e.kode} — {e.nama}</option>)}
                </select>
                <ChevronDown />
              </div>
            </Field>
            <ModalActions onCancel={closeForm} saving={saving} label={editItem ? "Simpan Perubahan" : "Tambahkan"} />
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus">
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:14, marginBottom:20 }}>Yakin ingin menghapus unit organisasi ini? Jabatan yang terhubung mungkin terpengaruh.</p>
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

// ── Shared ────────────────────────────────────────────────────────────────────
function Toast({ toast }: { toast:{ msg:string; type:"success"|"error" }|null }) { if (!toast) return null; const ok=toast.type==="success"; return <div style={{ position:"fixed", top:20, right:16, left:16, maxWidth:360, margin:"0 auto", zIndex:9999, padding:"12px 18px", background:ok?"#0d2b1a":"#2b0d0d", border:`1px solid ${ok?"#22c55e":"#ef4444"}`, borderRadius:10, color:ok?"#22c55e":"#ef4444", fontSize:13, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.4)", animation:"slideIn 0.2s ease" }}>{ok?"✓":"✕"} {toast.msg}</div>; }
function PageHeader({ breadcrumb, title, subtitle, isMobile }: { breadcrumb:string; title:string; subtitle:string; isMobile:boolean }) { return <div style={{ marginBottom:isMobile?16:24 }}><div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:5 }}>{breadcrumb}</div><h1 style={{ fontSize:isMobile?19:24, fontWeight:800, color:"white", margin:0 }}>{title}</h1><p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:3, marginBottom:0 }}>{subtitle}</p></div>; }
function SearchInput({ value, onChange, placeholder }: { value:string; onChange:(v:string)=>void; placeholder:string }) { return <div style={{ position:"relative", flex:1, minWidth:160 }}><svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ width:"100%", paddingLeft:38, paddingRight:14, paddingTop:10, paddingBottom:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"white", fontSize:13, outline:"none", boxSizing:"border-box" }} /></div>; }
function AddButton({ onClick, label }: { onClick:()=>void; label:string }) { return <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 16px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", border:"none", borderRadius:8, color:"white", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(59,130,246,0.3)", whiteSpace:"nowrap" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>{label}</button>; }
function FilterSelect({ value, onChange, options }: { value:string; onChange:(v:string)=>void; options:{ value:string; label:string }[] }) { return <div style={{ position:"relative", flexShrink:0 }}><select value={value} onChange={(e) => onChange(e.target.value)} style={{ padding:"10px 34px 10px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:value?"white":"rgba(255,255,255,0.4)", fontSize:13, outline:"none", cursor:"pointer", appearance:"none", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis" }}>{options.map((o) => <option key={o.value} value={o.value} style={{ background:"#1c2330" }}>{o.label}</option>)}</select><svg style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div>; }
function Chip({ label, color }: { label:string; color:string }) { return <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", background:`${color}18`, color, borderRadius:100, whiteSpace:"nowrap" }}>{label}</span>; }
function ChevronDown() { return <svg style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>; }
function Modal({ children, title, onClose }: { children:React.ReactNode; title:string; onClose:()=>void }) { return <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}><div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)" }} onClick={onClose} /><div style={{ position:"relative", width:"100%", maxWidth:520, background:"#161b22", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:24, boxShadow:"0 24px 80px rgba(0,0,0,0.6)", animation:"slideIn 0.2s ease", maxHeight:"90vh", overflowY:"auto" }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}><h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"white" }}>{title}</h3><button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:18, lineHeight:1, padding:4 }}>✕</button></div>{children}</div></div>; }
function Field({ label, required, children }: { label:string; required?:boolean; children:React.ReactNode }) { return <div style={{ marginBottom:14 }}><label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", marginBottom:7, letterSpacing:"0.05em", textTransform:"uppercase" }}>{label} {required&&<span style={{ color:"#ef4444" }}>*</span>}</label>{children}</div>; }
function ModalActions({ onCancel, saving, label }: { onCancel:()=>void; saving?:boolean; label:string }) { return <div style={{ display:"flex", gap:10, marginTop:22, justifyContent:"flex-end" }}><button type="button" onClick={onCancel} style={CS}>Batal</button><button type="submit" disabled={saving} style={SS}>{saving?"Menyimpan...":label}</button></div>; }
function LoadingCards({ count=3 }: { count?:number }) { return <>{Array.from({length:count}).map((_,i) => <div key={i} style={{ ...cardSt, height:80, animation:"pulse 1.5s ease infinite" }} />)}</>; }
function EmptyCard({ msg }: { msg:string }) { return <div style={{ padding:40, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:13, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10 }}>{msg}</div>; }
function CountBadge({ count, label }: { count:number; label:string }) { return <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center" }}>{count} {label}</div>; }
function GS() { return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}input::placeholder{color:rgba(255,255,255,0.2)!important}input:focus,select:focus{border-color:rgba(59,130,246,0.5)!important}select option{background:#1c2330}`}</style>; }

const cardSt: React.CSSProperties = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px" };
const tableCont: React.CSSProperties = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" };
const TH: React.CSSProperties = { padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.08em", textTransform:"uppercase", background:"rgba(255,255,255,0.02)", whiteSpace:"nowrap" };
const TD: React.CSSProperties = { padding:"12px 16px", color:"rgba(255,255,255,0.7)", fontSize:13 };
const trSt: React.CSSProperties = { borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" };
const hoverOn  = (e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background="rgba(255,255,255,0.03)");
const hoverOff = (e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background="transparent");
const footer: React.CSSProperties = { padding:"10px 16px", borderTop:"1px solid rgba(255,255,255,0.05)", fontSize:12, color:"rgba(255,255,255,0.25)" };
const tdEmpty: React.CSSProperties = { padding:40, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:13 };
const RB = (c: string): React.CSSProperties => ({ padding:"5px 11px", fontSize:12, fontWeight:600, background:`${c}15`, color:c, border:`1px solid ${c}30`, borderRadius:6, cursor:"pointer" });
const IS: React.CSSProperties = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"white", fontSize:14, outline:"none", boxSizing:"border-box" };
const SEL: React.CSSProperties = { ...IS, appearance:"none" as const, cursor:"pointer" };
const CS: React.CSSProperties = { padding:"9px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:600, cursor:"pointer" };
const SS: React.CSSProperties = { padding:"9px 18px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", border:"none", borderRadius:8, color:"white", fontSize:13, fontWeight:700, cursor:"pointer" };