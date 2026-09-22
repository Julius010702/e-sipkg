'use client'

import { useState, useEffect } from 'react'

interface Wilayah { id: string; nama: string; provinsi: string }

type ModalState =
  | { kind: 'confirm-delete'; id: string; nama: string }
  | { kind: 'success'; title: string; text: string }
  | { kind: 'error'; title: string; text: string }
  | null

/* ─── Modal ala "Apakah Anda Yakin?" ──────────────────────────────── */
function AlertModal({ modal, onClose, onConfirmDelete }: {
  modal: ModalState
  onClose: () => void
  onConfirmDelete: (id: string, nama: string) => void
}) {
  if (!modal) return null

  const isConfirm = modal.kind === 'confirm-delete'
  const isSuccess = modal.kind === 'success'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white px-6 py-8 text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: isConfirm ? 'rgba(245,158,11,0.1)' : isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          }}>
          {isConfirm && (
            <svg className="h-9 w-9 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v5m0 3h.01" />
            </svg>
          )}
          {isSuccess && (
            <svg className="h-9 w-9 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
            </svg>
          )}
          {modal.kind === 'error' && (
            <svg className="h-9 w-9 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
            </svg>
          )}
        </div>

        {/* Title & text */}
        {isConfirm ? (
          <>
            <h3 className="text-lg font-bold text-gray-900">Apakah Anda Yakin?</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              Wilayah &ldquo;{modal.nama}&rdquo; akan dihapus dan tidak dapat dikembalikan!
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-gray-900">{modal.title}</h3>
            <p className="mt-1.5 text-sm text-gray-500">{modal.text}</p>
          </>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-center gap-3">
          {isConfirm ? (
            <>
              <button
                onClick={() => { onConfirmDelete(modal.id, modal.nama); onClose() }}
                className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Ya, hapus!
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Batal
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ background: isSuccess ? '#10b981' : '#ef4444' }}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BiroWilayahPage() {
  const [list, setList]     = useState<Wilayah[]>([])
  const [nama, setNama]     = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editNama, setEditNama] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [modal, setModal]   = useState<ModalState>(null)

  function load() {
    fetch('/api/wilayah').then(r => r.json()).then(d => setList(d.data || []))
  }
  useEffect(() => { load() }, [])

  async function handleTambah(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch('/api/wilayah', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: nama.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setModal({ kind: 'error', title: 'Gagal Menambahkan', text: data.error || 'Terjadi kesalahan' }); return }
      setModal({ kind: 'success', title: 'Berhasil!', text: `Wilayah "${nama}" berhasil ditambahkan.` })
      setNama(''); load()
    } catch {
      setModal({ kind: 'error', title: 'Gagal Menambahkan', text: 'Terjadi kesalahan, silakan coba lagi.' })
    } finally { setLoading(false) }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault(); if (!editId) return; setLoading(true)
    try {
      const res = await fetch(`/api/wilayah/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: editNama.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setModal({ kind: 'error', title: 'Gagal Memperbarui', text: data.error || 'Terjadi kesalahan' }); return }
      setModal({ kind: 'success', title: 'Berhasil!', text: 'Data wilayah telah diperbarui.' })
      setEditId(null); setEditNama(''); load()
    } catch {
      setModal({ kind: 'error', title: 'Gagal Memperbarui', text: 'Terjadi kesalahan, silakan coba lagi.' })
    } finally { setLoading(false) }
  }

  function askDelete(id: string, namaWilayah: string) {
    setModal({ kind: 'confirm-delete', id, nama: namaWilayah })
  }

  async function confirmDelete(id: string, namaWilayah: string) {
    try {
      const res = await fetch(`/api/wilayah/${id}`, { method: 'DELETE' })
      if (!res.ok) { setModal({ kind: 'error', title: 'Gagal Menghapus', text: 'Wilayah gagal dihapus.' }); return }
      load()
      setModal({ kind: 'success', title: 'Terhapus!', text: `Wilayah "${namaWilayah}" berhasil dihapus.` })
    } catch {
      setModal({ kind: 'error', title: 'Gagal Menghapus', text: 'Terjadi kesalahan, silakan coba lagi.' })
    }
  }

  const filtered = list.filter(w => w.nama.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Master Wilayah</h2>
        <p className="text-sm text-gray-500 mt-0.5">Kelola data kabupaten/kota Provinsi NTT</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className={`px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 ${editId ? 'bg-amber-50' : 'bg-gray-50'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${editId ? 'bg-amber-100' : 'bg-indigo-900'}`}>
              <svg className={`w-3.5 h-3.5 ${editId ? 'text-amber-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {editId
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                }
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-800">{editId ? 'Edit Wilayah' : 'Tambah Kabupaten/Kota'}</h3>
          </div>
          <div className="p-5">
            <form onSubmit={editId ? handleEdit : handleTambah} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Kabupaten/Kota <span className="text-red-500">*</span></label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={editId ? editNama : nama}
                  onChange={e => editId ? setEditNama(e.target.value) : setNama(e.target.value)}
                  placeholder="Contoh: Kota Kupang" required/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Provinsi</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" value="Nusa Tenggara Timur" readOnly/>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-900 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 transition-colors disabled:opacity-60">
                  {loading ? 'Menyimpan...' : editId ? 'Perbarui' : 'Tambahkan'}
                </button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); setEditNama('') }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Daftar */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Daftar Wilayah <span className="text-xs font-normal text-gray-400">({filtered.length})</span></h3>
          </div>
          <div className="px-4 py-3 border-b border-gray-100">
            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Cari wilayah…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">{search ? 'Tidak ditemukan' : 'Belum ada wilayah'}</p>
            ) : filtered.map(w => (
              <div key={w.id} className="px-4 py-3 flex items-center justify-between gap-2 hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{w.nama}</p>
                  <p className="text-xs text-gray-400">Nusa Tenggara Timur</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => { setEditId(w.id); setEditNama(w.nama) }}
                    className="text-xs text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-colors">Edit</button>
                  <button onClick={() => askDelete(w.id, w.nama)}
                    className="text-xs text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AlertModal modal={modal} onClose={() => setModal(null)} onConfirmDelete={confirmDelete} />
    </div>
  )
}