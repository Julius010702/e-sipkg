'use client'

// Taruh file ini di route admin kamu, misalnya:
//   src/app/(admin)/jabatan/page.tsx
// Sesuaikan path import (HeaderAdmin/SidebarAdmin dsb.) dengan struktur project kamu.

import { useState, useEffect, useCallback } from 'react'

interface JabatanMaster {
  id: string
  namaJabatan: string
  kode?: string | null
  jamStandar: number
  isBK: boolean
  deskripsi?: string | null
}

interface PermohonanRow {
  id: string
  namaJabatan: string
  alasan?: string | null
  status: 'PENDING' | 'DISETUJUI' | 'DITOLAK'
  catatanAdmin?: string | null
  sekolahNama?: string | null
  createdAt: string
}

type Tab = 'master' | 'permohonan'

const emptyMasterForm = {
  id: '' as string | null,
  namaJabatan: '',
  kode: '',
  jamStandar: '24' as string | number,
  isBK: false,
  deskripsi: '',
}

function fmtTanggal(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return iso }
}

function StatusBadge({ status }: { status: PermohonanRow['status'] }) {
  const map = {
    PENDING:   { label: 'Menunggu',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    DISETUJUI: { label: 'Disetujui', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    DITOLAK:   { label: 'Ditolak',   cls: 'bg-red-50 text-red-700 border-red-200' },
  }
  const s = map[status]
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>
}

export default function AdminJabatanPage() {
  const [tab, setTab] = useState<Tab>('permohonan')

  const [master, setMaster]           = useState<JabatanMaster[]>([])
  const [permohonan, setPermohonan]   = useState<PermohonanRow[]>([])
  const [filterStatus, setFilterStatus] = useState<'ALL' | PermohonanRow['status']>('PENDING')
  const [loading, setLoading]         = useState(false)
  const [form, setForm]               = useState(emptyMasterForm)
  const [toast, setToast]             = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadMaster = useCallback(() => {
    fetch('/api/jabatan', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => setMaster(Array.isArray(d.data) ? d.data : []))
      .catch(() => {})
  }, [])

  const loadPermohonan = useCallback(async () => {
    try {
      const res = await fetch('/api/biro/permohonan-jabatan', { credentials: 'same-origin' })
      const data = await res.json()
      if (!res.ok) {
        setToast({ type: 'error', text: data.error || 'Gagal memuat permohonan.' })
        setPermohonan([])
        return
      }
      setPermohonan(Array.isArray(data.data) ? data.data : [])
    } catch (error) {
      console.error('Load permohonan error:', error)
      setToast({ type: 'error', text: 'Gagal memuat permohonan.' })
      setPermohonan([])
    }
  }, [])

  useEffect(() => {
    // Initial load
    loadMaster()
    loadPermohonan()

    // Polling: refresh permohonan every 10s so Biro sees new submissions made from schools
    const id = setInterval(() => {
      loadPermohonan()
    }, 10000)

    // Also refresh when window/tab gains focus (user likely switched back after school submitted)
    const onFocus = () => loadPermohonan()
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [loadMaster, loadPermohonan])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const pendingCount = permohonan.filter(p => p.status === 'PENDING').length

  /* ── CRUD Master Jabatan ─────────────────────────────────────── */
  async function submitMaster(e: React.FormEvent) {
    e.preventDefault()
    if (!form.namaJabatan.trim()) return
    setLoading(true)
    const isEdit = !!form.id
    const url    = isEdit ? `/api/jabatan/${form.id}` : '/api/jabatan'
    const method = isEdit ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaJabatan: form.namaJabatan.trim(),
          kode:        form.kode.trim() || undefined,
          jamStandar:  Number(form.jamStandar) || 24,
          isBK:        form.isBK,
          deskripsi:   form.deskripsi.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setToast({ type: 'error', text: data.error || 'Gagal menyimpan jabatan.' }); return }
      setToast({ type: 'success', text: isEdit ? 'Jabatan berhasil diperbarui.' : 'Jabatan baru berhasil ditambahkan.' })
      setForm(emptyMasterForm)
      loadMaster()
    } catch {
      setToast({ type: 'error', text: 'Terjadi kesalahan.' })
    } finally {
      setLoading(false)
    }
  }

  function editMaster(j: JabatanMaster) {
    setForm({
      id: j.id,
      namaJabatan: j.namaJabatan,
      kode: j.kode ?? '',
      jamStandar: j.jamStandar,
      isBK: j.isBK,
      deskripsi: j.deskripsi ?? '',
    })
  }

  async function deleteMaster(id: string, nama: string) {
    if (!confirm(`Hapus jabatan "${nama}" dari master? Jabatan yang sudah dipakai sekolah tidak akan terhapus otomatis.`)) return
    try {
      const res = await fetch(`/api/jabatan/${id}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!res.ok) { setToast({ type: 'error', text: 'Gagal menghapus.' }); return }
      setToast({ type: 'success', text: 'Jabatan dihapus.' })
      loadMaster()
    } catch {
      setToast({ type: 'error', text: 'Terjadi kesalahan.' })
    }
  }

  /* ── Approve / Reject Permohonan ─────────────────────────────── */
  async function prosesPermohonan(id: string, status: 'DISETUJUI' | 'DITOLAK') {
    if (status === 'DITOLAK' && !confirm('Tolak permohonan jabatan ini?')) return
    try {
      const res = await fetch(`/api/biro/permohonan-jabatan/${id}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Jika Forbidden (403), kemungkinan token cookie tidak dikirim atau user bukan BIRO/ADMIN
        if (res.status === 403) {
          setToast({ type: 'error', text: 'Forbidden: akun Anda tidak memiliki izin. Pastikan Anda login sebagai BIRO/ADMIN.' })
        } else {
          setToast({ type: 'error', text: data.error || 'Gagal memproses permohonan.' })
        }
        return
      }
      setToast({ type: 'success', text: status === 'DISETUJUI' ? 'Permohonan disetujui & jabatan ditambahkan ke master.' : 'Permohonan ditolak.' })
      loadPermohonan()
      loadMaster()
    } catch (e) {
      console.error('prosesPermohonan error:', e)
      setToast({ type: 'error', text: 'Terjadi kesalahan.' })
    }
  }

  async function deletePermohonan(id: string) {
    try {
      const res = await fetch(`/api/biro/permohonan-jabatan/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      const data = await res.json()
      if (!res.ok) { setToast({ type: 'error', text: data.error || 'Gagal menghapus permohonan.' }); return }
      setToast({ type: 'success', text: 'Riwayat permohonan dihapus.' })
      loadPermohonan()
    } catch (e) {
      console.error('deletePermohonan error:', e)
      setToast({ type: 'error', text: 'Terjadi kesalahan saat menghapus.' })
    }
  }

  const filteredPermohonan = filterStatus === 'ALL' ? permohonan : permohonan.filter(p => p.status === filterStatus)

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Kelola Jabatan Guru</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Atur master daftar jabatan/mata pelajaran dan tinjau permohonan jabatan baru dari sekolah.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {pendingCount} permohonan menunggu
          </span>
        )}
      </div>

      {/* Toast sederhana */}
      {toast && (
        <div className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {toast.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'permohonan' as Tab, label: 'Permohonan Jabatan', count: pendingCount },
          { key: 'master'     as Tab, label: 'Master Jabatan',     count: master.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
              tab === t.key ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                tab === t.key ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: PERMOHONAN ─────────────────────────────────────── */}
      {tab === 'permohonan' && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-sm font-semibold text-gray-800">Daftar Permohonan dari Sekolah</h3>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="rounded-lg border border-gray-200 text-xs px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredPermohonan.length === 0 ? (
              <div className="text-center py-14 text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs">Tidak ada permohonan untuk status ini.</span>
                </div>
              </div>
            ) : filteredPermohonan.map(p => (
              <div key={p.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">{p.namaJabatan}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  {p.sekolahNama && (
                    <p className="text-xs font-medium text-blue-700 mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Diajukan oleh: {p.sekolahNama}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {fmtTanggal(p.createdAt)}
                  </p>
                  {p.alasan && <p className="text-xs text-gray-500 mt-1">&ldquo;{p.alasan}&rdquo;</p>}
                </div>
                {p.status === 'PENDING' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => prosesPermohonan(p.id, 'DISETUJUI')}
                      className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                      Setujui
                    </button>
                    <button
                      onClick={() => prosesPermohonan(p.id, 'DITOLAK')}
                      className="rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                )}

                            {/* Tombol hapus riwayat (tersedia untuk semua status) */}
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  if (!confirm('Hapus riwayat permohonan ini? Aksi ini tidak dapat dibatalkan.')) return
                                  deletePermohonan(p.id)
                                }}
                                className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Hapus
                              </button>
                            </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: MASTER JABATAN ─────────────────────────────────── */}
      {tab === 'master' && (
        <>
          {/* Form tambah/edit master */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className={`px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 ${form.id ? 'bg-amber-50' : 'bg-gray-50/70'}`}>
              <h3 className={`text-sm font-semibold ${form.id ? 'text-amber-800' : 'text-gray-800'}`}>
                {form.id ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}
              </h3>
            </div>
            <div className="p-5">
              <form onSubmit={submitMaster} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Nama Jabatan / Mata Pelajaran <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Contoh: Guru Matematika"
                      value={form.namaJabatan}
                      onChange={e => setForm(f => ({ ...f, namaJabatan: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Kode (opsional)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Contoh: MTK"
                      value={form.kode}
                      onChange={e => setForm(f => ({ ...f, kode: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Jam Standar per Minggu</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="input"
                      placeholder="Contoh: 24"
                      value={form.jamStandar}
                      onChange={e => setForm(f => ({ ...f, jamStandar: e.target.value.replace(/[^0-9]/g, '') }))}
                      disabled={form.isBK}
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <div className={`relative w-9 h-5 rounded-full transition-colors ${form.isBK ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <input
                          type="checkbox"
                          checked={form.isBK}
                          onChange={e => setForm(f => ({ ...f, isBK: e.target.checked }))}
                          className="sr-only"
                        />
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isBK ? 'translate-x-4' : ''}`} />
                      </div>
                      <span className="text-sm text-gray-700">Jabatan Guru BK</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label">Deskripsi (opsional)</label>
                  <textarea
                    className="input min-h-[70px] resize-none"
                    placeholder="Keterangan tambahan…"
                    value={form.deskripsi}
                    onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan…' : form.id ? 'Perbarui Jabatan' : 'Tambah Jabatan'}
                  </button>
                  {form.id && (
                    <button
                      type="button"
                      onClick={() => setForm(emptyMasterForm)}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Tabel master */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-3.5">
              <h3 className="text-sm font-semibold text-gray-800">
                Daftar Master Jabatan <span className="ml-1 text-xs font-normal text-gray-400">({master.length})</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">No</th>
                    <th className="border border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-600">Nama Jabatan</th>
                    <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">Kode</th>
                    <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">Jam Standar</th>
                    <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">BK</th>
                    <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {master.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">Belum ada jabatan di master.</td>
                    </tr>
                  ) : master.map((j, i) => (
                    <tr key={j.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                      <td className="border border-gray-200 px-3 py-2.5 text-center text-gray-400">{i + 1}</td>
                      <td className="border border-gray-200 px-3 py-2.5 font-medium text-gray-800">{j.namaJabatan}</td>
                      <td className="border border-gray-200 px-3 py-2.5 text-center text-gray-500">{j.kode || '—'}</td>
                      <td className="border border-gray-200 px-3 py-2.5 text-center text-gray-600">{j.isBK ? '—' : `${j.jamStandar} JP`}</td>
                      <td className="border border-gray-200 px-3 py-2.5 text-center">
                        {j.isBK && <span className="rounded-full bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 text-[10px] font-medium">BK</span>}
                      </td>
                      <td className="border border-gray-200 px-3 py-2.5 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => editMaster(j)} className="rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors">Edit</button>
                          <button onClick={() => deleteMaster(j.id, j.namaJabatan)} className="rounded-md px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}