"use client";
// src/app/(sekolah)/data-guru/page.tsx

import { useState, useEffect, useCallback } from "react";

interface Guru {
  id: string; nip?: string; nama: string; statusPegawai: "PNS" | "PPPK";
  pangkatGolongan?: string; pendidikanTerakhir?: string; bidangStudi?: string;
  mataPelajaran?: string; statusSertifikasi?: boolean; tmtMasuk?: string;
  jenisKelamin?: string; aktif: boolean;
}

const emptyForm = { nip: "", nama: "", statusPegawai: "PNS" as "PNS" | "PPPK", jenisKelamin: "L", pangkatGolongan: "", pendidikanTerakhir: "", bidangStudi: "", mataPelajaran: "", statusSertifikasi: false, nomorSertifikasi: "", tmtMasuk: "", tempatLahir: "", tanggalLahir: "", alamat: "", telepon: "", email: "" };

export default function DataGuruPage() {
  const [data, setData] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Guru | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formTab, setFormTab] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Guru | null>(null);

  const showToast = (msg: string, type: "success" | "error") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (filterStatus) p.set("status", filterStatus);
      const res = await fetch(`/api/guru?${p}`);
      const json = await res.json();
      setData(json.data || []);
    } catch { showToast("Gagal memuat data", "error"); }
    finally { setLoading(false); }
  }, [search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openAdd() { setEditItem(null); setForm(emptyForm); setFormTab(0); setShowForm(true); }
  function openEdit(g: Guru) {
    setEditItem(g);
    setForm({ ...emptyForm, ...g, statusSertifikasi: g.statusSertifikasi || false, tmtMasuk: g.tmtMasuk ? g.tmtMasuk.split("T")[0] : "" } as any);
    setFormTab(0); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditItem(null); }
  function setF(k: string, v: any) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama.trim()) return;
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const url = editItem ? `/api/guru/${editItem.id}` : "/api/guru";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal"); }
      showToast(editItem ? "Data guru diperbarui" : "Guru berhasil ditambahkan", "success");
      closeForm(); fetchData();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/guru/${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      showToast("Guru berhasil dihapus", "success"); fetchData();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setDeleteConfirm(null); }
  }

  const totalPNS = data.filter((g) => g.statusPegawai === "PNS").length;
  const totalPPPK = data.filter((g) => g.statusPegawai === "PPPK").length;
  const totalSertif = data.filter((g) => g.statusSertifikasi).length;

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#0d1117" }}>
      <Toast toast={toast} />

      <div style={{ marginBottom: 24 }}>
        <div style={BC}>Data Sekolah</div>
        <h1 style={H1}>Data Guru</h1>
        <p style={SUB}>Daftar guru PNS dan PPPK di sekolah Anda</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 22 }}>
        <SC label="Total Guru" val={data.length} color="#10b981" />
        <SC label="PNS" val={totalPNS} color="#3b82f6" />
        <SC label="PPPK" val={totalPPPK} color="#8b5cf6" />
        <SC label="Sertifikasi" val={totalSertif} color="#f59e0b" />
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <SBox value={search} onChange={setSearch} />
        <FSel value={filterStatus} onChange={setFilterStatus} opts={[{ v: "", l: "Semua Status" }, { v: "PNS", l: "PNS" }, { v: "PPPK", l: "PPPK" }]} />
        <AddBtn onClick={openAdd} label="Tambah Guru" />
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["No", "NIP", "Nama", "Status", "Gol", "Pendidikan", "Bid. Studi", "Mata Pelajaran", "Sertifikasi", "TMT Masuk", "Aksi"].map((h) => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <LR cols={11} msg="Memuat..." /> :
              data.length === 0 ? <LR cols={11} msg="Belum ada data guru." /> :
                data.map((g, i) => (
                  <tr key={g.id} style={TR} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={TD}>{i + 1}</td>
                    <td style={{ ...TD, fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{g.nip || "—"}</td>
                    <td style={{ ...TD, color: "white", fontWeight: 600 }}>{g.nama}</td>
                    <td style={TD}><Chip label={g.statusPegawai} color={g.statusPegawai === "PNS" ? "#3b82f6" : "#8b5cf6"} /></td>
                    <td style={{ ...TD, fontSize: 12 }}>{g.pangkatGolongan || "—"}</td>
                    <td style={{ ...TD, fontSize: 12 }}>{g.pendidikanTerakhir || "—"}</td>
                    <td style={{ ...TD, fontSize: 12, maxWidth: 120 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.bidangStudi || "—"}</div></td>
                    <td style={{ ...TD, fontSize: 12, maxWidth: 130 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.mataPelajaran || "—"}</div></td>
                    <td style={TD}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: g.statusSertifikasi ? "#22c55e18" : "rgba(255,255,255,0.05)", color: g.statusSertifikasi ? "#22c55e" : "rgba(255,255,255,0.3)", borderRadius: 100 }}>
                        {g.statusSertifikasi ? "Ya" : "Tidak"}
                      </span>
                    </td>
                    <td style={{ ...TD, fontSize: 12 }}>{g.tmtMasuk ? new Date(g.tmtMasuk).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                    <td style={TD}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button onClick={() => openEdit(g)} style={RB("#3b82f6")}>Edit</button>
                        <button onClick={() => setDeleteConfirm(g)} style={RB("#ef4444")}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{data.length} guru</div>}
      </div>

      {/* Form Modal */}
      {showForm && (
        <Modal onClose={closeForm} title={editItem ? `Edit: ${editItem.nama}` : "Tambah Guru Baru"} maxWidth={640}>
          <form onSubmit={handleSubmit}>
            {/* Form tabs */}
            <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 4 }}>
              {["Data Utama", "Detail", "Kontak"].map((t, i) => (
                <button key={t} type="button" onClick={() => setFormTab(i)}
                  style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: formTab === i ? "#10b981" : "transparent", color: formTab === i ? "white" : "rgba(255,255,255,0.4)", transition: "all 0.2s" }}>
                  {t}
                </button>
              ))}
            </div>

            {formTab === 0 && (
              <>
                <G2>
                  <Fld label="Nama Lengkap" req><input autoFocus value={form.nama} onChange={(e) => setF("nama", e.target.value)} style={IS} required /></Fld>
                  <Fld label="NIP"><input value={form.nip} onChange={(e) => setF("nip", e.target.value)} style={IS} placeholder="Opsional" /></Fld>
                </G2>
                <G2>
                  <Fld label="Status Pegawai" req>
                    <SW><select value={form.statusPegawai} onChange={(e) => setF("statusPegawai", e.target.value)} style={SEL} required>
                      <option value="PNS">PNS</option><option value="PPPK">PPPK</option>
                    </select><Cv /></SW>
                  </Fld>
                  <Fld label="Jenis Kelamin">
                    <SW><select value={form.jenisKelamin} onChange={(e) => setF("jenisKelamin", e.target.value)} style={SEL}>
                      <option value="L">Laki-laki</option><option value="P">Perempuan</option>
                    </select><Cv /></SW>
                  </Fld>
                </G2>
                <G2>
                  <Fld label="Pangkat / Golongan"><input value={form.pangkatGolongan} onChange={(e) => setF("pangkatGolongan", e.target.value)} style={IS} placeholder="contoh: III/b" /></Fld>
                  <Fld label="TMT Masuk"><input type="date" value={form.tmtMasuk} onChange={(e) => setF("tmtMasuk", e.target.value)} style={IS} /></Fld>
                </G2>
              </>
            )}

            {formTab === 1 && (
              <>
                <G2>
                  <Fld label="Pendidikan Terakhir">
                    <SW><select value={form.pendidikanTerakhir} onChange={(e) => setF("pendidikanTerakhir", e.target.value)} style={SEL}>
                      <option value="">-- Pilih --</option>
                      {["SMA/SMK","D3","S1/D4","S2","S3"].map((p) => <option key={p} value={p}>{p}</option>)}
                    </select><Cv /></SW>
                  </Fld>
                  <Fld label="Bidang Studi"><input value={form.bidangStudi} onChange={(e) => setF("bidangStudi", e.target.value)} style={IS} placeholder="contoh: Matematika" /></Fld>
                </G2>
                <Fld label="Mata Pelajaran Diampu"><input value={form.mataPelajaran} onChange={(e) => setF("mataPelajaran", e.target.value)} style={IS} placeholder="contoh: Matematika, Fisika" /></Fld>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 8, marginBottom: 16 }}>
                  <input type="checkbox" id="sertif" checked={form.statusSertifikasi} onChange={(e) => setF("statusSertifikasi", e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
                  <label htmlFor="sertif" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer", fontWeight: 600 }}>Sudah tersertifikasi</label>
                </div>
                {form.statusSertifikasi && <Fld label="Nomor Sertifikasi"><input value={form.nomorSertifikasi} onChange={(e) => setF("nomorSertifikasi", e.target.value)} style={IS} placeholder="Nomor sertifikat pendidik" /></Fld>}
              </>
            )}

            {formTab === 2 && (
              <>
                <G2>
                  <Fld label="Tempat Lahir"><input value={form.tempatLahir} onChange={(e) => setF("tempatLahir", e.target.value)} style={IS} /></Fld>
                  <Fld label="Tanggal Lahir"><input type="date" value={form.tanggalLahir} onChange={(e) => setF("tanggalLahir", e.target.value)} style={IS} /></Fld>
                </G2>
                <Fld label="Alamat"><textarea value={form.alamat} onChange={(e) => setF("alamat", e.target.value)} rows={2} style={{ ...IS, resize: "vertical" }} /></Fld>
                <G2>
                  <Fld label="Telepon"><input value={form.telepon} onChange={(e) => setF("telepon", e.target.value)} style={IS} /></Fld>
                  <Fld label="Email"><input type="email" value={form.email} onChange={(e) => setF("email", e.target.value)} style={IS} /></Fld>
                </G2>
              </>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {formTab > 0 && <button type="button" onClick={() => setFormTab(formTab - 1)} style={CSt}>← Sebelumnya</button>}
                {formTab < 2 && <button type="button" onClick={() => setFormTab(formTab + 1)} style={CSt}>Selanjutnya →</button>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={closeForm} style={CSt}>Batal</button>
                <button type="submit" disabled={saving} style={SubSt}>{saving ? "Menyimpan..." : editItem ? "Simpan" : "Tambahkan"}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)} title="Hapus Data Guru">
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 20 }}>Hapus data guru <strong style={{ color: "white" }}>{deleteConfirm.nama}</strong>?</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setDeleteConfirm(null)} style={CSt}>Batal</button>
            <button onClick={() => handleDelete(deleteConfirm.id)} style={{ ...SubSt, background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>Hapus</button>
          </div>
        </Modal>
      )}
      <GStyles />
    </div>
  );
}

