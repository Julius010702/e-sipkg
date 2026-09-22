'use client'

import { useState, useEffect, useRef } from 'react'

type FormData = {
  nama: string
  jenisSekolah: string
  npsn: string
  alamat: string
  namaWilayah: string
  jumlahSiswa: number | string
  jumlahRombel: number | string
  kepalaSekolah: string
  nipKepala: string
  fotoSekolah: string   // data URL (base64) atau URL hasil upload
  fotoKepala: string    // data URL (base64) atau URL hasil upload
}

type ModalState =
  | { kind: 'success'; text: string }
  | { kind: 'error'; text: string }
  | null

const emptyForm: FormData = {
  nama: '',
  jenisSekolah: 'SMA',
  npsn: '',
  alamat: '',
  namaWilayah: '',
  jumlahSiswa: 0,
  jumlahRombel: 0,
  kepalaSekolah: '',
  nipKepala: '',
  fotoSekolah: '',
  fotoKepala: '',
}

/* ─── Helper: baca file jadi data URL ────────────────────────────── */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/* ─── Popup notifikasi sukses / error ────────────────────────────── */
function AlertModal({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
  if (!modal) return null
  const isSuccess = modal.kind === 'success'
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white px-6 py-8 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
          {isSuccess ? (
            <svg className="h-9 w-9 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
            </svg>
          ) : (
            <svg className="h-9 w-9 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
            </svg>
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-900">{isSuccess ? 'Berhasil!' : 'Gagal'}</h3>
        <p className="mt-1.5 text-sm text-gray-500">{modal.text}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ background: isSuccess ? '#10b981' : '#ef4444' }}
        >
          OK
        </button>
      </div>
    </div>
  )
}

/* ─── Baris tampilan read-only ───────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-gray-800 font-semibold text-right">
        {value || <span className="text-gray-300 font-normal">—</span>}
      </span>
    </div>
  )
}

/* ─── Mini stat card ──────────────────────────────────────────────── */
function StatMini({ icon, value, label, bg }: { icon: React.ReactNode; value: React.ReactNode; label: string; bg: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-400 truncate">{label}</p>
      </div>
    </div>
  )
}

