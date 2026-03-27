"use client";
// src/app/(sekolah)/unit-organisasi/page.tsx

import { useState, useEffect, useCallback } from "react";

interface UnitOrganisasi {
  id: string;
  namaUnit: string;
  opdId: string;
  eselonId: string;
  opd?: { id: string; nama: string };
  eselon?: { id: string; kode: string; nama: string };
  createdAt: string;
  _count?: { jabatan: number };
}
interface Eselon { id: string; kode: string; nama: string; }

const emptyForm = { namaUnit: "", eselonId: "" };

export default function UnitOrganisasiSekolahPage() {
  const [data, setData] = useState<UnitOrganisasi[]>([]);
  const [eselonList, setEselonList] = useState<Eselon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<UnitOrganisasi | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/master/unit-organisasi");
      const json = await res.json();
      setData(json.data || []);
    } catch { showToast("Gagal memuat data", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    fetch("/api/master/eselon").then((r) => r.json()).then((j) => setEselonList(j.data || []));
  }, []);

  function openAdd() { setEditItem(null); setForm(emptyForm); setShowForm(true); }
  function openEdit(item: UnitOrganisasi) { setEditItem(item); setForm({ namaUnit: item.namaUnit, eselonId: item.eselonId }); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditItem(null); setForm(emptyForm); }
  function setF(k: keyof typeof emptyForm, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.namaUnit.trim() || !form.eselonId) return;
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const body = editItem ? { id: editItem.id, ...form } : form;
      const res = await fetch("/api/master/unit-organisasi", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menyimpan"); }
      showToast(editItem ? "Berhasil diperbarui" : "Berhasil ditambahkan", "success");
      closeForm(); fetchData();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/master/unit-organisasi?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menghapus"); }
      showToast("Berhasil dihapus", "success"); fetchData();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setDeleteConfirm(null); }
  }

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#0d1117" }}>
      <Toast toast={toast} />
      <div style={{ marginBottom: 28 }}>
        <div style={breadcrumbStyle}>Pengaturan Sekolah</div>
        <h1 style={h1Style}>Unit Organisasi</h1>
        <p style={subtitleStyle}>Kelola struktur unit organisasi di sekolah Anda</p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <AddBtn onClick={openAdd} label="Tambah Unit" />
      </div>

      <div style={tableWrap}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={theadRow}>
              {["No", "Nama Unit Organisasi", "Eselon", "Jabatan Terkait", "Dibuat", "Aksi"].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadRow cols={6} msg="Memuat data..." /> :
              data.length === 0 ? <LoadRow cols={6} msg="Belum ada unit organisasi. Klik 'Tambah Unit' untuk memulai." /> :
                data.map((item, i) => (
                  <tr key={item.id} style={trHover} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={td}>{i + 1}</td>
                    <td style={{ ...td, color: "white", fontWeight: 600 }}>{item.namaUnit}</td>
                    <td style={td}><Chip label={item.eselon ? `Eselon ${item.eselon.kode}` : "-"} color="#f59e0b" /></td>
                    <td style={td}><Chip label={`${item._count?.jabatan ?? 0} jabatan`} color="#10b981" /></td>
                    <td style={{ ...td, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{fmtDate(item.createdAt)}</td>
                    <td style={td}><RowActs onEdit={() => openEdit(item)} onDelete={() => setDeleteConfirm(item.id)} /></td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal onClose={closeForm} title={editItem ? "Edit Unit Organisasi" : "Tambah Unit Organisasi"}>
          <form onSubmit={handleSubmit}>
            <Fld label="Nama Unit Organisasi" req>
              <input autoFocus value={form.namaUnit} onChange={(e) => setF("namaUnit", e.target.value)} placeholder="contoh: Bidang Kurikulum" style={inputSt} required />
            </Fld>
            <Fld label="Eselon" req>
              <SWrap>
                <select value={form.eselonId} onChange={(e) => setF("eselonId", e.target.value)} style={selectSt} required>
                  <option value="">-- Pilih Eselon --</option>
                  {eselonList.map((e) => <option key={e.id} value={e.id}>Eselon {e.kode} — {e.nama}</option>)}
                </select>
                <Chev />
              </SWrap>
            </Fld>
            <MActions onCancel={closeForm} saving={saving} label={editItem ? "Simpan" : "Tambahkan"} />
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <DelModal onCancel={() => setDeleteConfirm(null)} onConfirm={() => handleDelete(deleteConfirm)}
          msg="Hapus unit organisasi ini? Jabatan terkait mungkin terpengaruh." />
      )}
      <GStyles />
    </div>
  );
}

// ── Shared primitives (used across all sekolah pages) ─────────────────────────
export function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) {
  if (!toast) return null;
  const ok = toast.type === "success";
  return <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", background: ok ? "#0d2b1a" : "#2b0d0d", border: `1px solid ${ok ? "#22c55e" : "#ef4444"}`, borderRadius: 10, color: ok ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease" }}>{ok ? "✓" : "✕"} {toast.msg}</div>;
}
export function Chip({ label, color }: { label: string; color: string }) { return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", background: `${color}18`, color, borderRadius: 100, whiteSpace: "nowrap" }}>{label}</span>; }
export function AddBtn({ onClick, label }: { onClick: () => void; label: string }) { return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.3)", whiteSpace: "nowrap" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>{label}</button>; }
export function RowActs({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) { return <div style={{ display: "flex", gap: 6 }}><button onClick={onEdit} style={rb("#3b82f6")}>Edit</button><button onClick={onDelete} style={rb("#ef4444")}>Hapus</button></div>; }
export function Modal({ children, title, onClose, maxWidth = 500 }: { children: React.ReactNode; title: string; onClose: () => void; maxWidth?: number }) { return <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}><div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }} onClick={onClose} /><div style={{ position: "relative", width: "100%", maxWidth, background: "#161b22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", animation: "slideIn 0.2s ease", maxHeight: "90vh", overflowY: "auto" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}><h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "white" }}>{title}</h3><button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button></div>{children}</div></div>; }
export function Fld({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) { return <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}{req && <span style={{ color: "#ef4444" }}>*</span>}</label>{children}</div>; }
export function MActions({ onCancel, saving, label }: { onCancel: () => void; saving?: boolean; label: string }) { return <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}><button type="button" onClick={onCancel} style={cancelSt}>Batal</button><button type="submit" disabled={saving} style={submitSt}>{saving ? "Menyimpan..." : label}</button></div>; }
export function DelModal({ onCancel, onConfirm, msg }: { onCancel: () => void; onConfirm: () => void; msg: string }) { return <Modal onClose={onCancel} title="Konfirmasi Hapus"><p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>{msg}</p><div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button onClick={onCancel} style={cancelSt}>Batal</button><button onClick={onConfirm} style={{ ...submitSt, background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>Hapus</button></div></Modal>; }
export function SWrap({ children }: { children: React.ReactNode }) { return <div style={{ position: "relative" }}>{children}</div>; }
export function Chev() { return <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>; }
export function LoadRow({ cols, msg }: { cols: number; msg: string }) { return <tr><td colSpan={cols} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>{msg}</td></tr>; }
export function GStyles() { return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)!important}input:focus,textarea:focus,select:focus{border-color:rgba(16,185,129,0.5)!important}select option{background:#1c2330}`}</style>; }
export function fmtDate(d: string) { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }

export const breadcrumbStyle: React.CSSProperties = { fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 };
export const h1Style: React.CSSProperties = { fontSize: 24, fontWeight: 800, color: "white", margin: 0 };
export const subtitleStyle: React.CSSProperties = { fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, marginBottom: 0 };
export const tableWrap: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "auto" };
export const theadRow: React.CSSProperties = { borderBottom: "1px solid rgba(255,255,255,0.07)" };
export const th: React.CSSProperties = { padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(255,255,255,0.02)", whiteSpace: "nowrap" };
export const td: React.CSSProperties = { padding: "13px 16px", color: "rgba(255,255,255,0.7)", fontSize: 13 };
export const trHover: React.CSSProperties = { borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" };
export const inputSt: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" };
export const selectSt: React.CSSProperties = { ...inputSt, appearance: "none" as const, cursor: "pointer" };
export const cancelSt: React.CSSProperties = { padding: "9px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" };
export const submitSt: React.CSSProperties = { padding: "9px 20px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const rb = (c: string): React.CSSProperties => ({ padding: "5px 12px", fontSize: 12, fontWeight: 600, background: `${c}15`, color: c, border: `1px solid ${c}30`, borderRadius: 6, cursor: "pointer" });