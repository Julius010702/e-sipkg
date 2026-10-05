'use client'

import { useState, useEffect } from 'react'

const JENJANG_JABATAN = [
  { value: 'AHLI_PERTAMA', label: 'Ahli Pertama', color: 'bg-sky-50 text-sky-700' },
  { value: 'AHLI_MUDA',    label: 'Ahli Muda',    color: 'bg-indigo-50 text-indigo-700' },
  { value: 'AHLI_MADYA',   label: 'Ahli Madya',   color: 'bg-violet-50 text-violet-700' },
  { value: 'AHLI_UTAMA',   label: 'Ahli Utama',   color: 'bg-purple-50 text-purple-700' },
] as const

interface JabatanRekap {
  namaJabatan: string; jenjangJabatan: string; isBK: boolean
  jumlahSekolah: number; totalKebutuhan: number; totalPNS: number
  totalPPPK: number; totalASN: number; totalSelisih: number
}

interface SekolahDetail {
  sekolahId: string; namaSekolah: string; wilayah: string
  jenjangJabatan: string; jumlahGuruPNS: number; jumlahGuruPPPK: number
  kebutuhanGuru: number; selisih: number
}

export default function BiroJabatanPage() {
  const [rekapList, setRekapList]         = useState<JabatanRekap[]>([])
  const [detailList, setDetailList]       = useState<SekolahDetail[]>([])
  const [selectedMapel, setSelectedMapel] = useState<string | null>(null)
  const [loading, setLoading]             = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError]     = useState('')
  const [filterJenjang, setFilterJenjang] = useState('')
  const [searchText, setSearchText]       = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/jabatan/rekap')
      .then(r => r.json())
      .then(d => { setRekapList(Array.isArray(d.data) ? d.data : []); setLoading(false) })
      .catch(() => { setRekapList([]); setLoading(false) })
  }, [])

  function openDetail(namaJabatan: string) {
    setSelectedMapel(namaJabatan); setDetailList([]); setDetailError(''); setDetailLoading(true)
    fetch(`/api/jabatan/rekap/detail?namaJabatan=${encodeURIComponent(namaJabatan)}`, { credentials: 'same-origin' })
      .then(async r => {
        const d = await r.json().catch(() => null)
        if (!r.ok) { throw new Error(d?.error || `Gagal memuat detail (${r.status})`) }
        setDetailList(Array.isArray(d?.data) ? d.data : [])
      })
      .catch((e: Error) => { setDetailList([]); setDetailError(e.message || 'Terjadi kesalahan saat memuat detail') })
      .finally(() => setDetailLoading(false))
  }

  const labelJenjang = (val: string) => JENJANG_JABATAN.find(j => j.value === val)?.label ?? val
  const colorJenjang = (val: string) => JENJANG_JABATAN.find(j => j.value === val)?.color ?? 'bg-gray-100 text-gray-600'

  const filtered = rekapList.filter(r => {
    const matchSearch  = r.namaJabatan.toLowerCase().includes(searchText.toLowerCase())
    const matchJenjang = filterJenjang ? r.jenjangJabatan === filterJenjang : true
    return matchSearch && matchJenjang
  })

  const grandTotal = {
    kebutuhan: filtered.reduce((s,r) => s+r.totalKebutuhan, 0),
    pns:       filtered.reduce((s,r) => s+r.totalPNS, 0),
    pppk:      filtered.reduce((s,r) => s+r.totalPPPK, 0),
    asn:       filtered.reduce((s,r) => s+r.totalASN, 0),
    kurang:    filtered.reduce((s,r) => s+(r.totalSelisih<0?Math.abs(r.totalSelisih):0), 0),
    lebih:     filtered.reduce((s,r) => s+(r.totalSelisih>0?r.totalSelisih:0), 0),
  }

  const jenjangSummary = JENJANG_JABATAN.map(j => ({
    ...j,
    count:     rekapList.filter(r => r.jenjangJabatan === j.value).length,
    kebutuhan: rekapList.filter(r => r.jenjangJabatan === j.value).reduce((s,r) => s+r.totalKebutuhan, 0),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Rekap Jabatan Guru</h2>
        <p className="text-sm text-gray-500">Data jabatan yang dikirimkan sekolah, dikelompokkan per mata pelajaran dan jenjang fungsional.</p>
      </div>

      {/* Jenjang Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 sm:grid-cols-4 gap-3">
        {jenjangSummary.map(j => (
          <button key={j.value} onClick={() => setFilterJenjang(prev => prev===j.value?'':j.value)}
            className={`rounded-xl border-2 bg-white shadow-sm p-4 text-left transition-all ${filterJenjang===j.value ? 'border-indigo-400 shadow-md' : 'border-transparent hover:border-gray-200'}`}>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${j.color}`}>{j.label}</span>
            <p className="mt-2 text-2xl font-bold text-gray-800">{j.kebutuhan}</p>
            <p className="text-xs text-gray-400">{j.count} jabatan · total kebutuhan</p>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Cari nama jabatan / mata pelajaran…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1"
          value={searchText} onChange={e => setSearchText(e.target.value)}/>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:w-48"
          value={filterJenjang} onChange={e => setFilterJenjang(e.target.value)}>
          <option value="">Semua Jenjang</option>
          {JENJANG_JABATAN.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
        </select>
        {(searchText || filterJenjang) && (
          <button onClick={() => { setSearchText(''); setFilterJenjang('') }}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
            Reset Filter
          </button>
        )}
      </div>

      {/* Tabel */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-indigo-900">
          <h3 className="font-semibold text-white">Rekap Kebutuhan per Mata Pelajaran / Jabatan</h3>
          <p className="text-xs text-indigo-300 mt-0.5">{loading ? 'Memuat…' : `${filtered.length} jabatan`}</p>
        </div>
        {loading ? (
          <div className="py-16 text-center text-gray-400">Memuat data…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Tidak ada data yang cocok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm" style={{ borderCollapse:'collapse' }}>
              <thead>
                <tr className="bg-gray-100">
                  {['No','Jabatan / Mapel','Jenjang','Sekolah','Kebutuhan','PNS','PPPK','Total ASN','Kurang','Lebih','Detail'].map(h => (
                    <th key={h} className="border border-gray-300 px-3 py-2 text-center font-bold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r,i) => (
                  <tr key={`${r.namaJabatan}-${r.jenjangJabatan}-${i}`} className={i%2===0?'bg-white hover:bg-gray-50':'bg-gray-50 hover:bg-gray-100'}>
                    <td className="border border-gray-200 px-3 py-2.5 text-center text-xs">{i+1}</td>
                    <td className="border border-gray-200 px-3 py-2.5 font-medium text-sm">
                      {r.namaJabatan}{r.isBK&&<span className="ml-1 text-xs text-blue-500">(BK)</span>}
                    </td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorJenjang(r.jenjangJabatan)}`}>{labelJenjang(r.jenjangJabatan)}</span>
                    </td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center">{r.jumlahSekolah}</td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center font-semibold">{r.totalKebutuhan}</td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center">{r.totalPNS}</td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center">{r.totalPPPK}</td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center font-semibold">{r.totalASN}</td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center font-bold text-red-600">{r.totalSelisih<0?Math.abs(r.totalSelisih):''}</td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center font-bold text-green-600">{r.totalSelisih>0?r.totalSelisih:''}</td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center">
                      <button onClick={() => openDetail(r.namaJabatan)} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">Lihat</button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-indigo-900 text-white font-bold border-t-2 border-gray-400">
                  <td className="border border-gray-500 px-3 py-2.5 text-center" colSpan={4}>TOTAL</td>
                  <td className="border border-gray-500 px-3 py-2.5 text-center">{grandTotal.kebutuhan}</td>
                  <td className="border border-gray-500 px-3 py-2.5 text-center">{grandTotal.pns}</td>
                  <td className="border border-gray-500 px-3 py-2.5 text-center">{grandTotal.pppk}</td>
                  <td className="border border-gray-500 px-3 py-2.5 text-center">{grandTotal.asn}</td>
                  <td className="border border-gray-500 px-3 py-2.5 text-center text-red-300">{grandTotal.kurang>0?grandTotal.kurang:''}</td>
                  <td className="border border-gray-500 px-3 py-2.5 text-center text-green-300">{grandTotal.lebih>0?grandTotal.lebih:''}</td>
                  <td className="border border-gray-500"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {selectedMapel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMapel(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-indigo-900 rounded-t-xl">
              <div>
                <h3 className="font-semibold text-white">Detail: {selectedMapel}</h3>
                <p className="text-xs text-indigo-300">Daftar sekolah yang melaporkan jabatan ini</p>
              </div>
              <button onClick={() => setSelectedMapel(null)} className="text-indigo-300 hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="overflow-auto flex-1">
              {detailLoading ? (
                <div className="py-12 text-center text-gray-400">Memuat…</div>
              ) : detailError ? (
                <div className="py-12 text-center">
                  <p className="text-red-500 text-sm font-medium">{detailError}</p>
                  <button
                    onClick={() => selectedMapel && openDetail(selectedMapel)}
                    className="mt-3 text-xs text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : detailList.length === 0 ? (
                <div className="py-12 text-center text-gray-400">Belum ada sekolah yang melaporkan jabatan ini</div>
              ) : (
                <table className="w-full border-collapse text-sm" style={{ borderCollapse:'collapse' }}>
                  <thead className="sticky top-0 bg-gray-100">
                    <tr>
                      {['No','Sekolah','Wilayah','Jenjang','Kebutuhan','PNS','PPPK','Selisih'].map(h => (
                        <th key={h} className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailList.map((d,i) => (
                      <tr key={d.sekolahId+i} className={i%2===0?'bg-white':'bg-gray-50'}>
                        <td className="border border-gray-200 px-3 py-2 text-center text-xs">{i+1}</td>
                        <td className="border border-gray-200 px-3 py-2 font-medium text-sm">{d.namaSekolah}</td>
                        <td className="border border-gray-200 px-3 py-2 text-xs text-gray-500">{d.wilayah}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${colorJenjang(d.jenjangJabatan)}`}>{labelJenjang(d.jenjangJabatan)}</span>
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center font-semibold">{Math.round(d.kebutuhanGuru)}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center">{d.jumlahGuruPNS}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center">{d.jumlahGuruPPPK}</td>
                        <td className={`border border-gray-200 px-3 py-2 text-center font-bold ${d.selisih<0?'text-red-600':d.selisih>0?'text-green-600':'text-gray-400'}`}>
                          {d.selisih<0?`−${Math.abs(d.selisih)}`:d.selisih>0?`+${d.selisih}`:'0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}