"use client";
// src/app/(sekolah)/pemangku/page.tsx

import { useState, useEffect, useCallback, useRef } from "react";

interface Jabatan { id: string; namaJabatan: string; kodeJabatan: string; jenisJabatan: string; }
interface Pemangku {
  id: string; jabatanId: string; namaPemangku: string; nip?: string;
  statusPegawai: "PNS" | "PPPK"; pangkatGolongan?: string; pendidikan?: string;
  bidangPendidikan?: string; pengalamanKerja?: string[]; keterampilan?: string[];
  kondisiFisik?: "BAIK" | "SEDANG" | "KURANG"; createdAt: string;
  jabatan?: { namaJabatan: string; kodeJabatan: string };
}

const emptyForm = {
  jabatanId: "", namaPemangku: "", nip: "",
  statusPegawai: "PNS" as "PNS" | "PPPK",
  pangkatGolongan: "", pendidikan: "", bidangPendidikan: "",
  kondisiFisik: "BAIK" as "BAIK" | "SEDANG" | "KURANG",
};

const GOLS = ["I/a","I/b","I/c","I/d","II/a","II/b","II/c","II/d","III/a","III/b","III/c","III/d","IV/a","IV/b","IV/c","IV/d","IV/e"];
const KONDISI_COLOR: Record<string, string> = { BAIK: "#22c55e", SEDANG: "#f59e0b", KURANG: "#ef4444" };

