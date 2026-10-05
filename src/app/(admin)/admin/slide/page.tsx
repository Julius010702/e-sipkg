// app/admin/slide/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

type Slide = {
  id: string
  src: string
  alt: string
  urutan: number
  aktif: boolean
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TextField({
  label, value, onChange, placeholder, hint,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; hint?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
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

// Upload gambar → mengembalikan path publik hasil upload (mis. /uploads/slides/xxx.jpg)
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res  = await fetch('/api/admin/upload', { method: 'POST', body: formData })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Gagal mengunggah gambar')
  return data.data.path as string
}

function ImageUploadBox({
  preview, uploading, onFileSelect, height = 140,
}: {
  preview: string
  uploading: boolean
  onFileSelect: (file: File) => void
  height?: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelect(f); e.target.value = '' }}
      />
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          width: '100%', height, borderRadius: 10, overflow: 'hidden', position: 'relative',
          border: '1.5px dashed #cbd5e1', background: '#f8faff', cursor: uploading ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {preview && (
          <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {!preview && !uploading && (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} style={{ margin: '0 auto 6px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3"/></svg>
            <p style={{ fontSize: 11.5, fontWeight: 600, margin: 0 }}>Klik untuk unggah gambar</p>
          </div>
        )}
        {uploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115-4.5M20 15a9 9 0 01-15 4.5"/>
            </svg>
          </div>
        )}
        {preview && !uploading && (
          <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(17,24,39,0.75)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>
            Ganti gambar
          </div>
        )}
      </div>
    </div>
  )
}

function SlideCard({
  slide, onUpdate, onDelete, onMove, isFirst, isLast, saving,
}: {
  slide: Slide
  onUpdate: (id: string, patch: Partial<Slide>) => void
  onDelete: (id: string) => void
  onMove: (id: string, dir: 'up' | 'down') => void
  isFirst: boolean
  isLast: boolean
  saving: boolean
}) {
  const [src, setSrc]             = useState(slide.src)
  const [alt, setAlt]             = useState(slide.alt)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const dirty = src !== slide.src || alt !== slide.alt

  async function handleFileSelect(file: File) {
    setUploading(true)
    setUploadErr('')
    try {
      const uploadedPath = await uploadImage(file)
      setSrc(uploadedPath)
    } catch (err: unknown) {
      setUploadErr(err instanceof Error ? err.message : 'Gagal mengunggah gambar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* Upload / preview */}
      <div style={{ width: 180, flexShrink: 0 }}>
        <ImageUploadBox preview={src} uploading={uploading} onFileSelect={handleFileSelect} height={110} />
        {uploadErr && <p style={{ margin: '6px 0 0', fontSize: 10.5, color: '#dc2626' }}>{uploadErr}</p>}
      </div>

      {/* Form fields */}
      <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <TextField label="Teks Alternatif" value={alt} onChange={setAlt} placeholder="Deskripsi singkat gambar" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={slide.aktif}
              onChange={e => onUpdate(slide.id, { aktif: e.target.checked })}
              style={{ width: 15, height: 15, accentColor: '#2563EB', cursor: 'pointer' }}
            />
            Tampilkan di beranda
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => onMove(slide.id, 'up')} disabled={isFirst} title="Naikkan urutan" style={iconBtnStyle(isFirst)}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
            </button>
            <button onClick={() => onMove(slide.id, 'down')} disabled={isLast} title="Turunkan urutan" style={iconBtnStyle(isLast)}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>

            <button
              onClick={() => onUpdate(slide.id, { src, alt })}
              disabled={!dirty || saving || uploading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700,
                padding: '7px 14px', borderRadius: 8, border: 'none', cursor: dirty ? 'pointer' : 'not-allowed',
                background: dirty ? '#2563EB' : '#e5e7eb', color: dirty ? '#fff' : '#9ca3af',
              }}
            >
              Simpan
            </button>

            <button
              onClick={() => onDelete(slide.id)}
              title="Hapus slide"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 8, border: '1px solid #fecaca',
                background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
              }}
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function iconBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 30, height: 30, borderRadius: 8, border: '1px solid #e5e7eb',
    background: disabled ? '#f9fafb' : '#fff', color: disabled ? '#d1d5db' : '#374151',
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminSlidePage() {
  const [slides, setSlides]   = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Form tambah slide baru
  const [newSrc, setNewSrc]             = useState('')
  const [newAlt, setNewAlt]             = useState('')
  const [newUploading, setNewUploading] = useState(false)
  const [newUploadErr, setNewUploadErr] = useState('')
  const [adding, setAdding]             = useState(false)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  async function loadSlides() {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/slide')
      const data = await res.json()
      const list: Slide[] = Array.isArray(data.data) ? data.data : []
      list.sort((a, b) => a.urutan - b.urutan)
      setSlides(list)
    } catch {
      showToast('error', 'Gagal memuat daftar slide')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSlides() }, [])

  async function handleNewFileSelect(file: File) {
    setNewUploading(true)
    setNewUploadErr('')
    try {
      const uploadedPath = await uploadImage(file)
      setNewSrc(uploadedPath)
    } catch (err: unknown) {
      setNewUploadErr(err instanceof Error ? err.message : 'Gagal mengunggah gambar')
    } finally {
      setNewUploading(false)
    }
  }

  async function handleAdd() {
    if (!newSrc) {
      showToast('error', 'Unggah gambar terlebih dahulu')
      return
    }
    setAdding(true)
    try {
      const res  = await fetch('/api/admin/slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src: newSrc, alt: newAlt.trim() || 'Banner e-SIPKG NTT' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menambah slide')
      setNewSrc('')
      setNewAlt('')
      showToast('success', '✓ Slide baru berhasil ditambahkan')
      loadSlides()
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setAdding(false)
    }
  }

  async function handleUpdate(id: string, patch: Partial<Slide>) {
    setSaving(true)
    try {
      const res  = await fetch(`/api/admin/slide/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui slide')
      showToast('success', '✓ Perubahan disimpan')
      loadSlides()
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Hapus slide ini? Tindakan tidak bisa dibatalkan.')) return
    setSaving(true)
    try {
      const res  = await fetch(`/api/admin/slide/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus slide')
      showToast('success', 'Slide dihapus')
      loadSlides()
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  async function handleMove(id: string, dir: 'up' | 'down') {
    const idx = slides.findIndex(s => s.id === id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (idx === -1 || swapIdx < 0 || swapIdx >= slides.length) return

    const a = slides[idx]
    const b = slides[swapIdx]

    // Tukar urutan secara optimis di UI
    const next = [...slides]
    next[idx] = { ...a, urutan: b.urutan }
    next[swapIdx] = { ...b, urutan: a.urutan }
    next.sort((x, y) => x.urutan - y.urutan)
    setSlides(next)

    try {
      await Promise.all([
        fetch(`/api/admin/slide/${a.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urutan: b.urutan }) }),
        fetch(`/api/admin/slide/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urutan: a.urutan }) }),
      ])
    } catch {
      showToast('error', 'Gagal menyimpan urutan baru')
      loadSlides()
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#9ca3af', fontSize: 14, gap: 10 }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115-4.5M20 15a9 9 0 01-15 4.5"/>
        </svg>
        Memuat data slide...
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: toast.type === 'success' ? '#065f46' : '#991b1b',
          padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Superadmin</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>Kelola Slide Beranda</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>
              Slide ini tampil bergantian di banner atas halaman beranda publik
            </p>
          </div>
        </div>
      </div>

      {/* ── Tambah Slide Baru ──────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 22, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ width: 30, height: 30, background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Tambah Slide Baru</p>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Format JPG/PNG/WEBP/GIF, maksimal 5MB</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Gambar Slide</label>
            <ImageUploadBox preview={newSrc} uploading={newUploading} onFileSelect={handleNewFileSelect} />
            {newUploadErr && <p style={{ margin: '6px 0 0', fontSize: 10.5, color: '#dc2626' }}>{newUploadErr}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextField label="Teks Alternatif" value={newAlt} onChange={setNewAlt} placeholder="Deskripsi singkat gambar" />
            <button
              onClick={handleAdd}
              disabled={adding || newUploading || !newSrc}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 13, fontWeight: 700,
                padding: '10px 18px', borderRadius: 9, border: 'none',
                cursor: (adding || newUploading || !newSrc) ? 'not-allowed' : 'pointer',
                background: (adding || newUploading || !newSrc) ? '#9ca3af' : '#111827', color: '#fff', height: 40,
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              {adding ? 'Menambah...' : 'Tambah Slide'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Daftar Slide ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 10px' }}>
          {slides.length} Slide Terdaftar
        </span>
        <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {slides.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>
            Belum ada slide. Tambahkan slide pertama di atas.
          </div>
        ) : slides.map((s, i) => (
          <SlideCard
            key={s.id}
            slide={s}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onMove={handleMove}
            isFirst={i === 0}
            isLast={i === slides.length - 1}
            saving={saving}
          />
        ))}
      </div>
    </div>
  )
}