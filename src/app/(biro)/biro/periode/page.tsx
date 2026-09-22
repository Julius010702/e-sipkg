'use client'

import { useState, useEffect } from 'react'

interface Periode { id: string; nama: string; tahunAjaran: string; semester: number; tanggalMulai: string; tanggalAkhir: string; isAktif: boolean }

const empty = { nama: '', tahunAjaran: '2024/2025', semester: 1, tanggalMulai: '', tanggalAkhir: '', isAktif: false }

export default function BiroPeriodePage() {
  const [list, setList] = useState<Periode[]>([])
  const [form, setForm] = useState(empty)
  const [msg, setMsg]   = useState({ type: '', text: '' })

  function load() { fetch('/api/periode').then(r => r.json()).then(d => setList(d.data || [])) }
  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setMsg({ type: '', text: '' })
    const res = await fetch('/api/periode', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, semester: +form.semester }),
    })
    const data = await res.json()
    if (!res.ok) { setMsg({ type: 'error', text: data.error }); return }
    setMsg({ type: 'success', text: 'Periode ditambahkan!' }); setForm(empty); load()
  }

  async function toggleAktif(id: string) {
    await fetch(`/api/periode/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAktif: true }) })
    load()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Periode Laporan</h2>
        <p className="text-sm text-gray-500 mt-0.5">Kelola periode pengisian data ANJAB & ABK</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-800">Tambah Periode</h3>
          </div>
          <div className="p-5">
            {msg.text && (
              <div className={`text-sm rounded-lg px-3 py-2 mb-3 border ${msg.type==='success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{msg.text}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Periode <span className="text-red-500">*</span></label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.nama} onChange={e => setForm(f => ({...f, nama: e.target.value}))} placeholder="Semester Ganjil 2024/2025" required/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tahun Ajaran</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={form.tahunAjaran} onChange={e => setForm(f => ({...f, tahunAjaran: e.target.value}))} placeholder="2024/2025" required/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Semester</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={form.semester} onChange={e => setForm(f => ({...f, semester: +e.target.value}))}>
                    <option value={1}>Ganjil (1)</option>
                    <option value={2}>Genap (2)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Mulai</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={form.tanggalMulai} onChange={e => setForm(f => ({...f, tanggalMulai: e.target.value}))} required/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Akhir</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={form.tanggalAkhir} onChange={e => setForm(f => ({...f, tanggalAkhir: e.target.value}))} required/>
                </div>
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-indigo-900 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 transition-colors">
                Tambahkan
              </button>
            </form>
          </div>
        </div>

        {/* Daftar */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-800">Daftar Periode ({list.length})</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {list.map(p => (
              <div key={p.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{p.nama}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.tanggalMulai).toLocaleDateString('id-ID')} – {new Date(p.tanggalAkhir).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {p.isAktif
                      ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">Aktif</span>
                      : <button onClick={() => toggleAktif(p.id)} className="text-xs bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 px-2.5 py-1 rounded-full transition-colors">Aktifkan</button>
                    }
                  </div>
                </div>
              </div>
            ))}
            {list.length === 0 && <p className="p-5 text-sm text-gray-400 text-center">Belum ada periode</p>}
          </div>
        </div>
      </div>
    </div>
  )
}