export default function PemangkuPage() {
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [allData, setAllData] = useState<Pemangku[]>([]); // data mentah dari server
  const [data, setData] = useState<Pemangku[]>([]);       // data setelah filter client
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterJabatan, setFilterJabatan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Pemangku | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Pemangku | null>(null);

  // Gunakan ref untuk mencegah infinite loop pada fetchData
  const hasFetched = useRef(false);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch semua data dari server (tanpa filter client-side di sini) ──────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Hanya kirim filterJabatan ke server, sisanya di-filter client-side
      const p = new URLSearchParams();
      if (filterJabatan) p.set("jabatanId", filterJabatan);
      const res = await fetch(`/api/master/pemangku?${p}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      const list: Pemangku[] = json.data ?? [];
      setAllData(list);
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data", "error");
      setAllData([]);
    } finally {
      setLoading(false);
    }
  }, [filterJabatan]); // hanya refetch jika filterJabatan berubah

  // ── Filter client-side (search & status) diterapkan terpisah ────────────────
  useEffect(() => {
    let filtered = allData;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.namaPemangku.toLowerCase().includes(q) ||
          (d.nip ?? "").includes(q)
      );
    }
    if (filterStatus) {
      filtered = filtered.filter((d) => d.statusPegawai === filterStatus);
    }
    setData(filtered);
  }, [allData, search, filterStatus]);

  // ── Fetch ulang saat filterJabatan berubah ───────────────────────────────────
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Fetch daftar jabatan (endpoint disesuaikan dengan API yang ada) ──────────
  useEffect(() => {
    fetch("/api/master/jabatan")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => setJabatanList(j.data ?? []))
      .catch(() => {
        // fallback: coba endpoint alternatif
        fetch("/api/jabatan")
          .then((r) => r.json())
          .then((j) => setJabatanList(j.data ?? []))
          .catch(() => showToast("Gagal memuat daftar jabatan", "error"));
      });
  }, []);

  function openAdd() { setEditItem(null); setForm(emptyForm); setShowForm(true); }
  function openEdit(p: Pemangku) {
    setEditItem(p);
    setForm({
      jabatanId: p.jabatanId,
      namaPemangku: p.namaPemangku,
      nip: p.nip || "",
      statusPegawai: p.statusPegawai,
      pangkatGolongan: p.pangkatGolongan || "",
      pendidikan: p.pendidikan || "",
      bidangPendidikan: p.bidangPendidikan || "",
      kondisiFisik: p.kondisiFisik || "BAIK",
    });
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditItem(null); setForm(emptyForm); }
  function setF(k: keyof typeof emptyForm, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.jabatanId || !form.namaPemangku.trim()) return;
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const body = editItem ? { id: editItem.id, ...form } : form;
      const res = await fetch("/api/master/pemangku", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menyimpan"); }
      showToast(editItem ? "Pemangku diperbarui" : "Pemangku ditambahkan", "success");
      closeForm();
      fetchData(); // refresh data setelah simpan
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/master/pemangku?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      showToast("Pemangku dihapus", "success");
      fetchData();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setDeleteConfirm(null); }
  }

  const totalPNS = data.filter((d) => d.statusPegawai === "PNS").length;
  const totalPPPK = data.filter((d) => d.statusPegawai === "PPPK").length;

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#0d1117" }}>
      <Toast toast={toast} />

      <div style={{ marginBottom: 24 }}>
        <div style={BC}>Data Jabatan</div>
        <h1 style={H1}>Pemangku Jabatan</h1>
        <p style={SUB}>Data pegawai PNS/PPPK yang memangku jabatan di sekolah</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 20 }}>
        <SC label="Total Pemangku" val={data.length} color="#10b981" />
        <SC label="PNS" val={totalPNS} color="#3b82f6" />
        <SC label="PPPK" val={totalPPPK} color="#8b5cf6" />
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <SBox value={search} onChange={setSearch} />
        <FSel
          value={filterJabatan}
          onChange={(v) => { setFilterJabatan(v); }}
          opts={[{ v: "", l: "Semua Jabatan" }, ...jabatanList.map((j) => ({ v: j.id, l: j.namaJabatan }))]}
        />
        <FSel
          value={filterStatus}
          onChange={setFilterStatus}
          opts={[{ v: "", l: "Semua Status" }, { v: "PNS", l: "PNS" }, { v: "PPPK", l: "PPPK" }]}
        />
        <AddBtn onClick={openAdd} />
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["No", "Nama Pemangku", "NIP", "Jabatan", "Status", "Pangkat/Gol", "Pendidikan", "Kondisi Fisik", "Aksi"].map((h) => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LR cols={9} msg="Memuat..." />
            ) : data.length === 0 ? (
              <LR cols={9} msg={allData.length === 0 ? "Belum ada data pemangku jabatan." : "Tidak ada data yang sesuai filter."} />
            ) : data.map((item, i) => (
              <tr key={item.id} style={TR}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={TD}>{i + 1}</td>
                <td style={{ ...TD, color: "white", fontWeight: 600 }}>{item.namaPemangku}</td>
                <td style={{ ...TD, fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{item.nip || "—"}</td>
                <td style={{ ...TD, fontSize: 12 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                    {item.jabatan?.namaJabatan || "—"}
                  </div>
                </td>
                <td style={TD}>
                  <Chip label={item.statusPegawai} color={item.statusPegawai === "PNS" ? "#3b82f6" : "#8b5cf6"} />
                </td>
                <td style={{ ...TD, fontSize: 12 }}>{item.pangkatGolongan || "—"}</td>
                <td style={{ ...TD, fontSize: 12 }}>
                  <div>{item.pendidikan || "—"}</div>
                  {item.bidangPendidikan && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{item.bidangPendidikan}</div>
                  )}
                </td>
                <td style={TD}>
                  {item.kondisiFisik && (
                    <Chip label={item.kondisiFisik} color={KONDISI_COLOR[item.kondisiFisik] || "#666"} />
                  )}
                </td>
                <td style={TD}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={() => openEdit(item)} style={RB("#3b82f6")}>Edit</button>
                    <button onClick={() => setDeleteConfirm(item)} style={RB("#ef4444")}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && (
          <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            {data.length} pemangku{allData.length !== data.length ? ` (dari ${allData.length} total)` : ""}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <Modal onClose={closeForm} title={editItem ? "Edit Pemangku" : "Tambah Pemangku Jabatan"} maxWidth={560}>
          <form onSubmit={handleSubmit}>
            <Fld label="Jabatan" req>
              <SW>
                <select value={form.jabatanId} onChange={(e) => setF("jabatanId", e.target.value)} style={SEL} required>
                  <option value="">-- Pilih Jabatan --</option>
                  {jabatanList.map((j) => (
                    <option key={j.id} value={j.id}>[{j.kodeJabatan}] {j.namaJabatan}</option>
                  ))}
                </select>
                <Cv />
              </SW>
            </Fld>
            <G2>
              <Fld label="Nama Pemangku" req>
                <input autoFocus value={form.namaPemangku} onChange={(e) => setF("namaPemangku", e.target.value)} style={IS} required />
              </Fld>
              <Fld label="NIP">
                <input value={form.nip} onChange={(e) => setF("nip", e.target.value)} style={IS} placeholder="Opsional" />
              </Fld>
            </G2>
            <G2>
              <Fld label="Status Pegawai" req>
                <SW>
                  <select value={form.statusPegawai} onChange={(e) => setF("statusPegawai", e.target.value as any)} style={SEL}>
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                  </select>
                  <Cv />
                </SW>
              </Fld>
              <Fld label="Pangkat / Golongan">
                <SW>
                  <select value={form.pangkatGolongan} onChange={(e) => setF("pangkatGolongan", e.target.value)} style={SEL}>
                    <option value="">-- Pilih --</option>
                    {GOLS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <Cv />
                </SW>
              </Fld>
            </G2>
            <G2>
              <Fld label="Pendidikan Terakhir">
                <input value={form.pendidikan} onChange={(e) => setF("pendidikan", e.target.value)} style={IS} placeholder="contoh: S1" />
              </Fld>
              <Fld label="Bidang Pendidikan">
                <input value={form.bidangPendidikan} onChange={(e) => setF("bidangPendidikan", e.target.value)} style={IS} placeholder="contoh: Manajemen" />
              </Fld>
            </G2>
            <Fld label="Kondisi Fisik">
              <div style={{ display: "flex", gap: 10 }}>
                {(["BAIK", "SEDANG", "KURANG"] as const).map((k) => (
                  <button type="button" key={k} onClick={() => setF("kondisiFisik", k)}
                    style={{
                      flex: 1, padding: "8px 0", borderRadius: 8,
                      border: `2px solid ${form.kondisiFisik === k ? KONDISI_COLOR[k] : "rgba(255,255,255,0.1)"}`,
                      background: form.kondisiFisik === k ? `${KONDISI_COLOR[k]}18` : "transparent",
                      color: form.kondisiFisik === k ? KONDISI_COLOR[k] : "rgba(255,255,255,0.4)",
                      fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                    }}>
                    {k}
                  </button>
                ))}
              </div>
            </Fld>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button type="button" onClick={closeForm} style={CS}>Batal</button>
              <button type="submit" disabled={saving} style={SubS}>
                {saving ? "Menyimpan..." : editItem ? "Simpan" : "Tambahkan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus">
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 20 }}>
            Hapus data pemangku <strong style={{ color: "white" }}>{deleteConfirm.namaPemangku}</strong>?
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setDeleteConfirm(null)} style={CS}>Batal</button>
            <button onClick={() => handleDelete(deleteConfirm.id)}
              style={{ ...SubS, background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
              Hapus
            </button>
          </div>
        </Modal>
      )}
      <GStyles />
    </div>
  );
}

// ── UI Components ─────────────────────────────────────────────────────────────
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
function AddBtn({ onClick }: { onClick: () => void }) { return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.3)", whiteSpace: "nowrap" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Tambah Pemangku</button>; }
function SBox({ value, onChange }: { value: string; onChange: (v: string) => void }) { return <div style={{ position: "relative", flex: 1, minWidth: 180 }}><svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Cari nama atau NIP..." style={{ width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>; }
function FSel({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: { v: string; l: string }[] }) { return <div style={{ position: "relative" }}><select value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: "10px 36px 10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: value ? "white" : "rgba(255,255,255,0.35)", fontSize: 13, outline: "none", cursor: "pointer", appearance: "none", maxWidth: 200 }}>{opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select><svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></div>; }
function SC({ label, val, color }: { label: string; val: number; color: string }) { return <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}25`, borderRadius: 10, padding: "14px 16px" }}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</div><div style={{ fontSize: 26, fontWeight: 800, color }}>{val}</div></div>; }
function Modal({ children, title, onClose, maxWidth = 500 }: { children: React.ReactNode; title: string; onClose: () => void; maxWidth?: number }) { return <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}><div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }} onClick={onClose} /><div style={{ position: "relative", width: "100%", maxWidth, background: "#161b22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", animation: "slideIn 0.2s ease", maxHeight: "90vh", overflowY: "auto" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}><h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "white" }}>{title}</h3><button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button></div>{children}</div></div>; }
function Fld({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) { return <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}{req && <span style={{ color: "#ef4444" }}>*</span>}</label>{children}</div>; }
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
const CS: React.CSSProperties = { padding: "9px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const SubS: React.CSSProperties = { padding: "9px 20px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const RB = (c: string): React.CSSProperties => ({ padding: "5px 10px", fontSize: 11, fontWeight: 700, background: `${c}15`, color: c, border: `1px solid ${c}30`, borderRadius: 6, cursor: "pointer" });