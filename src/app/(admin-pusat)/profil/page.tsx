"use client";
// src/app/(admin-pusat)/profil/page.tsx

import { useState, useEffect, useRef } from "react";

interface ProfilData {
  id?: string;
  kabupatenKota?: string;
  namaDaerah?: string;
  namaKepala?: string;
  namaWakil?: string;
  namaSekretaris?: string;
  telepon?: string;
  email?: string;
  alamat?: string;
  opd?: string;
  logoUrl?: string;
  websiteUrl?: string;
  hakiInfo?: string;
}

function useIsMobile(bp = 768) {
  const [val, setVal] = useState(false);
  useEffect(() => {
    const fn = () => setVal(window.innerWidth < bp);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return val;
}

export default function ProfilAdminPusatPage() {
  const [profil, setProfil]       = useState<ProfilData>({});
  const [form, setForm]           = useState<ProfilData>({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [activeSection, setActiveSection] = useState<"instansi" | "pejabat" | "kontak">("instansi");
  const fileRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile(768);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/profil")
      .then((r) => r.json())
      .then((j) => { const d = j.data || {}; setProfil(d); setForm(d); })
      .catch(() => showToast("Gagal memuat profil", "error"))
      .finally(() => setLoading(false));
  }, []);

  function setF(key: keyof ProfilData, val: string) {
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
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Gagal menyimpan");
      const savedData = json.data || {};
      setProfil(savedData); setForm(savedData);
      showToast("Profil berhasil disimpan", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Ukuran file maksimal 2MB", "error"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("type", "logo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Gagal upload");
      const json = await res.json();
      setF("logoUrl", json.url);
      showToast("Logo berhasil diupload. Klik Simpan untuk menyimpan.", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  }

  const sections = [
    { key: "instansi" as const, label: "Info Instansi", icon: "🏛️" },
    { key: "pejabat"  as const, label: "Data Pejabat",  icon: "👤" },
    { key: "kontak"   as const, label: "Kontak & Lainnya", icon: "📞" },
  ];

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:240 }}>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Memuat profil...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh" }}>
      <Toast toast={toast} />

      {/* ── Header ── */}
      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems: isMobile ? "flex-start" : "flex-start",
        flexDirection: isMobile ? "column" : "row",
        marginBottom: isMobile ? 20 : 28,
        gap: 14,
      }}>
        <div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6 }}>Admin Pusat</div>
          <h1 style={{ fontSize: isMobile?20:24, fontWeight:800, color:"white", margin:0 }}>Profil Instansi</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:4, marginBottom:0 }}>
            Informasi instansi yang tampil di sistem dan laporan
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display:"flex", alignItems:"center", gap:8,
            padding: isMobile ? "10px 18px" : "10px 20px",
            width: isMobile ? "100%" : "auto",
            justifyContent: isMobile ? "center" : "flex-start",
            background:"linear-gradient(135deg,#3b82f6,#2563eb)",
            border:"none", borderRadius:8, color:"white",
            fontSize:13, fontWeight:700, cursor: saving?"not-allowed":"pointer",
            opacity: saving ? 0.7 : 1, boxShadow:"0 4px 14px rgba(59,130,246,0.35)",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {/* ── Layout: stacked on mobile, sidebar+form on desktop ── */}
      {isMobile ? (
        /* ─ Mobile: logo card on top, tab pills, then form ─ */
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Logo card — horizontal on mobile */}
          <div style={{
            background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:14, padding:16,
            display:"flex", alignItems:"center", gap:16,
          }}>
            <div style={{
              width:72, height:72, flexShrink:0, borderRadius:"50%",
              background:"rgba(255,255,255,0.06)", border:"2px solid rgba(255,255,255,0.1)",
              display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden",
            }}>
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              )}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"white", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {form.namaDaerah || "Nama Instansi"}
              </div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:2, marginBottom:10 }}>
                {form.kabupatenKota || "Kabupaten / Kota"}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display:"none" }} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{ padding:"6px 14px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:7, color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:600, cursor:"pointer" }}
              >
                {uploading ? "Mengupload..." : "Ganti Logo"}
              </button>
            </div>
          </div>

          {/* Section tabs — horizontal scroll */}
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
            {sections.map((s) => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                style={{
                  flexShrink:0, display:"flex", alignItems:"center", gap:6,
                  padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer",
                  background: activeSection===s.key ? "#3b82f6" : "rgba(255,255,255,0.06)",
                  color: activeSection===s.key ? "white" : "rgba(255,255,255,0.5)",
                  fontSize:13, fontWeight:600, transition:"all 0.15s",
                }}
              >
                <span>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:16 }}>
            <FormContent activeSection={activeSection} form={form} setF={setF} isMobile={true} />
          </div>
        </div>
      ) : (
        /* ─ Desktop: sidebar left, form right ─ */
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:20, alignItems:"start" }}>
          <div>
            {/* Logo card */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:20, marginBottom:14, textAlign:"center" }}>
              <div style={{ width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:"2px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", overflow:"hidden" }}>
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:"white", marginBottom:4 }}>{form.namaDaerah || "Nama Instansi"}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:14 }}>{form.kabupatenKota || "Kabupaten / Kota"}</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display:"none" }} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ width:"100%", padding:"8px 0", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                {uploading ? "Mengupload..." : "Ganti Logo"}
              </button>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:8, marginBottom:0 }}>JPG/PNG, maks 2MB</p>
            </div>

            {/* Section nav */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, overflow:"hidden" }}>
              {sections.map((s) => (
                <button key={s.key} onClick={() => setActiveSection(s.key)}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"13px 16px", background: activeSection===s.key?"rgba(59,130,246,0.12)":"transparent", border:"none", borderLeft:`3px solid ${activeSection===s.key?"#3b82f6":"transparent"}`, color: activeSection===s.key?"#3b82f6":"rgba(255,255,255,0.5)", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s", textAlign:"left" }}>
                  <span>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:28 }}>
            <FormContent activeSection={activeSection} form={form} setF={setF} isMobile={false} />
          </div>
        </div>
      )}

      <GlobalStyles />
    </div>
  );
}