/* ─── Input upload foto dengan preview ───────────────────────────── */
function PhotoUpload({
  label, value, onChange, shape = 'square',
}: {
  label: string
  value: string
  onChange: (dataUrl: string) => void
  shape?: 'square' | 'circle'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      onChange(dataUrl)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const boxShape = shape === 'circle' ? 'rounded-full' : 'rounded-xl'

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-4">
        <div className={`relative w-20 h-20 flex-shrink-0 ${boxShape} overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 w-fit"
          >
            {uploading ? 'Mengunggah...' : value ? 'Ganti Foto' : 'Unggah Foto'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs text-red-500 hover:underline w-fit"
            >
              Hapus foto
            </button>
          )}
          <p className="text-[10px] text-gray-400">JPG/PNG, maks. 2MB</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  )
}

/* ─── Modal wrapper generik ──────────────────────────────────────── */
function ModalShell({
  title, subtitle, onClose, children,
}: {
  title: string
  subtitle: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4 py-8" onClick={onClose}>
      <div
        className="w-full max-w-xl max-h-full overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ─── Modal: Edit Profil Sekolah (tanpa data kepala sekolah) ─────── */
function EditSekolahModal({
  open, form, setForm, loading, onClose, onSubmit,
}: {
  open: boolean
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  loading: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  if (!open) return null

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  return (
    <ModalShell title="Edit Profil Sekolah" subtitle="Data ini akan ditampilkan di laporan ANJAB & ABK" onClose={onClose}>
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <PhotoUpload label="Foto Sekolah" value={form.fotoSekolah} onChange={v => set('fotoSekolah', v)} shape="square" />

        <div>
          <label className="label">Nama Sekolah <span className="text-red-500">*</span></label>
          <input className="input" value={form.nama} onChange={e => set('nama', e.target.value)}
            placeholder="SMA Negeri 1 Kupang" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Jenis Sekolah <span className="text-red-500">*</span></label>
            <select className="input" value={form.jenisSekolah} onChange={e => set('jenisSekolah', e.target.value)}>
              <option value="SMA">SMA</option>
              <option value="SMK">SMK</option>
              <option value="SLB">SLB</option>
            </select>
          </div>
          <div>
            <label className="label">NPSN</label>
            <input className="input" value={form.npsn} onChange={e => set('npsn', e.target.value)}
              placeholder="8 digit angka" maxLength={8} />
          </div>
        </div>

        <div>
          <label className="label">Kabupaten/Kota <span className="text-red-500">*</span></label>
          <input className="input" value={form.namaWilayah} onChange={e => set('namaWilayah', e.target.value)}
            placeholder="Contoh: Kota Kupang, Kabupaten TTS, Kabupaten Flores Timur…" required />
          <p className="text-xs text-gray-400 mt-1">
            Ketik nama kabupaten/kota sesuai data dinas. Data ini akan diverifikasi oleh Biro atau Admin.
          </p>
        </div>

        <div>
          <label className="label">Alamat Lengkap</label>
          <textarea className="input" rows={2} value={form.alamat} onChange={e => set('alamat', e.target.value)}
            placeholder="Jalan, Kelurahan, Kecamatan" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Jumlah Siswa <span className="text-red-500">*</span></label>
            <input type="number" min={0} className="input" value={form.jumlahSiswa}
              onChange={e => set('jumlahSiswa', e.target.value)} required />
          </div>
          <div>
            <label className="label">Jumlah Rombel <span className="text-red-500">*</span></label>
            <input type="number" min={0} className="input" value={form.jumlahRombel}
              onChange={e => set('jumlahRombel', e.target.value)} required />
            <p className="text-xs text-gray-400 mt-1">Rombongan Belajar (kelas aktif)</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2 sticky bottom-0 bg-white pb-1">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-900 transition-colors disabled:opacity-60">
            {loading ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

/* ─── Modal: Edit Data Kepala Sekolah (terpisah) ─────────────────── */
function EditKepalaModal({
  open, form, setForm, loading, onClose, onSubmit,
}: {
  open: boolean
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  loading: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  if (!open) return null

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  return (
    <ModalShell title="Edit Data Kepala Sekolah" subtitle="Ditampilkan di tanda tangan laporan ANJAB & ABK" onClose={onClose}>
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <PhotoUpload label="Foto Kepala Sekolah" value={form.fotoKepala} onChange={v => set('fotoKepala', v)} shape="circle" />

        <div>
          <label className="label">Nama Kepala Sekolah</label>
          <input className="input" value={form.kepalaSekolah} onChange={e => set('kepalaSekolah', e.target.value)}
            placeholder="Drs. John Doe, M.Pd." />
        </div>
        <div>
          <label className="label">NIP Kepala Sekolah</label>
          <input className="input" value={form.nipKepala} onChange={e => set('nipKepala', e.target.value)}
            placeholder="18 digit NIP" maxLength={18} />
          <p className="text-xs text-gray-400 mt-1">
            Nama dan NIP akan ditampilkan di tanda tangan laporan ANJAB &amp; ABK
          </p>
        </div>

        <div className="flex gap-2 pt-2 sticky bottom-0 bg-white pb-1">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-900 transition-colors disabled:opacity-60">
            {loading ? 'Menyimpan...' : 'Simpan Data Kepala Sekolah'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

export default function ProfilSekolahPage() {
  const [saved, setSaved]   = useState<FormData>(emptyForm)
  const [form, setForm]     = useState<FormData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [editSekolahOpen, setEditSekolahOpen] = useState(false)
  const [editKepalaOpen, setEditKepalaOpen]   = useState(false)
  const [modal, setModal]   = useState<ModalState>(null)
  const [ready, setReady]   = useState(false)

  function loadIntoState(d: FormData) {
    setSaved(d)
    setForm(d)
  }

  useEffect(() => {
    fetch('/api/sekolah/me').then(r => r.json()).then(d => {
      if (d.data) {
        loadIntoState({
          nama:          d.data.nama          || '',
          jenisSekolah:  d.data.jenisSekolah  || 'SMA',
          npsn:          d.data.npsn          || '',
          alamat:        d.data.alamat        || '',
          namaWilayah:   d.data.wilayah?.nama || '',
          jumlahSiswa:   d.data.jumlahSiswa   || 0,
          jumlahRombel:  d.data.jumlahRombel  || 0,
          kepalaSekolah: d.data.kepalaSekolah || '',
          nipKepala:     d.data.nipKepala     || '',
          fotoSekolah:   d.data.fotoSekolah   || '',
          fotoKepala:    d.data.fotoKepala    || '',
        })
      }
      setReady(true)
    })
  }, [])

  function openEditSekolah() {
    setForm(saved)
    setEditSekolahOpen(true)
  }

  function openEditKepala() {
    setForm(saved)
    setEditKepalaOpen(true)
  }

  async function saveToServer(next: FormData) {
    const res = await fetch('/api/sekolah/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...next,
        jumlahSiswa:  Number(next.jumlahSiswa),
        jumlahRombel: Number(next.jumlahRombel),
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  }

  async function handleSubmitSekolah(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // Gabung dengan data kepala sekolah yang tersimpan agar tidak tertimpa kosong
      const next: FormData = { ...saved, ...form }
      await saveToServer(next)
      loadIntoState(next)
      setEditSekolahOpen(false)
      setModal({ kind: 'success', text: 'Data profil sekolah berhasil disimpan.' })
    } catch (err) {
      setModal({ kind: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitKepala(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // Gabung dengan data sekolah yang tersimpan agar tidak tertimpa kosong
      const next: FormData = { ...saved, ...form }
      await saveToServer(next)
      loadIntoState(next)
      setEditKepalaOpen(false)
      setModal({ kind: 'success', text: 'Data kepala sekolah berhasil disimpan.' })
    } catch (err) {
      setModal({ kind: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan.' })
    } finally {
      setLoading(false)
    }
  }

  const isEmpty = ready && !saved.nama

  const fieldsToCheck: (keyof FormData)[] = [
    'nama', 'jenisSekolah', 'npsn', 'alamat', 'namaWilayah',
    'jumlahSiswa', 'jumlahRombel', 'kepalaSekolah', 'nipKepala',
  ]
  const filledCount = fieldsToCheck.filter(k => {
    const v = saved[k]
    return v !== '' && v !== 0 && v !== undefined && v !== null
  }).length
  const kelengkapan = Math.round((filledCount / fieldsToCheck.length) * 100)

  return (
    <div className="max-w-5xl space-y-5">

      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Profil Sekolah</h2>
        <p className="text-sm text-gray-500 mt-0.5">Informasi lengkap profil sekolah Anda</p>
      </div>

      {/* Empty state — belum ada data */}
      {isEmpty && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <svg className="w-7 h-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-800">Profil sekolah belum diisi</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Lengkapi data sekolah untuk laporan ANJAB &amp; ABK</p>
          <button
            onClick={openEditSekolah}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 transition-colors"
          >
            Lengkapi Profil
          </button>
        </div>
      )}

      {!isEmpty && (
        <>
          {/* Hero card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 flex items-center justify-center">
                {saved.fotoSekolah ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={saved.fotoSekolah} alt={saved.nama} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{saved.nama}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                    <span className="text-xs text-gray-400">
                      NPSN <span className="ml-1 font-semibold text-gray-700">{saved.npsn || '—'}</span>
                    </span>
                    <span className="text-xs text-gray-400">
                      Jenis Sekolah <span className="ml-1 font-semibold text-gray-700">{saved.jenisSekolah}</span>
                    </span>
                    <span className="text-xs text-gray-400">
                      Kabupaten/Kota <span className="ml-1 font-semibold text-gray-700">{saved.namaWilayah || '—'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Aktif
                    </span>
                  </div>
                </div>
                <button
                  onClick={openEditSekolah}
                  className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-blue-800 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-900 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profil
                </button>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatMini
              value={saved.jumlahSiswa} label="Jumlah Siswa"
              bg="rgba(37,99,235,0.1)"
              icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
            />
            <StatMini
              value={saved.jumlahRombel} label="Jumlah Rombel"
              bg="rgba(16,185,129,0.1)"
              icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s4.332.477 5.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>}
            />
            <StatMini
              value={`${kelengkapan}%`} label="Kelengkapan Data"
              bg="rgba(212,175,55,0.12)"
              icon={<svg className="w-5 h-5" style={{ color: '#B8962C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
          </div>

          {/* Dua kolom info */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Informasi Sekolah */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Informasi Sekolah</h3>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Nama Sekolah" value={saved.nama} />
                <InfoRow label="NPSN" value={saved.npsn} />
                <InfoRow label="Jenis Sekolah" value={saved.jenisSekolah} />
                <InfoRow label="Kabupaten/Kota" value={saved.namaWilayah} />
                <InfoRow label="Alamat" value={saved.alamat} />
                <InfoRow label="Jumlah Siswa" value={saved.jumlahSiswa} />
                <InfoRow label="Jumlah Rombel" value={saved.jumlahRombel} />
              </div>
            </div>

            {/* Kepala Sekolah */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Kepala Sekolah</h3>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                    {saved.fotoKepala ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={saved.fotoKepala} alt={saved.kepalaSekolah} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-7 h-7 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-gray-900 truncate">{saved.kepalaSekolah || '—'}</p>
                    <span className="inline-block mt-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-100">
                      Kepala Sekolah
                    </span>
                  </div>
                </div>

                <div className="px-0">
                  <InfoRow label="NIP Kepala Sekolah" value={saved.nipKepala} />
                </div>

                <button
                  onClick={openEditKepala}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Data Kepala Sekolah
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <EditSekolahModal
        open={editSekolahOpen}
        form={form}
        setForm={setForm}
        loading={loading}
        onClose={() => setEditSekolahOpen(false)}
        onSubmit={handleSubmitSekolah}
      />

      <EditKepalaModal
        open={editKepalaOpen}
        form={form}
        setForm={setForm}
        loading={loading}
        onClose={() => setEditKepalaOpen(false)}
        onSubmit={handleSubmitKepala}
      />

      <AlertModal modal={modal} onClose={() => setModal(null)} />
    </div>
  )
}