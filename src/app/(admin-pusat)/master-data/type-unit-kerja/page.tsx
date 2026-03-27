"use client";
// src/app/(admin-pusat)/master-data/type-unit-kerja/page.tsx

import { useState, useEffect, useCallback } from "react";

interface TypeUnitKerja {
  id: string;
  nama: string;
  createdAt: string;
  _count?: { opd: number };
}

const API = "/api/master/type-unit-kerja";

export default function TypeUnitKerjaPage() {
  const [data, setData] = useState<TypeUnitKerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<TypeUnitKerja | null>(null);
  const [nama, setNama] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      setData(json.data || []);
    } catch {
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openAdd() { setEditItem(null); setNama(""); setShowForm(true); }
  function openEdit(item: TypeUnitKerja) { setEditItem(item); setNama(item.nama); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditItem(null); setNama(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) return;
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const body = editItem ? { id: editItem.id, nama } : { nama };
      const res = await fetch(API, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menyimpan"); }
      showToast(editItem ? "Berhasil diperbarui" : "Berhasil ditambahkan", "success");
      closeForm(); fetchData();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menghapus"); }
      showToast("Berhasil dihapus", "success"); fetchData();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setDeleteConfirm(null); }
  }

  const filtered = data.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#0d1117" }}>
      <Toast toast={toast} />

      <PageHeader
        breadcrumb="Master Data"
        title="Type Unit Kerja"
        subtitle="Kelola jenis/tipe unit kerja sebagai kategori OPD"
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Cari type unit kerja..." />
        <AddButton onClick={openAdd} label="Tambah Type" />
      </div>

      <DataTable
        columns={["No", "Nama Type Unit Kerja", "Jumlah OPD", "Dibuat", "Aksi"]}
        loading={loading}
        empty={filtered.length === 0}
        emptyMsg={search ? "Tidak ada hasil pencarian" : "Belum ada data"}
      >
        {filtered.map((item, i) => (
          <TableRow key={item.id}>
            <td style={tdStyle}>{i + 1}</td>
            <td style={{ ...tdStyle, color: "white", fontWeight: 600 }}>{item.nama}</td>
            <td style={tdStyle}>
              <Chip label={`${item._count?.opd ?? 0} OPD`} color="#3b82f6" />
            </td>
            <td style={{ ...tdStyle, color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
              {fmtDate(item.createdAt)}
            </td>
            <td style={tdStyle}>
              <RowActions onEdit={() => openEdit(item)} onDelete={() => setDeleteConfirm(item.id)} />
            </td>
          </TableRow>
        ))}
      </DataTable>

      {showForm && (
        <Modal onClose={closeForm} title={editItem ? "Edit Type Unit Kerja" : "Tambah Type Unit Kerja"}>
          <form onSubmit={handleSubmit}>
            <Field label="Nama Type Unit Kerja" required>
              <input autoFocus value={nama} onChange={(e) => setNama(e.target.value)}
                placeholder="contoh: Dinas, Badan, Kantor..." style={inputStyle} required />
            </Field>
            <ModalActions onCancel={closeForm} saving={saving} label={editItem ? "Simpan Perubahan" : "Tambahkan"} />
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <DeleteModal
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm)}
          message="Yakin ingin menghapus type unit kerja ini? Data OPD terkait mungkin terpengaruh."
        />
      )}
      <GlobalStyles />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI Components (inlined agar satu file)
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      padding: "12px 20px",
      background: isSuccess ? "#0d2b1a" : "#2b0d0d",
      border: `1px solid ${isSuccess ? "#22c55e" : "#ef4444"}`,
      borderRadius: 10, color: isSuccess ? "#22c55e" : "#ef4444",
      fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      animation: "slideIn 0.2s ease",
    }}>
      {isSuccess ? "✓" : "✕"} {toast.msg}
    </div>
  );
}

function PageHeader({ breadcrumb, title, subtitle }: { breadcrumb: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>{breadcrumb}</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, marginBottom: 0 }}>{subtitle}</p>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
      <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }}
        width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.35)", whiteSpace: "nowrap" }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      {label}
    </button>
  );
}

function DataTable({ columns, loading, empty, emptyMsg, children }: { columns: string[]; loading: boolean; empty: boolean; emptyMsg: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {columns.map((h) => (
              <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(255,255,255,0.02)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Memuat data...</td></tr>
          ) : empty ? (
            <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>{emptyMsg}</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
      {children}
    </tr>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", background: `${color}18`, color, borderRadius: 100 }}>{label}</span>;
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button onClick={onEdit} style={rowBtnStyle("#3b82f6")}>Edit</button>
      <button onClick={onDelete} style={rowBtnStyle("#ef4444")}>Hapus</button>
    </div>
  );
}

function Modal({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: 480, background: "#161b22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", animation: "slideIn 0.2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "white" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function ModalActions({ onCancel, saving, label, danger }: { onCancel: () => void; saving?: boolean; label: string; danger?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
      <button type="button" onClick={onCancel} style={cancelBtnStyle}>Batal</button>
      <button type="submit" disabled={saving} style={{ ...submitBtnStyle, ...(danger ? { background: "linear-gradient(135deg,#ef4444,#dc2626)" } : {}) }}>
        {saving ? "Menyimpan..." : label}
      </button>
    </div>
  );
}

function DeleteModal({ onCancel, onConfirm, message }: { onCancel: () => void; onConfirm: () => void; message: string }) {
  return (
    <Modal onClose={onCancel} title="Konfirmasi Hapus">
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={cancelBtnStyle}>Batal</button>
        <button onClick={onConfirm} style={{ ...submitBtnStyle, background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>Hapus</button>
      </div>
    </Modal>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2) !important; }
      input:focus, textarea:focus, select:focus { border-color: rgba(59,130,246,0.5) !important; }
      select option { background: #1c2330; }
    `}</style>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const tdStyle: React.CSSProperties = { padding: "13px 16px", color: "rgba(255,255,255,0.7)", fontSize: 13 };
const rowBtnStyle = (color: string): React.CSSProperties => ({ padding: "5px 12px", fontSize: 12, fontWeight: 600, background: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: 6, cursor: "pointer", transition: "all 0.15s" });
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" };
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "none" as const, cursor: "pointer" };
const cancelBtnStyle: React.CSSProperties = { padding: "9px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const submitBtnStyle: React.CSSProperties = { padding: "9px 20px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" };
// export for re-use in same file
export { selectStyle };