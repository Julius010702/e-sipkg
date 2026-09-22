'use client'

import { useState, useEffect } from 'react'

interface Pengumuman {
  id: string
  judul: string
  isi: string
  tanggal: string
  batasWaktu: string | null
  pengirim: string
}

const emptyForm = { judul: '', isi: '', tanggal: '', batasWaktu: '' }

export default function BiroPengumumanPage() {
  const [list, setList]   = useState<Pengumuman[]>([])
  const [form, setForm]   = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]     = useState({ type: '', text: '' })

  function load() {
    fetch('/api/biro/pengumuman')
      .then(r => r.json())
      .then(d => setList(Array.isArray(d.data) ? d.data : []))
  }
  useEffect(() => { load() }, [])

  function mulaiEdit(p: Pengumuman) {
    setEditId(p.id)
    setForm({
      judul: p.judul,
      isi: p.isi,
      tanggal: p.tanggal.slice(0, 10),
      batasWaktu: p.batasWaktu ? p.batasWaktu.slice(0, 10) : '',
    })
    setMsg({ type: '', text: '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function batalEdit() {
    setEditId(null)
    setForm(emptyForm)
    setMsg({ type: '', text: '' })
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg({ type: '', text: '' })
    try {
      const res = await fetch(editId ? `/api/biro/pengumuman/${editId}` : '/api/biro/pengumuman', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: form.judul,
          isi: form.isi,
          tanggal: form.tanggal,
          batasWaktu: form.batasWaktu || undefined,
        }),
      })
      const d = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: d.error }); return }
      setMsg({ type: 'success', text: editId ? 'Pengumuman berhasil diperbarui!' : 'Pengumuman berhasil ditambahkan! Sekolah sudah dapat notifikasi.' })
      setForm(emptyForm)
      setEditId(null)
      load()
    } catch {
      setMsg({ type: 'error', text: 'Terjadi kesalahan jaringan' })
    } finally {
      setLoading(false)
    }
  }

  async function hapus(p: Pengumuman) {
    if (!confirm(`Hapus pengumuman "${p.judul}"?`)) return
    await fetch(`/api/biro/pengumuman/${p.id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Kelola Pengumuman</h2>
        <p className="text-sm text-gray-500">Pengumuman ini akan tampil di Dashboard Biro/Admin, dan Sekolah akan menerima notifikasi berisi pengumuman ini.</p>
      </div>

      {/* Form Tambah/Edit */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="font-semibold text-gray-800 mb-4">{editId ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}</h3>

        {msg.text && (
          <div className={`text-sm rounded-lg px-3 py-2 mb-4 border ${
            msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>{msg.text}</div>
        )}

        <form onSubmit={simpan} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Judul *</label>
            <input
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.judul}
              onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
              placeholder="Contoh: Jadwal Validasi Semester Genap"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Tanggal Pengumuman *</label>
              <input
                type="date"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.tanggal}
                onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Batas Waktu <span className="text-gray-400 font-normal">(opsional)</span></label>
              <input
                type="date"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.batasWaktu}
                onChange={e => setForm(f => ({ ...f, batasWaktu: e.target.value }))}
              />
              <p className="text-[11px] text-gray-400 mt-1">Isi kalau ada tenggat, mis. batas pengumpulan/pengiriman data.</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Isi Pengumuman *</label>
            <textarea
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.isi}
              onChange={e => setForm(f => ({ ...f, isi: e.target.value }))}
              placeholder="Tuliskan detail pengumuman di sini..."
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 transition-colors disabled:opacity-50">
              {loading ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Pengumuman'}
            </button>
            {editId && (
              <button type="button" onClick={batalEdit} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Daftar Pengumuman */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
          <h3 className="text-sm font-semibold text-gray-800">Daftar Pengumuman ({list.length})</h3>
        </div>
        {list.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">Belum ada pengumuman</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {list.map(p => (
              <div key={p.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-gray-400">
                      {new Date(p.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {p.batasWaktu && (
                      <span className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                        Batas: {new Date(p.batasWaktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 mt-0.5">{p.judul}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{p.isi}</p>
                  <p className="text-xs text-gray-400 mt-1.5">Dari: <span className="font-medium text-gray-500">{p.pengirim}</span></p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => mulaiEdit(p)} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded font-medium">Edit</button>
                  <button onClick={() => hapus(p)} className="text-xs bg-red-50 text-red-500 hover:bg-red-100 px-2.5 py-1.5 rounded font-medium">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
