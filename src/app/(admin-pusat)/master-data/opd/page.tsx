"use client";
// src/app/(admin-pusat)/master-data/opd/page.tsx

import { useState, useEffect, useCallback } from "react";

interface OPD {
  id: string;
  nama: string;
  indukUnitKerja?: string;
  kawil?: string;
  typeUnitKerjaId: string;
  typeUnitKerja?: { id: string; nama: string };
  createdAt: string;
  _count?: { sekolah: number; jabatan: number };
}

interface TypeUnitKerja { id: string; nama: string; }

const API_OPD = "/api/master/opd";
const API_TYPE = "/api/master/type-unit-kerja";

const emptyForm = { nama: "", indukUnitKerja: "", kawil: "", typeUnitKerjaId: "" };

export default function OPDPage() {
  const [data, setData] = useState<OPD[]>([]);
  const [typeList, setTypeList] = useState<TypeUnitKerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<OPD | null>(null);
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
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterType) params.set("typeUnitKerjaId", filterType);
      const res = await fetch(`${API_OPD}?${params}`);
      const json = await res.json();
      setData(json.data || []);
    } catch { showToast("Gagal memuat data", "error"); }
    finally { setLoading(false); }
  }, [search, filterType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    fetch(API_TYPE).then((r) => r.json()).then((j) => setTypeList(j.data || []));
  }, []);

  function openAdd() { setEditItem(null); setForm(emptyForm); setShowForm(true); }
  function openEdit(item: OPD) {
    setEditItem(item);
    setForm({ nama: item.nama, indukUnitKerja: item.indukUnitKerja || "", kawil: item.kawil || "", typeUnitKerjaId: item.typeUnitKerjaId });
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditItem(null); setForm(emptyForm); }
  function setF(key: keyof typeof emptyForm, val: string) { setForm((p) => ({ ...p, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama.trim() || !form.typeUnitKerjaId) return;
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const body = editItem ? { id: editItem.id, ...form } : form;
      const res = await fetch(API_OPD, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menyimpan"); }
      showToast(editItem ? "OPD berhasil diperbarui" : "OPD berhasil ditambahkan", "success");
      closeForm(); fetchData();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${API_OPD}?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menghapus"); }
      showToast("OPD berhasil dihapus", "success"); fetchData();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setDeleteConfirm(null); }
  }

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#0d1117" }}>
      <Toast toast={toast} />

      <PageHeader breadcrumb="Master Data" title="OPD" subtitle="Kelola daftar Organisasi Perangkat Daerah (OPD)" />

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Cari OPD..." />
        {/* Filter by type */}
        <div style={{ position: "relative" }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: "10px 36px 10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: filterType ? "white" : "rgba(255,255,255,0.35)", fontSize: 13, outline: "none", cursor: "pointer", appearance: "none" }}
          >
            <option value="">Semua Type</option>
            {typeList.map((t) => <option key={t.id} value={t.id}>{t.nama}</option>)}
          </select>
          <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
        <AddButton onClick={openAdd} label="Tambah OPD" />
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["No", "Nama OPD", "Type Unit Kerja", "Induk Unit Kerja", "Kawil", "Sekolah", "Aksi"].map((h) => (
                <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(255,255,255,0.02)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Memuat data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>{search || filterType ? "Tidak ada hasil" : "Belum ada data OPD"}</td></tr>
            ) : data.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={tdStyle}>{i + 1}</td>
                <td style={{ ...tdStyle, color: "white", fontWeight: 600, maxWidth: 240 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nama}</div>
                </td>
                <td style={tdStyle}>
                  <Chip label={item.typeUnitKerja?.nama || "-"} color="#8b5cf6" />
                </td>
                <td style={{ ...tdStyle, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{item.indukUnitKerja || "-"}</td>
                <td style={{ ...tdStyle, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{item.kawil || "-"}</td>
                <td style={tdStyle}>
                  <Chip label={`${item._count?.sekolah ?? 0}`} color="#10b981" />
                </td>
                <td style={tdStyle}>
                  <RowActions onEdit={() => openEdit(item)} onDelete={() => setDeleteConfirm(item.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && (
          <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            {data.length} OPD ditemukan
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <Modal onClose={closeForm} title={editItem ? "Edit OPD" : "Tambah OPD"}>
          <form onSubmit={handleSubmit}>
            <Field label="Nama OPD" required>
              <input value={form.nama} onChange={(e) => setF("nama", e.target.value)}
                placeholder="contoh: Dinas Pendidikan Provinsi NTT" style={inputStyle} required autoFocus />
            </Field>
            <Field label="Type Unit Kerja" required>
              <div style={{ position: "relative" }}>
                <select value={form.typeUnitKerjaId} onChange={(e) => setF("typeUnitKerjaId", e.target.value)}
                  style={selectStyle} required>
                  <option value="">-- Pilih Type --</option>
                  {typeList.map((t) => <option key={t.id} value={t.id}>{t.nama}</option>)}
                </select>
                <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Induk Unit Kerja">
                <input value={form.indukUnitKerja} onChange={(e) => setF("indukUnitKerja", e.target.value)}
                  placeholder="Opsional" style={inputStyle} />
              </Field>
              <Field label="Kawil">
                <input value={form.kawil} onChange={(e) => setF("kawil", e.target.value)}
                  placeholder="Opsional" style={inputStyle} />
              </Field>
            </div>
            <ModalActions onCancel={closeForm} saving={saving} label={editItem ? "Simpan Perubahan" : "Tambahkan"} />
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <DeleteModal
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm)}
          message="Yakin ingin menghapus OPD ini? Data unit organisasi dan sekolah terkait mungkin terpengaruh."
        />
      )}
      <GlobalStyles />
    </div>
  );
}

// ── Shared components (same pattern) ─────────────────────────────────────────
function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) {
  if (!toast) return null;
  const ok = toast.type === "success";
  return <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", background: ok ? "#0d2b1a" : "#2b0d0d", border: `1px solid ${ok ? "#22c55e" : "#ef4444"}`, borderRadius: 10, color: ok ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease" }}>{ok ? "✓" : "✕"} {toast.msg}</div>;
}
function PageHeader({ breadcrumb, title, subtitle }: { breadcrumb: string; title: string; subtitle: string }) {
  return <div style={{ marginBottom: 28 }}><div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>{breadcrumb}</div><h1 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0 }}>{title}</h1><p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, marginBottom: 0 }}>{subtitle}</p></div>;
}
function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <div style={{ position: "relative", flex: 1, minWidth: 200 }}><svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>;
}
function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.35)", whiteSpace: "nowrap" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>{label}</button>;
}
function Chip({ label, color }: { label: string; color: string }) { return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", background: `${color}18`, color, borderRadius: 100, whiteSpace: "nowrap" }}>{label}</span>; }
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) { return <div style={{ display: "flex", gap: 6 }}><button onClick={onEdit} style={rowBtnStyle("#3b82f6")}>Edit</button><button onClick={onDelete} style={rowBtnStyle("#ef4444")}>Hapus</button></div>; }
function Modal({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) { return <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}><div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} onClick={onClose} /><div style={{ position: "relative", width: "100%", maxWidth: 520, background: "#161b22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", animation: "slideIn 0.2s ease", maxHeight: "90vh", overflowY: "auto" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}><h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "white" }}>{title}</h3><button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button></div>{children}</div></div>; }
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label} {required && <span style={{ color: "#ef4444" }}>*</span>}</label>{children}</div>; }
function ModalActions({ onCancel, saving, label }: { onCancel: () => void; saving?: boolean; label: string }) { return <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}><button type="button" onClick={onCancel} style={cancelBtnStyle}>Batal</button><button type="submit" disabled={saving} style={submitBtnStyle}>{saving ? "Menyimpan..." : label}</button></div>; }
function DeleteModal({ onCancel, onConfirm, message }: { onCancel: () => void; onConfirm: () => void; message: string }) { return <Modal onClose={onCancel} title="Konfirmasi Hapus"><p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>{message}</p><div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button onClick={onCancel} style={cancelBtnStyle}>Batal</button><button onClick={onConfirm} style={{ ...submitBtnStyle, background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>Hapus</button></div></Modal>; }
function GlobalStyles() { return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)!important}input:focus,textarea:focus,select:focus{border-color:rgba(59,130,246,0.5)!important}select option{background:#1c2330}`}</style>; }

const tdStyle: React.CSSProperties = { padding: "13px 16px", color: "rgba(255,255,255,0.7)", fontSize: 13 };
const rowBtnStyle = (c: string): React.CSSProperties => ({ padding: "5px 12px", fontSize: 12, fontWeight: 600, background: `${c}15`, color: c, border: `1px solid ${c}30`, borderRadius: 6, cursor: "pointer" });
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" };
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "none" as const, cursor: "pointer" };
const cancelBtnStyle: React.CSSProperties = { padding: "9px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const submitBtnStyle: React.CSSProperties = { padding: "9px 20px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" };