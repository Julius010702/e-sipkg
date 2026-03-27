"use client";
// src/app/(sekolah)/sekolah/profil/page.tsx

import { useState, useEffect, useRef } from "react";

interface ProfilSekolah {
  id?: string;
  npsn?: string;
  nama?: string;
  jenisSekolah?: string;
  alamat?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  telepon?: string;
  email?: string;
  logoUrl?: string;
  kepalaSekolah?: string;
  wakilKepala?: string;
  sekretaris?: string;
}

export default function ProfilSekolahPage() {
  const [profil, setProfil] = useState<ProfilSekolah>({});
  const [form, setForm] = useState<ProfilSekolah>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [activeSection, setActiveSection] = useState<"identitas" | "pejabat" | "kontak">("identitas");
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/profil")
      .then((r) => r.json())
      .then((j) => {
        const data = j.data || {};
        setProfil(data);
        setForm(data);
      })
      .catch(() => showToast("Gagal memuat profil", "error"))
      .finally(() => setLoading(false));
  }, []);

  function setF(key: keyof ProfilSekolah, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menyimpan"); }
      const json = await res.json();
      setProfil(json.data);
      setForm(json.data);
      showToast("Profil berhasil disimpan", "success");
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Ukuran file maksimal 2MB", "error"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "logo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Gagal upload");
      const json = await res.json();
      setF("logoUrl", json.url);
      showToast("Logo berhasil diupload", "success");
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setUploading(false); }
  }

  const sections = [
    { key: "identitas" as const, label: "Identitas Sekolah", icon: "🏫" },
    { key: "pejabat" as const, label: "Data Pejabat", icon: "👤" },
    { key: "kontak" as const, label: "Kontak & Lokasi", icon: "📞" },
  ];

  const JENIS_SEKOLAH = ["SMA", "SMK", "SLB"];

  if (loading) {
    return (
      <div style={{ padding: "28px 32px", background: "#0d1117", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Memuat profil...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#0d1117" }}>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Admin Sekolah</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0 }}>Profil Sekolah</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, marginBottom: 0 }}>Informasi sekolah yang tampil di sistem dan laporan</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>
        {/* Sidebar */}
        <div>
          {/* Logo card */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 14, textAlign: "center" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", overflow: "hidden" }}>
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 2 }}>{form.nama || "Nama Sekolah"}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{form.npsn ? `NPSN: ${form.npsn}` : "NPSN belum diisi"}</div>
            {form.jenisSekolah && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 10px", background: "#10b98118", color: "#10b981", borderRadius: 100, border: "1px solid #10b98130" }}>
                {form.jenisSekolah}
              </span>
            )}
            <div style={{ marginTop: 14 }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ width: "100%", padding: "8px 0", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {uploading ? "Mengupload..." : "Ganti Logo"}
              </button>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 8, marginBottom: 0 }}>JPG/PNG, maks 2MB</p>
            </div>
          </div>

          {/* Section nav */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
            {sections.map((s) => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", background: activeSection === s.key ? "rgba(16,185,129,0.12)" : "transparent", border: "none", borderLeft: `3px solid ${activeSection === s.key ? "#10b981" : "transparent"}`, color: activeSection === s.key ? "#10b981" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}>
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 28 }}>

          {/* Identitas */}
          {activeSection === "identitas" && (
            <Section title="Identitas Sekolah">
              <Grid2>
                <Field label="Nama Sekolah" required>
                  <input value={form.nama || ""} onChange={(e) => setF("nama", e.target.value)} placeholder="Nama lengkap sekolah" style={inputStyle} />
                </Field>
                <Field label="NPSN">
                  <input value={form.npsn || ""} onChange={(e) => setF("npsn", e.target.value)} placeholder="Nomor Pokok Sekolah Nasional" style={inputStyle} />
                </Field>
              </Grid2>
              <Field label="Jenis Sekolah" required>
                <div style={{ position: "relative" }}>
                  <select value={form.jenisSekolah || ""} onChange={(e) => setF("jenisSekolah", e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                    <option value="">-- Pilih Jenis Sekolah --</option>
                    {JENIS_SEKOLAH.map((j) => <option key={j} value={j}>{j}</option>)}
                  </select>
                  <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </Field>
              <Field label="Provinsi">
                <input value={form.provinsi || "Nusa Tenggara Timur"} onChange={(e) => setF("provinsi", e.target.value)} placeholder="Provinsi" style={inputStyle} />
              </Field>
            </Section>
          )}

          {/* Pejabat */}
          {activeSection === "pejabat" && (
            <Section title="Data Pejabat Sekolah">
              <Field label="Kepala Sekolah" required>
                <input value={form.kepalaSekolah || ""} onChange={(e) => setF("kepalaSekolah", e.target.value)} placeholder="Nama lengkap kepala sekolah" style={inputStyle} />
              </Field>
              <Grid2>
                <Field label="Wakil Kepala Sekolah">
                  <input value={form.wakilKepala || ""} onChange={(e) => setF("wakilKepala", e.target.value)} placeholder="Nama wakil kepala" style={inputStyle} />
                </Field>
                <Field label="Sekretaris">
                  <input value={form.sekretaris || ""} onChange={(e) => setF("sekretaris", e.target.value)} placeholder="Nama sekretaris" style={inputStyle} />
                </Field>
              </Grid2>
            </Section>
          )}

          {/* Kontak */}
          {activeSection === "kontak" && (
            <Section title="Kontak & Lokasi">
              <Field label="Alamat Sekolah">
                <textarea value={form.alamat || ""} onChange={(e) => setF("alamat", e.target.value)} placeholder="Alamat lengkap sekolah..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </Field>
              <Grid2>
                <Field label="Kecamatan">
                  <input value={form.kecamatan || ""} onChange={(e) => setF("kecamatan", e.target.value)} placeholder="Kecamatan" style={inputStyle} />
                </Field>
                <Field label="Kabupaten / Kota">
                  <input value={form.kabupatenKota || ""} onChange={(e) => setF("kabupatenKota", e.target.value)} placeholder="Kabupaten atau Kota" style={inputStyle} />
                </Field>
              </Grid2>
              <Grid2>
                <Field label="Nomor Telepon">
                  <input value={form.telepon || ""} onChange={(e) => setF("telepon", e.target.value)} placeholder="0380-..." style={inputStyle} />
                </Field>
                <Field label="Email Sekolah">
                  <input type="email" value={form.email || ""} onChange={(e) => setF("email", e.target.value)} placeholder="email@sekolah.sch.id" style={inputStyle} />
                </Field>
              </Grid2>
            </Section>
          )}
        </div>
      </div>
      <GlobalStyles />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 800, color: "white", paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{title}</h3>
      {children}
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>;
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

function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", background: ok ? "#0d2b1a" : "#2b0d0d", border: `1px solid ${ok ? "#22c55e" : "#ef4444"}`, borderRadius: 10, color: ok ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease" }}>
      {ok ? "✓" : "✕"} {toast.msg}
    </div>
  );
}

function GlobalStyles() {
  return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)!important}input:focus,textarea:focus,select:focus{border-color:rgba(16,185,129,0.5)!important}select option{background:#1c2330}`}</style>;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, color: "white", fontSize: 14,
  outline: "none", boxSizing: "border-box",
};