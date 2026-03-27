"use client";
// src/app/(sekolah)/jabatan/page.tsx

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Jabatan {
  id: string;
  kodeJabatan: string;
  namaJabatan: string;
  jenisJabatan: "STRUKTURAL" | "FUNGSIONAL" | "PELAKSANA";
  indukJabatan?: { id: string; namaJabatan: string } | null;
  unitOrganisasi?: { id: string; namaUnit: string } | null;
  urusan?: { id: string; nama: string } | null;
  anjab?: { progressPersen: number; abk?: { statusKebutuhan?: string | null } | null } | null;
  createdAt: string;
}
interface UnitOrg { id: string; namaUnit: string; }
interface Urusan { id: string; nama: string; }

const emptyForm = {
  namaJabatan: "",
  kodeJabatan: "",
  jenisJabatan: "FUNGSIONAL" as "STRUKTURAL" | "FUNGSIONAL" | "PELAKSANA",
  unitOrganisasiId: "",
  indukJabatanId: "",
  urusanId: "",
};

const JENIS_COLOR: Record<string, string> = {
  STRUKTURAL: "#3b82f6",
  FUNGSIONAL: "#10b981",
  PELAKSANA: "#f59e0b",
};
const STATUS_COLOR: Record<string, string> = {
  KURANG: "#ef4444",
  LEBIH: "#f59e0b",
  SESUAI: "#22c55e",
};