function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) { if (!toast) return null; const ok = toast.type === "success"; return <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", background: ok ? "#0d2b1a" : "#2b0d0d", border: `1px solid ${ok ? "#22c55e" : "#ef4444"}`, borderRadius: 10, color: ok ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease" }}>{ok ? "✓" : "✕"} {toast.msg}</div>; }
function Chip({ label, color }: { label: string; color: string }) { return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", background: `${color}18`, color, borderRadius: 100 }}>{label}</span>; }
function AddBtn({ onClick, label }: { onClick: () => void; label: string }) { return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.3)", whiteSpace: "nowrap" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>{label}</button>; }
function SBox({ value, onChange }: { value: string; onChange: (v: string) => void }) { return <div style={{ position: "relative", flex: 1, minWidth: 180 }}><svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Cari nama, NIP, mata pelajaran..." style={{ width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>; }
function FSel({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: { v: string; l: string }[] }) { return <div style={{ position: "relative" }}><select value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: "10px 36px 10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: value ? "white" : "rgba(255,255,255,0.35)", fontSize: 13, outline: "none", cursor: "pointer", appearance: "none" }}>{opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select><svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></div>; }
function SC({ label, val, color }: { label: string; val: number; color: string }) { return <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}25`, borderRadius: 10, padding: "14px 16px" }}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</div><div style={{ fontSize: 26, fontWeight: 800, color }}>{val}</div></div>; }
function Modal({ children, title, onClose, maxWidth = 500 }: { children: React.ReactNode; title: string; onClose: () => void; maxWidth?: number }) { return <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}><div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }} onClick={onClose} /><div style={{ position: "relative", width: "100%", maxWidth, background: "#161b22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", animation: "slideIn 0.2s ease", maxHeight: "90vh", overflowY: "auto" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}><h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "white" }}>{title}</h3><button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button></div>{children}</div></div>; }
function Fld({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) { return <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 7, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}{req && <span style={{ color: "#ef4444" }}>*</span>}</label>{children}</div>; }
function G2({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>; }
function SW({ children }: { children: React.ReactNode }) { return <div style={{ position: "relative" }}>{children}</div>; }
function Cv() { return <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>; }
function LR({ cols, msg }: { cols: number; msg: string }) { return <tr><td colSpan={cols} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>{msg}</td></tr>; }
function GStyles() { return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)!important}input:focus,textarea:focus,select:focus{border-color:rgba(16,185,129,0.5)!important}select option{background:#1c2330}`}</style>; }

const BC: React.CSSProperties = { fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 };
const H1: React.CSSProperties = { fontSize: 24, fontWeight: 800, color: "white", margin: 0 };
const SUB: React.CSSProperties = { fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, marginBottom: 0 };
const TH: React.CSSProperties = { padding: "13px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.07em", textTransform: "uppercase", background: "rgba(255,255,255,0.02)", whiteSpace: "nowrap" };
const TD: React.CSSProperties = { padding: "12px 14px", color: "rgba(255,255,255,0.7)", fontSize: 13 };
const TR: React.CSSProperties = { borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" };
const IS: React.CSSProperties = { width: "100%", padding: "9px 13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" };
const SEL: React.CSSProperties = { ...IS, appearance: "none" as const, cursor: "pointer" };
const CSt: React.CSSProperties = { padding: "9px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const SubSt: React.CSSProperties = { padding: "9px 20px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const RB = (c: string): React.CSSProperties => ({ padding: "5px 10px", fontSize: 11, fontWeight: 700, background: `${c}15`, color: c, border: `1px solid ${c}30`, borderRadius: 6, cursor: "pointer" });