// ── Form sections extracted ───────────────────────────────────────────────────
function FormContent({ activeSection, form, setF, isMobile }: {
  activeSection: "instansi" | "pejabat" | "kontak";
  form: ProfilData;
  setF: (key: keyof ProfilData, val: string) => void;
  isMobile: boolean;
}) {
  return (
    <>
      {activeSection === "instansi" && (
        <Section title="Informasi Instansi">
          <Grid2 isMobile={isMobile}>
            <Field label="Nama Daerah" required>
              <input value={form.namaDaerah||""} onChange={(e) => setF("namaDaerah",e.target.value)} placeholder="contoh: Provinsi Nusa Tenggara Timur" style={inputStyle} />
            </Field>
            <Field label="Kabupaten / Kota">
              <input value={form.kabupatenKota||""} onChange={(e) => setF("kabupatenKota",e.target.value)} placeholder="contoh: Kota Kupang" style={inputStyle} />
            </Field>
          </Grid2>
          <Field label="Unit / OPD">
            <input value={form.opd||""} onChange={(e) => setF("opd",e.target.value)} placeholder="contoh: Dinas Pendidikan dan Kebudayaan Provinsi NTT" style={inputStyle} />
          </Field>
          <Field label="Website">
            <input value={form.websiteUrl||""} onChange={(e) => setF("websiteUrl",e.target.value)} placeholder="https://..." style={inputStyle} />
          </Field>
          <Field label="Info HAKI">
            <textarea value={form.hakiInfo||""} onChange={(e) => setF("hakiInfo",e.target.value)} placeholder="Informasi hak cipta..." rows={3} style={{ ...inputStyle, resize:"vertical" }} />
          </Field>
        </Section>
      )}
      {activeSection === "pejabat" && (
        <Section title="Data Pejabat">
          <Field label="Nama Kepala Dinas" required>
            <input value={form.namaKepala||""} onChange={(e) => setF("namaKepala",e.target.value)} placeholder="Nama lengkap kepala dinas" style={inputStyle} />
          </Field>
          <Grid2 isMobile={isMobile}>
            <Field label="Wakil Kepala">
              <input value={form.namaWakil||""} onChange={(e) => setF("namaWakil",e.target.value)} placeholder="Nama wakil kepala" style={inputStyle} />
            </Field>
            <Field label="Sekretaris">
              <input value={form.namaSekretaris||""} onChange={(e) => setF("namaSekretaris",e.target.value)} placeholder="Nama sekretaris" style={inputStyle} />
            </Field>
          </Grid2>
        </Section>
      )}
      {activeSection === "kontak" && (
        <Section title="Kontak & Alamat">
          <Field label="Alamat Kantor">
            <textarea value={form.alamat||""} onChange={(e) => setF("alamat",e.target.value)} placeholder="Alamat lengkap kantor..." rows={3} style={{ ...inputStyle, resize:"vertical" }} />
          </Field>
          <Grid2 isMobile={isMobile}>
            <Field label="Nomor Telepon">
              <input value={form.telepon||""} onChange={(e) => setF("telepon",e.target.value)} placeholder="0380-..." style={inputStyle} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email||""} onChange={(e) => setF("email",e.target.value)} placeholder="info@instansi.go.id" style={inputStyle} />
            </Field>
          </Grid2>
        </Section>
      )}
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ margin:"0 0 18px", fontSize:15, fontWeight:800, color:"white", paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>{title}</h3>
      {children}
    </div>
  );
}

function Grid2({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:isMobile?0:16 }}>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", marginBottom:8, letterSpacing:"0.05em", textTransform:"uppercase" }}>
        {label} {required && <span style={{ color:"#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Toast({ toast }: { toast: { msg: string; type: "success"|"error" } | null }) {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div style={{ position:"fixed", top:20, right:16, left:16, maxWidth:360, margin:"0 auto", zIndex:9999, padding:"12px 20px", background: ok?"#0d2b1a":"#2b0d0d", border:`1px solid ${ok?"#22c55e":"#ef4444"}`, borderRadius:10, color: ok?"#22c55e":"#ef4444", fontSize:13, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.4)", animation:"slideIn 0.2s ease" }}>
      {ok?"✓":"✕"} {toast.msg}
    </div>
  );
}

function GlobalStyles() {
  return <style>{`
    @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.2)!important }
    input:focus, textarea:focus { border-color:rgba(59,130,246,0.5)!important; outline:none; }
    select option { background:#1c2330 }
  `}</style>;
}

const inputStyle: React.CSSProperties = {
  width:"100%", padding:"10px 14px",
  background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(255,255,255,0.1)",
  borderRadius:8, color:"white", fontSize:14,
  outline:"none", boxSizing:"border-box",
};