export default function JabatanPage() {
  const [data, setData] = useState<Jabatan[]>([]);
  const [unitList, setUnitList] = useState<UnitOrg[]>([]);
  const [urusanList, setUrusanList] = useState<Urusan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Jabatan | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (filterJenis) p.set("jenisJabatan", filterJenis);
      const res = await fetch(`/api/jabatan?${p}`);
      const json = await res.json();
      setData(json.data || []);
    } catch { showToast("Gagal memuat data", "error"); }
    finally { setLoading(false); }
  }, [search, filterJenis]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    fetch("/api/master/unit-organisasi").then((r) => r.json()).then((j) => setUnitList(j.data || []));
    fetch("/api/master/urusan").then((r) => r.json()).then((j) => setUrusanList(j.data || []));
  }, []);

  function closeForm() { setShowForm(false); setForm(emptyForm); }
  function setF(k: keyof typeof emptyForm, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  function autoKode() {
    const prefix = form.jenisJabatan === "STRUKTURAL" ? "STR" : form.jenisJabatan === "FUNGSIONAL" ? "FNG" : "PLK";
    setF("kodeJabatan", `${prefix}-${Date.now().toString().slice(-5)}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.namaJabatan.trim() || !form.kodeJabatan.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/jabatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menyimpan"); }
      showToast("Jabatan berhasil ditambahkan", "success");
      closeForm(); fetchData();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/jabatan/${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menghapus"); }
      showToast("Jabatan berhasil dihapus", "success"); fetchData();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setDeleteConfirm(null); }
  }

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#0d1117" }}>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={BC}>Manajemen Jabatan</div>
        <h1 style={H1}>Daftar Jabatan</h1>
        <p style={SUB}>Kelola jabatan struktural, fungsional, dan pelaksana di sekolah Anda</p>
      </div>

      {/* ── Quick Nav Buttons ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <QuickBtn
          label="ANJAB & ABK"
          desc="Analisis Jabatan & Analisis Beban Kerja"
          color="#10b981"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          }
          note="Pilih jabatan di tabel untuk mengakses"
        />
        <QuickBtn
          label="Bezeting"
          desc="Data Pengisian Jabatan"
          color="#8b5cf6"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          note="Pilih jabatan di tabel untuk mengakses"
        />
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <SearchBox value={search} onChange={setSearch} />
        <FSelect
          value={filterJenis}
          onChange={setFilterJenis}
          opts={[
            { v: "", l: "Semua Jenis" },
            { v: "STRUKTURAL", l: "Struktural" },
            { v: "FUNGSIONAL", l: "Fungsional" },
            { v: "PELAKSANA", l: "Pelaksana" },
          ]}
        />
        <AddBtn label="Tambah Jabatan" onClick={() => setShowForm(true)} />
      </div>

      {/* Table */}
      <div style={TW}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["No", "Kode", "Nama Jabatan", "Jenis", "Unit Organisasi", "Progress ANJAB", "Status ABK", "Aksi"].map((h) => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LRow cols={8} msg="Memuat data..." />
            ) : data.length === 0 ? (
              <LRow cols={8} msg={search ? "Tidak ada hasil" : "Belum ada jabatan. Klik 'Tambah Jabatan' untuk memulai."} />
            ) : data.map((item, i) => {
              const progress = item.anjab?.progressPersen ?? 0;
              const status = item.anjab?.abk?.statusKebutuhan;
              return (
                <tr key={item.id} style={TR}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={TD}>{i + 1}</td>
                  <td style={{ ...TD, fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    {item.kodeJabatan}
                  </td>
                  <td style={{ ...TD, color: "white", fontWeight: 600, maxWidth: 200 }}>
                    <Link href={`/jabatan/${item.id}/anjab`} style={{ color: "white", textDecoration: "none" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.namaJabatan}</div>
                      {item.indukJabatan && (
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                          ↑ {item.indukJabatan.namaJabatan}
                        </div>
                      )}
                    </Link>
                  </td>
                  <td style={TD}>
                    <Chip label={item.jenisJabatan} color={JENIS_COLOR[item.jenisJabatan]} />
                  </td>
                  <td style={{ ...TD, fontSize: 12, color: "rgba(255,255,255,0.45)", maxWidth: 160 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.unitOrganisasi?.namaUnit || "—"}
                    </div>
                  </td>
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden", minWidth: 60 }}>
                        <div style={{
                          height: "100%", width: `${progress}%`,
                          background: progress === 100 ? "#22c55e" : progress > 50 ? "#f59e0b" : "#3b82f6",
                          borderRadius: 3, transition: "width 0.3s",
                        }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: progress === 100 ? "#22c55e" : "rgba(255,255,255,0.5)", minWidth: 28 }}>
                        {progress}%
                      </span>
                    </div>
                  </td>
                  <td style={TD}>
                    {status
                      ? <Chip label={status} color={STATUS_COLOR[status] || "#666"} />
                      : <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Belum</span>
                    }
                  </td>
                  <td style={TD}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <Link href={`/jabatan/${item.id}/anjab`} style={linkBtn("#10b981")}>ANJAB</Link>
                      <Link href={`/jabatan/${item.id}/abk`} style={linkBtn("#3b82f6")}>ABK</Link>
                      <Link href={`/jabatan/${item.id}/bezeting`} style={linkBtn("#8b5cf6")}>Bezeting</Link>
                      <button onClick={() => setDeleteConfirm(item)} style={rb("#ef4444")}>Hapus</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && (
          <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            {data.length} jabatan
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <Modal onClose={closeForm} title="Tambah Jabatan Baru" maxWidth={560}>
          <form onSubmit={handleSubmit}>
            <Grid2>
              <Fld label="Nama Jabatan" req>
                <input autoFocus value={form.namaJabatan} onChange={(e) => setF("namaJabatan", e.target.value)}
                  placeholder="Nama jabatan" style={IS} required />
              </Fld>
              <Fld label="Jenis Jabatan" req>
                <SWrap>
                  <select value={form.jenisJabatan} onChange={(e) => setF("jenisJabatan", e.target.value as any)} style={SS} required>
                    <option value="STRUKTURAL">Struktural</option>
                    <option value="FUNGSIONAL">Fungsional</option>
                    <option value="PELAKSANA">Pelaksana</option>
                  </select>
                  <Chev />
                </SWrap>
              </Fld>
            </Grid2>
            <Fld label="Kode Jabatan" req>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={form.kodeJabatan} onChange={(e) => setF("kodeJabatan", e.target.value)}
                  placeholder="contoh: STR-001" style={{ ...IS, flex: 1 }} required />
                <button type="button" onClick={autoKode}
                  style={{ padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Auto Generate
                </button>
              </div>
            </Fld>
            <Grid2>
              <Fld label="Unit Organisasi">
                <SWrap>
                  <select value={form.unitOrganisasiId} onChange={(e) => setF("unitOrganisasiId", e.target.value)} style={SS}>
                    <option value="">-- Pilih Unit --</option>
                    {unitList.map((u) => <option key={u.id} value={u.id}>{u.namaUnit}</option>)}
                  </select>
                  <Chev />
                </SWrap>
              </Fld>
              <Fld label="Urusan">
                <SWrap>
                  <select value={form.urusanId} onChange={(e) => setF("urusanId", e.target.value)} style={SS}>
                    <option value="">-- Pilih Urusan --</option>
                    {urusanList.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
                  </select>
                  <Chev />
                </SWrap>
              </Fld>
            </Grid2>
            <Fld label="Induk Jabatan">
              <SWrap>
                <select value={form.indukJabatanId} onChange={(e) => setF("indukJabatanId", e.target.value)} style={SS}>
                  <option value="">-- Tidak Ada (Jabatan Tertinggi) --</option>
                  {data.map((j) => <option key={j.id} value={j.id}>{j.namaJabatan}</option>)}
                </select>
                <Chev />
              </SWrap>
            </Fld>
            <MActions onCancel={closeForm} saving={saving} label="Tambah Jabatan" />
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <DelModal
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          msg={`Hapus jabatan "${deleteConfirm.namaJabatan}"? Data ANJAB, ABK, dan Bezeting terkait juga akan dihapus.`}
        />
      )}
      <GStyles />
    </div>
  );
}

// ── Quick Nav Button ──────────────────────────────────────────────────────────
function QuickBtn({ label, desc, color, icon, note }: {
  label: string; desc: string; color: string; icon: React.ReactNode; note: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 18px",
      background: `${color}10`,
      border: `1px solid ${color}30`,
      borderRadius: 10, flex: 1, minWidth: 220,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 9, flexShrink: 0,
        background: `${color}20`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{label}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{desc}</div>
      </div>
      <div style={{
        fontSize: 10, color, background: `${color}15`,
        border: `1px solid ${color}25`,
        borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap",
      }}>
        {note}
      </div>
    </div>
  );
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", background: ok ? "#0d2b1a" : "#2b0d0d", border: `1px solid ${ok ? "#22c55e" : "#ef4444"}`, borderRadius: 10, color: ok ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease" }}>
      {ok ? "✓" : "✕"} {toast.msg}
    </div>
  );
}
function Chip({ label, color }: { label: string; color: string }) { return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", background: `${color}18`, color, borderRadius: 100, whiteSpace: "nowrap" }}>{label}</span>; }
function AddBtn({ onClick, label }: { onClick: () => void; label: string }) { return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.3)", whiteSpace: "nowrap" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>{label}</button>; }
function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) { return <div style={{ position: "relative", flex: 1, minWidth: 180 }}><svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Cari jabatan..." style={{ width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>; }
function FSelect({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: { v: string; l: string }[] }) { return <div style={{ position: "relative" }}><select value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: "10px 36px 10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: value ? "white" : "rgba(255,255,255,0.35)", fontSize: 13, outline: "none", cursor: "pointer", appearance: "none" }}>{opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select><svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></div>; }
function Modal({ children, title, onClose, maxWidth = 500 }: { children: React.ReactNode; title: string; onClose: () => void; maxWidth?: number }) { return <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}><div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }} onClick={onClose} /><div style={{ position: "relative", width: "100%", maxWidth, background: "#161b22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", animation: "slideIn 0.2s ease", maxHeight: "90vh", overflowY: "auto" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}><h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "white" }}>{title}</h3><button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button></div>{children}</div></div>; }
function Fld({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) { return <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}{req && <span style={{ color: "#ef4444" }}>*</span>}</label>{children}</div>; }
function MActions({ onCancel, saving, label }: { onCancel: () => void; saving?: boolean; label: string }) { return <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}><button type="button" onClick={onCancel} style={CS}>Batal</button><button type="submit" disabled={saving} style={SubS}>{saving ? "Menyimpan..." : label}</button></div>; }
function DelModal({ onCancel, onConfirm, msg }: { onCancel: () => void; onConfirm: () => void; msg: string }) { return <Modal onClose={onCancel} title="Konfirmasi Hapus"><p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>{msg}</p><div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button onClick={onCancel} style={CS}>Batal</button><button onClick={onConfirm} style={{ ...SubS, background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>Hapus</button></div></Modal>; }
function Grid2({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>; }
function SWrap({ children }: { children: React.ReactNode }) { return <div style={{ position: "relative" }}>{children}</div>; }
function Chev() { return <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>; }
function LRow({ cols, msg }: { cols: number; msg: string }) { return <tr><td colSpan={cols} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>{msg}</td></tr>; }
function GStyles() { return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)!important}input:focus,textarea:focus,select:focus{border-color:rgba(16,185,129,0.5)!important}select option{background:#1c2330}`}</style>; }
function linkBtn(c: string): React.CSSProperties { return { padding: "5px 10px", fontSize: 11, fontWeight: 700, background: `${c}15`, color: c, border: `1px solid ${c}30`, borderRadius: 6, cursor: "pointer", textDecoration: "none", display: "inline-block" }; }

const BC: React.CSSProperties = { fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 };
const H1: React.CSSProperties = { fontSize: 24, fontWeight: 800, color: "white", margin: 0 };
const SUB: React.CSSProperties = { fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, marginBottom: 0 };
const TW: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "auto" };
const TH: React.CSSProperties = { padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(255,255,255,0.02)", whiteSpace: "nowrap" };
const TD: React.CSSProperties = { padding: "13px 16px", color: "rgba(255,255,255,0.7)", fontSize: 13 };
const TR: React.CSSProperties = { borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" };
const IS: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" };
const SS: React.CSSProperties = { ...IS, appearance: "none" as const, cursor: "pointer" };
const CS: React.CSSProperties = { padding: "9px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const SubS: React.CSSProperties = { padding: "9px 20px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const rb = (c: string): React.CSSProperties => ({ padding: "5px 10px", fontSize: 11, fontWeight: 700, background: `${c}15`, color: c, border: `1px solid ${c}30`, borderRadius: 6, cursor: "pointer" });