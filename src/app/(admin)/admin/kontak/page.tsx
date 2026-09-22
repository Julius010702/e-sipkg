// app/admin/kontak/page.tsx
'use client'

import { useEffect, useState } from 'react'

type KontakData = {
  unit: string
  alamat: string
  telepon: string
  email: string
  jamKerja: string
  namaInstansi: string
  namaProvinsi: string
  emailAkses: string
}

const DEFAULT: KontakData = {
  unit:         'Bagian Kelembagaan dan Analisis Jabatan',
  alamat:       'Jl. El Tari No. 52, Kota Kupang, NTT',
  telepon:      '(0380) 821710',
  email:        'biroorganisasi@nttprov.go.id',
  jamKerja:     'Senin–Jumat, 07.30–16.00 WITA',
  namaInstansi: 'Biro Organisasi Setda',
  namaProvinsi: 'Provinsi Nusa Tenggara Timur',
  emailAkses:   'biroorganisasi@nttprov.go.id',
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Field({
  label, name, value, onChange, type = 'text', hint,
}: {
  label: string; name: keyof KontakData; value: string
  onChange: (k: keyof KontakData, v: string) => void
  type?: string; hint?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        style={{
          width: '100%', padding: '9px 12px',
          border: '1px solid #e5e7eb', borderRadius: 9,
          fontSize: 13, color: '#111827',
          outline: 'none', background: '#fff',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6' }}
        onBlur={e  => { e.currentTarget.style.borderColor = '#e5e7eb' }}
      />
      {hint && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>{hint}</p>}
    </div>
  )
}

function PreviewCard({ data }: { data: KontakData }) {
  return (
    <div className="kk-preview-grid">
      {/* Kartu kiri */}
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e5e9f2', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: 24, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #f0f2f7' }}>
          <div style={{ width: 44, height: 44, background: '#f3f4f6', borderRadius: '50%', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 800, color: '#0a1f4e', fontSize: 14 }}>{data.namaInstansi || '—'}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{data.namaProvinsi || '—'}</p>
          </div>
        </div>
        {[
          { label: 'Unit',      value: data.unit },
          { label: 'Alamat',    value: data.alamat },
          { label: 'Telepon',   value: data.telepon },
          { label: 'Email',     value: data.email },
          { label: 'Jam Kerja', value: data.jamKerja },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ width: 76, flexShrink: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontSize: 12, color: '#1e293b', fontWeight: 600, wordBreak: 'break-word' }}>{row.value || '—'}</span>
          </div>
        ))}
      </div>

      {/* Kartu kanan */}
      <div style={{ background: 'linear-gradient(145deg,#0a1f4e,#0e2d6b,#0a1f4e)', border: '1px solid rgba(212,160,23,0.3)', borderRadius: 18, padding: 24, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle,rgba(212,160,23,0.1),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(212,160,23,0.15)', border: '1.5px solid rgba(212,160,23,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#d4a017" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 15, margin: '0 0 8px' }}>Butuh Akses Portal?</h3>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 1.7, margin: '0 0 16px' }}>
            Akun portal e-SIPKG diberikan oleh Administrator kepada sekolah-sekolah yang terdaftar. Hubungi Biro Organisasi untuk mendapatkan akses.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,160,23,0.25)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4a017', flexShrink: 0 }} />
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 12, margin: 0 }}>{data.namaInstansi} Prov. NTT</p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: '0 0 3px', paddingLeft: 14, wordBreak: 'break-word' }}>{data.unit}</p>
            <p style={{ color: '#d4a017', fontSize: 12, margin: 0, paddingLeft: 14, fontWeight: 600, wordBreak: 'break-word' }}>{data.emailAkses || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminKontakPage() {
  const [form, setForm]       = useState<KontakData>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [preview, setPreview] = useState(false)

  // Fetch data saat mount
  useEffect(() => {
    fetch('/api/admin/kontak')
      .then(r => r.json())
      .then(d => { if (d.data) setForm(d.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleChange(key: keyof KontakData, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    setToast(null)
    try {
      const res  = await fetch('/api/admin/kontak', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan')
      setToast({ type: 'success', msg: '✓ Data kontak berhasil disimpan!' })
    } catch (err: unknown) {
      setToast({ type: 'error', msg: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  function handleReset() {
    setForm(DEFAULT)
    setToast({ type: 'success', msg: 'Form direset ke nilai default' })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#9ca3af', fontSize: 14, gap: 10 }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115-4.5M20 15a9 9 0 01-15 4.5"/>
        </svg>
        Memuat data kontak...
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div className="kk-page" style={{ width: '100%', maxWidth: 960, margin: '0 auto', paddingBottom: 40, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div className="kk-toast" style={{
          background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: toast.type === 'success' ? '#065f46' : '#991b1b',
          padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

        .kk-toast {
          position: fixed; top: 16px; right: 16px; left: 16px; z-index: 999;
          animation: slideIn 0.3s ease;
        }
        .kk-preview-grid { display:grid; grid-template-columns: 1fr 1fr; gap:16px; }
        .kk-form-grid    { display:grid; grid-template-columns: 1fr 1fr; gap:16px; }
        .kk-header-row   { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .kk-actions-row  { display:flex; align-items:center; justify-content:space-between; margin-top:20px; flex-wrap:wrap; gap:10px; }

        @media (min-width: 481px) {
          .kk-toast { left: auto; width: 320px; }
        }
        @media (max-width: 768px) {
          .kk-preview-grid { grid-template-columns: 1fr; }
          .kk-form-grid    { grid-template-columns: 1fr; }
        }
        @media (max-width: 520px) {
          .kk-header-row button { width: 100%; justify-content: center; }
          .kk-actions-row { flex-direction: column-reverse; align-items: stretch; }
          .kk-actions-row button { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div className="kk-header-row">
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Superadmin</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: '#111827' }}>Kelola Kontak &amp; Informasi</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>
              Data ini tampil di halaman publik pada section "Kontak &amp; Informasi"
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 260 }}>
            <button onClick={() => setPreview(p => !p)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 9,
              background: preview ? '#eff6ff' : '#f3f4f6',
              border: `1px solid ${preview ? '#bfdbfe' : '#e5e7eb'}`,
              color: preview ? '#1d4ed8' : '#374151',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              {preview ? 'Sembunyikan Preview' : 'Lihat Preview'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Preview ──────────────────────────────────────────────────── */}
      {preview && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 10px' }}>Preview Tampilan Publik</span>
            <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
          </div>
          <div style={{ background: '#f8faff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16 }}>
            <PreviewCard data={form} />
          </div>
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────────────────── */}
      <div className="kk-form-grid">

        {/* Kartu kiri — Identitas Instansi */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ width: 30, height: 30, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Identitas Instansi</p>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Tampil di header kartu kontak</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Nama Instansi" name="namaInstansi" value={form.namaInstansi} onChange={handleChange} hint="Contoh: Biro Organisasi Setda" />
            <Field label="Nama Provinsi" name="namaProvinsi" value={form.namaProvinsi} onChange={handleChange} hint="Contoh: Provinsi Nusa Tenggara Timur" />
            <Field label="Unit / Bagian" name="unit" value={form.unit} onChange={handleChange} hint="Contoh: Bagian Kelembagaan dan Analisis Jabatan" />
          </div>
        </div>

        {/* Kartu kanan — Informasi Kontak */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ width: 30, height: 30, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Informasi Kontak</p>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Tampil di baris-baris tabel kontak</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Alamat" name="alamat" value={form.alamat} onChange={handleChange} />
            <Field label="Nomor Telepon" name="telepon" value={form.telepon} onChange={handleChange} type="tel" />
            <Field label="Email Publik" name="email" value={form.email} onChange={handleChange} type="email" />
            <Field label="Jam Kerja" name="jamKerja" value={form.jamKerja} onChange={handleChange} hint="Contoh: Senin–Jumat, 07.30–16.00 WITA" />
          </div>
        </div>
      </div>

      {/* Kartu bawah — Kartu Akses */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ width: 30, height: 30, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#d97706" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Kartu "Butuh Akses Portal?"</p>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Email yang tampil di kartu kanan halaman kontak publik</p>
          </div>
        </div>
        <div style={{ maxWidth: 480 }}>
          <Field
            label="Email untuk Permintaan Akses"
            name="emailAkses"
            value={form.emailAkses}
            onChange={handleChange}
            type="email"
            hint="Email ini akan tampil berwarna emas di kartu biru gelap"
          />
        </div>
      </div>

      {/* ── Action Buttons ───────────────────────────────────────────── */}
      <div className="kk-actions-row">
        <button onClick={handleReset} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 9,
          background: '#fff', border: '1px solid #e5e7eb', color: '#6b7280',
          cursor: 'pointer',
        }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115-4.5M20 15a9 9 0 01-15 4.5"/>
          </svg>
          Reset ke Default
        </button>

        <button onClick={handleSave} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 700, padding: '11px 28px', borderRadius: 10,
          background: saving ? '#9ca3af' : '#111827', color: '#fff',
          border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          boxShadow: saving ? 'none' : '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.15s',
        }}>
          {saving ? (
            <>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115-4.5M20 15a9 9 0 01-15 4.5"/>
              </svg>
              Menyimpan...
            </>
          ) : (
            <>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              Simpan Perubahan
            </>
          )}
        </button>
      </div>
    </div>
  )
}