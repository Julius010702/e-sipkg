'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

const JENJANG_JABATAN = [
  { value: 'AHLI_PERTAMA', label: 'Ahli Pertama', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { value: 'AHLI_MUDA',    label: 'Ahli Muda',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'AHLI_MADYA',   label: 'Ahli Madya',   color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'AHLI_UTAMA',   label: 'Ahli Utama',   color: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const

interface GuruRow {
  id: string
  namaJabatan: string
  jenjangJabatan: string
  isBK: boolean
  jumlahGuruPNS: number
  jumlahGuruPPPK: number
  jamMengajarPerMinggu: number
  jumlahRombel: number
  kebutuhanGuru: number
}

type JenjangKey = typeof JENJANG_JABATAN[number]['value']

interface GuruGroup {
  namaJabatan: string
  isBK: boolean
  jamMengajarPerMinggu: number
  jumlahRombel: number
  pnsByJenjang: Partial<Record<JenjangKey, number>>
  totalPNS: number
  totalPPPK: number
  totalASN: number
  kebutuhanGuru: number
}

// Kelompokkan baris per jenjang menjadi satu baris per NAMA JABATAN —
// selaras dengan halaman "Data Guru": kebutuhan (jam × rombel / 24, atau
// siswa / 150 untuk BK) dihitung SEKALI per jabatan, jenjang cuma jadi
// rincian jumlah PNS di dalamnya. Kalau ada data lama dengan jam/rombel
// berbeda per jenjang untuk jabatan yang sama, kebutuhannya tetap
// dijumlahkan per kombinasi unik supaya tidak hilang.
function groupGuruJabatan(rows: GuruRow[]): GuruGroup[] {
  const map = new Map<string, GuruGroup>()
  const loadMapByGroup = new Map<string, Map<string, number>>()

  for (const g of rows) {
    let grp = map.get(g.namaJabatan)
    if (!grp) {
      grp = {
        namaJabatan: g.namaJabatan,
        isBK: g.isBK,
        jamMengajarPerMinggu: g.jamMengajarPerMinggu,
        jumlahRombel: g.jumlahRombel,
        pnsByJenjang: {},
        totalPNS: 0,
        totalPPPK: 0,
        totalASN: 0,
        kebutuhanGuru: 0,
      }
      map.set(g.namaJabatan, grp)
      loadMapByGroup.set(g.namaJabatan, new Map())
    }
    const jenjang = g.jenjangJabatan as JenjangKey
    grp.pnsByJenjang[jenjang] = (grp.pnsByJenjang[jenjang] || 0) + g.jumlahGuruPNS
    grp.totalPNS     += g.jumlahGuruPNS
    grp.totalPPPK    += g.jumlahGuruPPPK

    const loadKey = `${g.isBK}-${g.jamMengajarPerMinggu}-${g.jumlahRombel}`
    const lm = loadMapByGroup.get(g.namaJabatan)!
    if (!lm.has(loadKey)) lm.set(loadKey, g.kebutuhanGuru)
  }

  return Array.from(map.values()).map(grp => {
    const lm = loadMapByGroup.get(grp.namaJabatan)!
    const kebutuhanGuru = Array.from(lm.values()).reduce((s, v) => s + v, 0)
    return { ...grp, totalASN: grp.totalPNS + grp.totalPPPK, kebutuhanGuru }
  })
}

interface SekolahData {
  nama: string
  jenisSekolah: string
  npsn?: string
  jumlahSiswa: number
  jumlahRombel: number
  statusData: string
  kepalaSekolah?: string
  nipKepala?: string
  wilayah: { nama: string }
  guruJabatan: GuruRow[]
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  DRAFT:     { label: 'Draft',     cls: 'bg-gray-100 text-gray-700 border-gray-200' },
  DIKIRIM:   { label: 'Dikirim',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  DISETUJUI: { label: 'Disetujui', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DITOLAK:   { label: 'Ditolak',   cls: 'bg-red-50 text-red-700 border-red-200' },
}

/* ─── Kop Surat Sekolah (Tut Wuri Handayani) ─────────────── */
function KopTutWuri({ data }: { data: SekolahData }) {
  return (
    <div className="pb-4 border-b-4 border-double border-gray-800 mb-5 print-kop">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            src="/logo-sekolah.png"
            alt="Logo Tut Wuri Handayani"
            width={80}
            height={80}
            className="object-contain"
            priority
            onError={(e) => {
              // Fallback jika logo tidak ada
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
        <div className="flex-1 text-center border-l border-gray-300 pl-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            Pemerintah Provinsi Nusa Tenggara Timur
          </p>
          <p className="text-[10px] text-gray-500">Biro Organisasi — Bagian Kelembagaan dan Analisis Jabatan</p>
          <p className="text-xl font-extrabold uppercase text-gray-900 leading-tight mt-1">
            {data.nama}
          </p>
          <p className="text-sm font-medium text-gray-600 mt-0.5">
            {data.jenisSekolah} — {data.wilayah?.nama}
            {data.npsn ? ` · NPSN: ${data.npsn}` : ''}
          </p>
          <p className="text-xs text-gray-400">Provinsi Nusa Tenggara Timur</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Judul Laporan ──────────────────────────────────────── */
function Judul({ tanggal, data }: { tanggal: string; data: SekolahData }) {
  return (
    <div className="text-center mb-5">
      <p className="text-sm font-bold uppercase tracking-wide underline">
        Laporan Kebutuhan Guru (ANJAB &amp; ABK)
      </p>
      <p className="text-xs font-semibold mt-1">
        {data.nama} — {data.jenisSekolah}, {data.wilayah?.nama}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Tahun Pelajaran 2024/2025 &nbsp;|&nbsp; Dicetak: {tanggal}
      </p>
    </div>
  )
}

/* ─── Keterangan Rumus ───────────────────────────────────── */
function Keterangan() {
  return (
    <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-xs">
      <p className="font-bold mb-1.5">Keterangan:</p>
      <p className="mb-1">
        <span className="font-semibold">Guru Mapel:</span>
        <code className="ml-1 bg-gray-100 px-1 rounded">(Jam × Rombel) / 24</code>
      </p>
      <p className="mb-1.5">
        <span className="font-semibold">Guru BK:</span>
        <code className="ml-1 bg-gray-100 px-1 rounded">Siswa / 150</code>
      </p>
      <p>• <span className="text-red-600 font-semibold">Kurang</span>: Kebutuhan &gt; Total ASN</p>
      <p>• <span className="text-emerald-700 font-semibold">Lebih</span>: Total ASN &gt; Kebutuhan</p>
    </div>
  )
}

/* ─── TTD Kepala Sekolah ──────────────────────────────────── */
function TtdSekolah({ data, tanggal }: { data: SekolahData; tanggal: string }) {
  return (
    <div className="text-center text-xs">
      <p className="text-gray-700">{data.wilayah?.nama}, {tanggal}</p>
      <p className="font-bold mt-1 text-sm">Kepala Sekolah</p>
      <p className="text-gray-500">{data.nama}</p>
      <div className="h-20 w-52 mt-3 mx-auto" />
      <p className="font-bold border-t border-gray-700 pt-1 w-52 mx-auto">
        {data.kepalaSekolah || '........................................'}
      </p>
      <p className="text-gray-500 mt-0.5">
        NIP. {data.nipKepala || '.......................................'}
      </p>
    </div>
  )
}

/* ─── Isi laporan cetak lengkap (dipakai untuk preview di tab Cetak DAN
   untuk konten yang benar-benar dicetak lewat portal) ──────────────── */
function PrintableReport({
  data, tanggal, groupedJabatan, totalPNS, totalPPPK, totalASN, totalKebutuhan, selisih,
}: {
  data: SekolahData
  tanggal: string
  groupedJabatan: GuruGroup[]
  totalPNS: number
  totalPPPK: number
  totalASN: number
  totalKebutuhan: number
  selisih: number
}) {
  return (
    <>
      {/* Kop Tut Wuri */}
      <KopTutWuri data={data} />

      {/* Judul */}
      <Judul tanggal={tanggal} data={data} />

      {/* A. Ringkasan ANJAB ABK */}
      <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide border-b border-gray-200 pb-1">
        A. Ringkasan ANJAB &amp; ABK
      </p>
      <div className="overflow-x-auto mb-5">
        <table className="w-full border-collapse text-xs" style={{ borderCollapse: 'collapse', minWidth: 500 }}>
          <thead>
            <tr className="bg-gray-800 text-white">
              <th rowSpan={2} className="border-2 border-gray-600 px-2 py-2 text-center font-bold w-8">No</th>
              <th rowSpan={2} className="border-2 border-gray-600 px-2 py-2 text-left font-bold">Nama Sekolah</th>
              <th rowSpan={2} className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Kebutuhan Guru</th>
              <th colSpan={2} className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Bezeting ASN</th>
              <th rowSpan={2} className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Total ASN</th>
              <th colSpan={2} className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Kebutuhan</th>
            </tr>
            <tr className="bg-gray-700 text-white">
              <th className="border-2 border-gray-600 px-2 py-1.5 text-center font-bold">PNS</th>
              <th className="border-2 border-gray-600 px-2 py-1.5 text-center font-bold">PPPK</th>
              <th className="border-2 border-gray-600 px-2 py-1.5 text-center font-bold">Kurang</th>
              <th className="border-2 border-gray-600 px-2 py-1.5 text-center font-bold">Lebih</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-gray-300 px-2 py-1.5 text-center">1</td>
              <td className="border border-gray-300 px-2 py-1.5 font-medium">{data.nama}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">{totalKebutuhan}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center">{totalPNS}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center">{totalPPPK}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">{totalASN}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-red-600">
                {selisih < 0 ? Math.abs(selisih) : ''}
              </td>
              <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-emerald-700">
                {selisih > 0 ? selisih : ''}
              </td>
            </tr>
            {/* Total row */}
            <tr className="bg-blue-900 text-white font-bold">
              <td className="border-2 border-gray-600 px-2 py-2 text-center font-bold" colSpan={2}>
                TOTAL KESELURUHAN
              </td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalKebutuhan}</td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalPNS}</td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalPPPK}</td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalASN}</td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center text-red-300">
                {selisih < 0 ? Math.abs(selisih) : ''}
              </td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center text-emerald-300">
                {selisih > 0 ? selisih : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* B. Detail per Jabatan / Mata Pelajaran */}
      <p className="text-xs font-bold text-gray-700 mb-2 mt-4 uppercase tracking-wide border-b border-gray-200 pb-1">
        B. Detail per Jabatan / Mata Pelajaran
      </p>
      <div className="overflow-x-auto mb-5">
        <table className="w-full border-collapse text-xs" style={{ borderCollapse: 'collapse', minWidth: 420 }}>
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">No</th>
              <th className="border-2 border-gray-600 px-2 py-2 text-left font-bold">Jabatan / Mapel</th>
              <th className="border-2 border-gray-600 px-1.5 py-2 text-center font-bold">Ahli<br/>Pertama</th>
              <th className="border-2 border-gray-600 px-1.5 py-2 text-center font-bold">Ahli<br/>Muda</th>
              <th className="border-2 border-gray-600 px-1.5 py-2 text-center font-bold">Ahli<br/>Madya</th>
              <th className="border-2 border-gray-600 px-1.5 py-2 text-center font-bold">Ahli<br/>Utama</th>
              <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Kebutuhan</th>
              <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">PNS</th>
              <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">PPPK</th>
              <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Total ASN</th>
              <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Kurang</th>
              <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Lebih</th>
            </tr>
          </thead>
          <tbody>
            {groupedJabatan.map((g, i) => {
              const keb   = Math.round(g.kebutuhanGuru)
              const sel   = g.totalASN - keb
              return (
                <tr key={g.namaJabatan} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-2 py-1.5 text-center">{i + 1}</td>
                  <td className="border border-gray-300 px-2 py-1.5 font-medium">
                    {g.namaJabatan}
                    {g.isBK && <span className="ml-1 text-blue-500 text-xs">(BK)</span>}
                  </td>
                  <td className="border border-gray-300 px-1.5 py-1.5 text-center">{g.pnsByJenjang.AHLI_PERTAMA || ''}</td>
                  <td className="border border-gray-300 px-1.5 py-1.5 text-center">{g.pnsByJenjang.AHLI_MUDA || ''}</td>
                  <td className="border border-gray-300 px-1.5 py-1.5 text-center">{g.pnsByJenjang.AHLI_MADYA || ''}</td>
                  <td className="border border-gray-300 px-1.5 py-1.5 text-center">{g.pnsByJenjang.AHLI_UTAMA || ''}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">{keb}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center">{g.totalPNS}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center">{g.totalPPPK}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">{g.totalASN}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-red-600">
                    {sel < 0 ? Math.abs(sel) : ''}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-emerald-700">
                    {sel > 0 ? sel : ''}
                  </td>
                </tr>
              )
            })}
            {/* Total row */}
            <tr className="bg-blue-900 text-white font-bold">
              <td className="border-2 border-gray-600 px-2 py-2 text-center" colSpan={6}>TOTAL</td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalKebutuhan}</td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalPNS}</td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalPPPK}</td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalASN}</td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center text-red-300">
                {selisih < 0 ? Math.abs(selisih) : ''}
              </td>
              <td className="border-2 border-gray-600 px-2 py-2 text-center text-emerald-300">
                {selisih > 0 ? selisih : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer: Keterangan + TTD */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mt-5">
        <Keterangan />
        <TtdSekolah data={data} tanggal={tanggal} />
      </div>
    </>
  )
}

export default function LaporanPage() {
  const [data, setData]     = useState<SekolahData | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState<'preview' | 'cetak'>('preview')
  const [pendingPrint, setPendingPrint] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [tanggal] = useState(() =>
    new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  )

  useEffect(() => { setMounted(true) }, [])

  function loadData() {
    fetch('/api/sekolah/me?include=guruJabatan')
      .then(r => r.json())
      .then(d => setData(d.data))
  }
  useEffect(() => { loadData() }, [])

  // Cetak dari tombol cepat di Preview: pindah ke tab Cetak dulu, lalu panggil
  // window.print() SETELAH tab itu benar-benar selesai dirender (bukan
  // menebak-nebak pakai setTimeout tetap).
  useEffect(() => {
    if (!pendingPrint) return
    const raf = requestAnimationFrame(() => {
      window.print()
      setPendingPrint(false)
    })
    return () => cancelAnimationFrame(raf)
  }, [pendingPrint])

  function cetakDariPreview() {
    setActiveTab('cetak')
    setPendingPrint(true)
  }

  async function kirimData() {
    if (!confirm('Kirim data ke Biro? Pastikan semua data sudah benar.')) return
    setLoading(true)
    setMsg({ type: '', text: '' })
    try {
      const res = await fetch('/api/sekolah/me/kirim', { method: 'POST' })
      const d   = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: d.error }); return }
      setMsg({ type: 'success', text: 'Data berhasil dikirim ke Biro!' })
      loadData()
    } catch {
      setMsg({ type: 'error', text: 'Terjadi kesalahan' })
    } finally {
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-48">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Memuat data...
        </div>
      </div>
    )
  }

  const groupedJabatan = groupGuruJabatan(data.guruJabatan)
  const totalPNS       = data.guruJabatan.reduce((s, g) => s + g.jumlahGuruPNS, 0)
  const totalPPPK      = data.guruJabatan.reduce((s, g) => s + g.jumlahGuruPPPK, 0)
  const totalASN       = totalPNS + totalPPPK
  const totalKebutuhan = groupedJabatan.reduce((s, g) => s + Math.round(g.kebutuhanGuru), 0)
  const selisih        = totalASN - totalKebutuhan
  const status         = STATUS_CONFIG[data.statusData] ?? STATUS_CONFIG.DRAFT

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media screen {
          #print-portal-root { display: none; }
        }
        @media print {
          body * { visibility: hidden; }
          #print-portal-root, #print-portal-root * { visibility: visible; }
          #print-portal-root {
            display: block !important;
            position: absolute;
            top: 0; left: 0;
            width: 100%;
          }
          #print-area-sekolah {
            padding: 1cm 1.5cm;
            background: white;
          }
          @page { size: A4 landscape; margin: 0; }
          table { font-size: 7.5pt !important; }
          th, td { padding: 2px 3px !important; }
          .print-kop { margin-bottom: 12px !important; }
        }
      `}</style>

      <div className="space-y-5">

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 no-print">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Preview Laporan &amp; Kirim Data</h2>
            <p className="text-sm text-gray-500 mt-0.5">Data ANJAB &amp; ABK untuk dikirim ke Biro Kepegawaian</p>
          </div>
          {/* Tombol cetak cepat */}
          <button
            onClick={cetakDariPreview}
            disabled={data.guruJabatan.length === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Cetak Laporan
          </button>
        </div>

        {/* Alert */}
        {msg.text && (
          <div className={`no-print rounded-xl px-4 py-3 text-sm border flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={msg.type === 'success'
                  ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
            </svg>
            {msg.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="no-print flex gap-1 border-b border-gray-200">
          {(['preview', 'cetak'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
                activeTab === tab
                  ? 'border-blue-700 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'preview' ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Preview Data
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  Cetak Laporan
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════ TAB: PREVIEW ══════════════ */}
        {activeTab === 'preview' && (
          <>
            {/* Info Sekolah */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-gray-900 text-base">{data.nama}</h3>
                  <p className="text-sm text-gray-500">
                    {data.jenisSekolah} · {data.wilayah?.nama}
                    {data.npsn ? ` · NPSN: ${data.npsn}` : ''}
                  </p>
                  {data.kepalaSekolah && (
                    <p className="text-sm text-gray-600">
                      Kepala Sekolah: <span className="font-medium">{data.kepalaSekolah}</span>
                      {data.nipKepala && <span className="text-gray-400 ml-2 text-xs">NIP. {data.nipKepala}</span>}
                    </p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${status.cls}`}>
                  {status.label}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-gray-100">
                {[
                  { label: 'Jumlah Siswa',    value: data.jumlahSiswa },
                  { label: 'Jumlah Rombel',   value: data.jumlahRombel },
                  { label: 'Jabatan Diinput', value: data.guruJabatan.length },
                ].map(({ label, value }, i) => (
                  <div key={label} className={`px-5 py-3 ${i < 2 ? 'border-r border-gray-100' : ''}`}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-xl font-bold tabular-nums text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabel ANJAB Format Resmi */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-blue-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Format ANJAB &amp; ABK</h3>
                <span className="text-xs text-blue-200">seperti yang diterima Biro</span>
              </div>
              <div className="p-5 overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <Th rowSpan={2}>No</Th>
                      <Th rowSpan={2} left>Nama Sekolah</Th>
                      <Th rowSpan={2}>Kebutuhan Guru</Th>
                      <Th colSpan={2}>Bezeting ASN</Th>
                      <Th rowSpan={2}>Total ASN</Th>
                      <Th colSpan={2}>Kebutuhan</Th>
                    </tr>
                    <tr>
                      <Th>PNS</Th>
                      <Th>PPPK</Th>
                      <Th>Kurang</Th>
                      <Th>Lebih</Th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <Td>1</Td>
                      <Td left>{data.nama}</Td>
                      <Td bold>{totalKebutuhan}</Td>
                      <Td>{totalPNS}</Td>
                      <Td>{totalPPPK}</Td>
                      <Td bold>{totalASN}</Td>
                      <Td red>{selisih < 0 ? Math.abs(selisih) : ''}</Td>
                      <Td green>{selisih > 0 ? selisih : ''}</Td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail per Jabatan */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
                <h3 className="text-sm font-semibold text-gray-800">Detail per Jabatan beserta Rumus Perhitungan</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Mapel: (Jam Mengajar × Rombel) / 24 &nbsp;·&nbsp; BK: Jumlah Siswa / 150
                </p>
              </div>
              <div className="overflow-auto max-h-[420px]">
                <table className="w-full border-collapse text-xs">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr>
                      <Th>No</Th>
                      <Th left>Nama Jabatan Guru</Th>
                      <Th>Ahli Pertama</Th>
                      <Th>Ahli Muda</Th>
                      <Th>Ahli Madya</Th>
                      <Th>Ahli Utama</Th>
                      <Th>Rumus</Th>
                      <Th>Kebutuhan</Th>
                      <Th>PNS</Th>
                      <Th>PPPK</Th>
                      <Th>Total ASN</Th>
                      <Th>Kurang</Th>
                      <Th>Lebih</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedJabatan.map((g, i) => {
                      const keb          = Math.round(g.kebutuhanGuru)
                      const selisihBaris = g.totalASN - keb
                      const rumus        = g.isBK
                        ? `${data.jumlahSiswa} / 150 = ${keb}`
                        : `(${g.jamMengajarPerMinggu} × ${g.jumlahRombel}) / 24 = ${keb}`
                      return (
                        <tr key={g.namaJabatan} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                          <Td>{i + 1}</Td>
                          <Td left>
                            <span className="font-medium">{g.namaJabatan}</span>
                            {g.isBK && (
                              <span className="ml-1.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600 font-medium border border-blue-100">
                                BK
                              </span>
                            )}
                          </Td>
                          <Td>
                            {g.pnsByJenjang.AHLI_PERTAMA || ''}
                          </Td>
                          <Td>
                            {g.pnsByJenjang.AHLI_MUDA || ''}
                          </Td>
                          <Td>
                            {g.pnsByJenjang.AHLI_MADYA || ''}
                          </Td>
                          <Td>
                            {g.pnsByJenjang.AHLI_UTAMA || ''}
                          </Td>
                          <Td>
                            <code className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {rumus}
                            </code>
                          </Td>
                          <Td bold>{keb}</Td>
                          <Td>{g.totalPNS}</Td>
                          <Td>{g.totalPPPK}</Td>
                          <Td bold>{g.totalASN}</Td>
                          <Td red>{selisihBaris < 0 ? Math.abs(selisihBaris) : ''}</Td>
                          <Td green>{selisihBaris > 0 ? selisihBaris : ''}</Td>
                        </tr>
                      )
                    })}
                    <tr className="border-t-2 border-gray-300 bg-blue-800/5 font-semibold">
                      <td colSpan={7} className="border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700">
                        Total
                      </td>
                      <Td bold>{totalKebutuhan}</Td>
                      <Td bold>{totalPNS}</Td>
                      <Td bold>{totalPPPK}</Td>
                      <Td bold>{totalASN}</Td>
                      <Td red>{selisih < 0 ? Math.abs(selisih) : ''}</Td>
                      <Td green>{selisih > 0 ? selisih : ''}</Td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/70 flex flex-wrap gap-4 text-xs text-gray-500">
                <span>
                  <strong className="text-gray-700">Guru Mapel:</strong>
                  <code className="ml-1 bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono text-[11px]">
                    (Jam Mengajar × Jumlah Rombel) / 24
                  </code>
                </span>
                <span>
                  <strong className="text-gray-700">Guru BK:</strong>
                  <code className="ml-1 bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono text-[11px]">
                    Jumlah Siswa / 150
                  </code>
                </span>
              </div>
            </div>

            {/* ── Status Actions ── */}
            {data.statusData === 'DRAFT' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 text-sm">Kirim Data ke Biro</h3>
                    <p className="text-xs text-amber-600 mt-0.5 mb-3">
                      Setelah dikirim, data tidak dapat diubah tanpa persetujuan Biro Kepegawaian.
                    </p>
                    <button
                      onClick={kirimData}
                      disabled={loading || data.guruJabatan.length === 0}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {loading ? 'Mengirim...' : 'Kirim Data ke Biro'}
                    </button>
                    {data.guruJabatan.length === 0 && (
                      <p className="text-xs text-red-500 mt-2">Isi data guru terlebih dahulu sebelum mengirim.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {data.statusData === 'DIKIRIM' && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-blue-700 font-medium text-sm">Data telah dikirim dan menunggu validasi dari Biro.</p>
              </div>
            )}

            {data.statusData === 'DISETUJUI' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-emerald-700 font-medium text-sm">Data telah disetujui oleh Biro Kepegawaian.</p>
              </div>
            )}

            {data.statusData === 'DITOLAK' && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-red-700 font-semibold text-sm">Data ditolak. Silakan perbaiki dan kirim ulang.</p>
                    <button
                      onClick={kirimData}
                      disabled={loading}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                    >
                      Kirim Ulang
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════ TAB: CETAK ══════════════ */}
        {activeTab === 'cetak' && (
          <>
            {/* Panel kontrol cetak */}
            <div className="no-print rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Siap Cetak</p>
                  <p className="text-xs text-gray-400">
                    Format A4 Landscape · Kop Tut Wuri Handayani · TTD Kepala Sekolah
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                disabled={data.guruJabatan.length === 0}
                className="flex items-center gap-2 rounded-lg bg-blue-800 hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                🖨️ Cetak Sekarang
              </button>
            </div>

            {/* ── AREA PRINT SEKOLAH (preview di layar) ── */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
              <PrintableReport
                data={data}
                tanggal={tanggal}
                groupedJabatan={groupedJabatan}
                totalPNS={totalPNS}
                totalPPPK={totalPPPK}
                totalASN={totalASN}
                totalKebutuhan={totalKebutuhan}
                selisih={selisih}
              />
            </div>
          </>
        )}

      </div>

      {/* ── Konten yang BENAR-BENAR dicetak, dipindah langsung ke <body>
          lewat portal supaya lepas total dari layout sidebar (overflow-hidden,
          flex, dll) yang bisa mengganggu proses cetak browser. ── */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div id="print-portal-root">
          <div id="print-area-sekolah">
            <PrintableReport
              data={data}
              tanggal={tanggal}
              groupedJabatan={groupedJabatan}
              totalPNS={totalPNS}
              totalPPPK={totalPPPK}
              totalASN={totalASN}
              totalKebutuhan={totalKebutuhan}
              selisih={selisih}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

/* ─── Helper Components ──────────────────────────────── */
function Th({ children, colSpan, rowSpan, left }: {
  children?: React.ReactNode; colSpan?: number; rowSpan?: number; left?: boolean
}) {
  return (
    <th colSpan={colSpan} rowSpan={rowSpan}
      className={`border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 ${left ? 'text-left' : 'text-center'}`}
    >{children}</th>
  )
}

function Td({ children, left, bold, red, green }: {
  children?: React.ReactNode; left?: boolean; bold?: boolean; red?: boolean; green?: boolean
}) {
  return (
    <td className={[
      'border border-gray-200 px-3 py-2.5 text-xs',
      left  ? 'text-left'   : 'text-center',
      bold  ? 'font-semibold text-gray-800' : 'text-gray-600',
      red   ? 'font-semibold text-red-600'     : '',
      green ? 'font-semibold text-emerald-600' : '',
    ].join(' ')}>{children}</td>
  )
}