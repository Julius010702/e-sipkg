'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'

interface GuruJabatanItem {
  jumlahGuruPNS: number
  jumlahGuruPPPK: number
  kebutuhanGuru: number
  namaJabatan: string
  isBK: boolean
  jenjangJabatan: string
}

interface SekolahData {
  id: string
  nama: string
  jenisSekolah: string
  jumlahSiswa: number
  jumlahRombel: number
  kepalaSekolah: string | null
  nipKepala: string | null
  wilayah: { id: string; nama: string }
  guruJabatan: GuruJabatanItem[]
  kebutuhan: number
  pns: number
  pppk: number
  totalASN: number
  selisih: number
}

interface Props {
  sekolahList: SekolahData[]
  wilayahList: { id: string; nama: string }[]
  tanggal: string
}

type Mode = 'rekap' | 'wilayah' | 'sekolah'

const JENJANG: Record<string, string> = {
  AHLI_PERTAMA: 'Ahli Pertama',
  AHLI_MUDA:    'Ahli Muda',
  AHLI_MADYA:   'Ahli Madya',
  AHLI_UTAMA:   'Ahli Utama',
}

/* ── Kop ─────────────────────────────────────────────────── */
function KopNTT() {
  return (
    <div className="pb-4 border-b-4 border-double border-gray-800 mb-5 print-kop">
      <div className="flex flex-col items-center gap-2">
        <Image src="/logo-ntt.png" alt="Logo NTT" width={72} height={72} className="object-contain"/>
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Pemerintah Provinsi Nusa Tenggara Timur</p>
          <p className="text-xl font-extrabold uppercase tracking-wider text-gray-900 leading-tight">Biro Organisasi</p>
          <p className="text-sm text-gray-700 font-medium mt-0.5">Bagian Kelembagaan dan Analisis Jabatan</p>
          <p className="text-xs text-gray-500 mt-0.5">Jl. El Tari No. 52, Kota Kupang, NTT</p>
          <p className="text-xs text-gray-400">Telp. (0380) 821710 | Email: biroorganisasi@nttprov.go.id</p>
        </div>
      </div>
    </div>
  )
}

function KopTutWuri({ sekolah }: { sekolah: SekolahData }) {
  return (
    <div className="pb-4 border-b-4 border-double border-gray-800 mb-5 print-kop">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Image src="/logo-sekolah.png" alt="Logo Tut Wuri" width={80} height={80} className="object-contain"/>
        </div>
        <div className="flex-1 text-center border-l border-gray-300 pl-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pemerintah Provinsi Nusa Tenggara Timur — Biro Organisasi</p>
          <p className="text-xl font-extrabold uppercase text-gray-900 leading-tight mt-1">{sekolah.nama}</p>
          <p className="text-sm font-medium text-gray-600 mt-0.5">{sekolah.jenisSekolah} — {sekolah.wilayah.nama}</p>
        </div>
      </div>
    </div>
  )
}

function Judul({ title, sub, tanggal, jabatan }: { title: string; sub: string; tanggal: string; jabatan?: string }) {
  return (
    <div className="text-center mb-5">
      <p className="text-sm font-bold uppercase tracking-wide underline">{title}</p>
      <p className="text-xs font-semibold mt-1">{sub}</p>
      {jabatan && <p className="text-xs font-semibold text-indigo-700 mt-0.5">Jabatan / Mapel: {jabatan}</p>}
      <p className="text-xs text-gray-500 mt-1">Tahun Pelajaran 2024/2025 &nbsp;|&nbsp; Dicetak: {tanggal}</p>
    </div>
  )
}

interface RowAnjab {
  id: string; nama: string; jenisSekolah?: string; wilayah?: string
  kebutuhan: number; pns: number; pppk: number; totalASN: number; selisih: number
}

function TabelAnjab({ rows }: { rows: RowAnjab[] }) {
  const withJenis   = rows.some(r => r.jenisSekolah)
  const withWilayah = rows.some(r => r.wilayah)
  const colSpanTotal = 2 + (withJenis?1:0) + (withWilayah?1:0)
  const totalKeb = rows.reduce((s,r)=>s+r.kebutuhan,0)
  const totalPNS = rows.reduce((s,r)=>s+r.pns,0)
  const totalPPK = rows.reduce((s,r)=>s+r.pppk,0)
  const totalASN = rows.reduce((s,r)=>s+r.totalASN,0)
  const totalKur = rows.reduce((s,r)=>s+(r.selisih<0?Math.abs(r.selisih):0),0)
  const totalLeb = rows.reduce((s,r)=>s+(r.selisih>0?r.selisih:0),0)
  return (
    <div className="overflow-x-auto mb-5">
      <table className="w-full border-collapse text-xs" style={{borderCollapse:'collapse',minWidth:500}}>
        <thead>
          <tr className="bg-gray-800 text-white">
            <th rowSpan={2} className="border-2 border-gray-600 px-2 py-2 text-center font-bold w-8">No</th>
            <th rowSpan={2} className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Nama Sekolah</th>
            {withJenis   && <th rowSpan={2} className="border-2 border-gray-600 px-2 py-2 text-center font-bold w-14">Jenis</th>}
            {withWilayah && <th rowSpan={2} className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Kab/Kota</th>}
            <th rowSpan={2} className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Kebutuhan</th>
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
          {rows.map((r,i)=>(
            <tr key={r.id+i} className={i%2===0?'bg-white':'bg-gray-50'}>
              <td className="border border-gray-300 px-2 py-1.5 text-center">{i+1}</td>
              <td className="border border-gray-300 px-2 py-1.5 font-medium">{r.nama}</td>
              {withJenis   && <td className="border border-gray-300 px-2 py-1.5 text-center">{r.jenisSekolah}</td>}
              {withWilayah && <td className="border border-gray-300 px-2 py-1.5">{r.wilayah}</td>}
              <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">{r.kebutuhan}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center">{r.pns}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center">{r.pppk}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">{r.totalASN}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-red-600">{r.selisih<0?Math.abs(r.selisih):''}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-emerald-700">{r.selisih>0?r.selisih:''}</td>
            </tr>
          ))}
          <tr className="bg-blue-900 text-white font-bold">
            <td className="border-2 border-gray-600 px-2 py-2 text-center" colSpan={colSpanTotal}>TOTAL KESELURUHAN</td>
            <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalKeb}</td>
            <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalPNS}</td>
            <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalPPK}</td>
            <td className="border-2 border-gray-600 px-2 py-2 text-center">{totalASN}</td>
            <td className="border-2 border-gray-600 px-2 py-2 text-center text-red-300">{totalKur||''}</td>
            <td className="border-2 border-gray-600 px-2 py-2 text-center text-emerald-300">{totalLeb||''}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function Keterangan() {
  return (
    <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-xs">
      <p className="font-bold mb-1.5">Keterangan:</p>
      <p className="mb-1"><span className="font-semibold">Guru Mapel:</span> <code className="bg-gray-100 px-1 rounded">(Jam × Rombel) / 24</code></p>
      <p className="mb-1.5"><span className="font-semibold">Guru BK:</span> <code className="bg-gray-100 px-1 rounded">Siswa / 150</code></p>
      <p>• <span className="text-red-600 font-semibold">Kurang</span>: Kebutuhan &gt; Total ASN</p>
      <p>• <span className="text-emerald-700 font-semibold">Lebih</span>: Total ASN &gt; Kebutuhan</p>
    </div>
  )
}

function TtdDinas({ tanggal }: { tanggal: string }) {
  return (
    <div className="text-center text-xs">
      <p className="text-gray-700">Kupang, {tanggal}</p>
      <p className="font-bold mt-1 text-sm">Kepala Biro Organisasi</p>
      <p className="text-gray-500">Provinsi Nusa Tenggara Timur</p>
      <div className="h-20 w-52 mt-3 mx-auto"/>
      <p className="font-bold border-t border-gray-700 pt-1 w-52 mx-auto">........................................</p>
      <p className="text-gray-500 mt-0.5">NIP. .......................................</p>
    </div>
  )
}

function TtdSekolah({ sekolah, tanggal }: { sekolah: SekolahData; tanggal: string }) {
  return (
    <div className="text-center text-xs">
      <p className="text-gray-700">{sekolah.wilayah.nama}, {tanggal}</p>
      <p className="font-bold mt-1 text-sm">Kepala Sekolah</p>
      <p className="text-gray-500">{sekolah.nama}</p>
      <div className="h-20 w-52 mt-3 mx-auto"/>
      <p className="font-bold border-t border-gray-700 pt-1 w-52 mx-auto">{sekolah.kepalaSekolah||'........................................'}</p>
      <p className="text-gray-500 mt-0.5">NIP. {sekolah.nipKepala||'.....................................'}</p>
    </div>
  )
}

/* ── Dropdown komponen seragam ───────────────────────────── */
function Dropdown({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 font-medium w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition cursor-pointer hover:border-gray-400 shadow-sm"
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
export default function LaporanClient({ sekolahList, wilayahList, tanggal }: Props) {
  const [mode, setMode]                           = useState<Mode>('rekap')
  const [selectedWilayahId, setSelectedWilayahId] = useState('')
  const [selectedSekolahId, setSelectedSekolahId] = useState('')
  const [selectedJabatan, setSelectedJabatan]     = useState('')

  /* ── Semua jabatan unik ──────────────────────────────── */
  const jabatanOptions = useMemo(() => {
    const map = new Map<string, string>()
    sekolahList.forEach(s => {
      s.guruJabatan.forEach(g => {
        const key   = `${g.namaJabatan}|||${g.jenjangJabatan}`
        const label = `${g.namaJabatan} (${JENJANG[g.jenjangJabatan]??g.jenjangJabatan})${g.isBK?' — BK':''}`
        map.set(key, label)
      })
    })
    return Array.from(map.entries()).sort((a,b)=>a[1].localeCompare(b[1])).map(([value,label])=>({value,label}))
  }, [sekolahList])

  /* ── Mode options sebagai dropdown ──────────────────── */
  const modeOptions = [
    { value:'rekap',   label:'Rekapitulasi Provinsi' },
    { value:'wilayah', label:'Per Kabupaten/Kota'    },
    { value:'sekolah', label:'Per Sekolah'           },
  ]

  const sekolahInWilayah = sekolahList.filter(s => s.wilayah.id === selectedWilayahId)
  const sekolahDetail    = sekolahList.find(s => s.id === selectedSekolahId)
  const jabatanLabel     = jabatanOptions.find(o => o.value === selectedJabatan)?.label ?? ''

  function buildRows(schools: SekolahData[], withJenis=false, withWilayah=false): RowAnjab[] {
    if (!selectedJabatan) {
      return schools.map(s => ({
        id:s.id, nama:s.nama,
        jenisSekolah: withJenis?s.jenisSekolah:undefined,
        wilayah:      withWilayah?s.wilayah.nama:undefined,
        kebutuhan:s.kebutuhan, pns:s.pns, pppk:s.pppk, totalASN:s.totalASN, selisih:s.selisih,
      }))
    }
    const [namaJ, jenjangJ] = selectedJabatan.split('|||')
    return schools.map(s => {
      const g = s.guruJabatan.find(g => g.namaJabatan===namaJ && g.jenjangJabatan===jenjangJ)
      if (!g) return null
      const asn = g.jumlahGuruPNS + g.jumlahGuruPPPK
      const keb = Math.round(g.kebutuhanGuru)
      return { id:s.id, nama:s.nama, jenisSekolah:withJenis?s.jenisSekolah:undefined, wilayah:withWilayah?s.wilayah.nama:undefined, kebutuhan:keb, pns:g.jumlahGuruPNS, pppk:g.jumlahGuruPPPK, totalASN:asn, selisih:asn-keb }
    }).filter(Boolean) as RowAnjab[]
  }

  const rekapWilayah: RowAnjab[] = useMemo(() => {
    return wilayahList.map(w => {
      const rows = sekolahList.filter(s => s.wilayah.id === w.id)
      if (!rows.length) return null
      if (!selectedJabatan) {
        const pns=rows.reduce((t,s)=>t+s.pns,0); const pppk=rows.reduce((t,s)=>t+s.pppk,0)
        const totalASN=pns+pppk; const kebutuhan=rows.reduce((t,s)=>t+s.kebutuhan,0)
        return { id:w.id, nama:w.nama, kebutuhan, pns, pppk, totalASN, selisih:totalASN-kebutuhan }
      }
      const [namaJ, jenjangJ] = selectedJabatan.split('|||')
      let pns=0,pppk=0,kebutuhan=0
      rows.forEach(s => {
        const g = s.guruJabatan.find(g => g.namaJabatan===namaJ && g.jenjangJabatan===jenjangJ)
        if (g) { pns+=g.jumlahGuruPNS; pppk+=g.jumlahGuruPPPK; kebutuhan+=Math.round(g.kebutuhanGuru) }
      })
      if (!kebutuhan && !pns && !pppk) return null
      const totalASN=pns+pppk
      return { id:w.id, nama:w.nama, kebutuhan, pns, pppk, totalASN, selisih:totalASN-kebutuhan }
    }).filter(Boolean) as RowAnjab[]
  }, [wilayahList, sekolahList, selectedJabatan])

  const wilayahOptions = wilayahList.map(w => ({ value:w.id, label:w.nama }))
  const sekolahOptions = sekolahList.map(s => ({ value:s.id, label:`${s.nama} (${s.jenisSekolah})` }))
  const canPrint = !(mode==='wilayah' && !selectedWilayahId) && !(mode==='sekolah' && !selectedSekolahId)

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 1cm 1.5cm; }
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 0; }
          table { font-size: 7.5pt !important; }
          th, td { padding: 2px 3px !important; }
          .print-kop { margin-bottom: 12px !important; }
        }
      `}</style>

      {/* ══ PANEL KONTROL — semua dropdown sejajar ═══════════ */}
      <div className="no-print rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-4">
        <div className="flex flex-wrap items-end gap-3 px-4 py-3">

          {/* 1. Jenis Laporan — dropdown */}
          <div className="flex-1 min-w-[160px]">
            <p className="text-xs text-gray-500 mb-1 font-medium">Jenis Laporan</p>
            <Dropdown
              value={mode}
              onChange={v => { setMode(v as Mode); setSelectedWilayahId(''); setSelectedSekolahId('') }}
              placeholder="Pilih Jenis Laporan"
              options={modeOptions}
            />
          </div>

          {/* 2. Jabatan — selalu tampil */}
          <div className="flex-1 min-w-[180px]">
            <p className="text-xs text-gray-500 mb-1 font-medium">Jabatan / Mata Pelajaran</p>
            <Dropdown
              value={selectedJabatan}
              onChange={setSelectedJabatan}
              placeholder="Semua Jabatan"
              options={jabatanOptions}
            />
          </div>

          {/* 3. Kabupaten/Kota — mode wilayah */}
          {mode === 'wilayah' && (
            <div className="flex-1 min-w-[180px]">
              <p className="text-xs text-gray-500 mb-1 font-medium">Kabupaten / Kota</p>
              <Dropdown
                value={selectedWilayahId}
                onChange={setSelectedWilayahId}
                placeholder="Semua Kabupaten/Kota"
                options={wilayahOptions}
              />
            </div>
          )}

          {/* 4. Nama Sekolah — mode sekolah */}
          {mode === 'sekolah' && (
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-gray-500 mb-1 font-medium">Nama Sekolah</p>
              <Dropdown
                value={selectedSekolahId}
                onChange={setSelectedSekolahId}
                placeholder="Pilih Sekolah"
                options={sekolahOptions}
              />
            </div>
          )}

          {/* 5. Tombol Cetak */}
          <div className="flex-shrink-0">
            <p className="text-xs text-transparent mb-1 select-none">.</p>
            <button
              onClick={() => window.print()}
              disabled={!canPrint}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Cetak
            </button>
          </div>
        </div>


      </div>

      {/* ══ AREA PRINT ════════════════════════════════════════ */}
      <div id="print-area" className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">

        {/* ── REKAP PROVINSI ── */}
        {mode === 'rekap' && (
          <>
            <KopNTT/>
            <Judul title="Rekapitulasi Analisis Jabatan dan Analisis Beban Kerja (ANJAB & ABK)" sub="Guru SMA / SMK / SLB Provinsi Nusa Tenggara Timur" tanggal={tanggal} jabatan={jabatanLabel||undefined}/>
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide border-b border-gray-200 pb-1">A. Rekap per Kabupaten / Kota</p>
            <TabelAnjab rows={rekapWilayah}/>
            <p className="text-xs font-bold text-gray-700 mb-2 mt-4 uppercase tracking-wide border-b border-gray-200 pb-1">B. Detail per Sekolah</p>
            <TabelAnjab rows={buildRows(sekolahList, true, true)}/>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mt-5">
              <Keterangan/><TtdDinas tanggal={tanggal}/>
            </div>
          </>
        )}

        {/* ── PER KAB/KOTA ── */}
        {mode === 'wilayah' && (
          !selectedWilayahId ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🗺️</p>
              <p className="text-sm">Pilih kabupaten/kota di filter atas untuk melihat preview</p>
            </div>
          ) : (
            <>
              <KopNTT/>
              <Judul title={`Laporan ANJAB & ABK — ${wilayahList.find(w=>w.id===selectedWilayahId)?.nama}`} sub={`Guru SMA/SMK/SLB — ${wilayahList.find(w=>w.id===selectedWilayahId)?.nama}, Provinsi NTT`} tanggal={tanggal} jabatan={jabatanLabel||undefined}/>
              <TabelAnjab rows={buildRows(sekolahInWilayah, true)}/>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mt-5">
                <Keterangan/><TtdDinas tanggal={tanggal}/>
              </div>
            </>
          )
        )}

        {/* ── PER SEKOLAH ── */}
        {mode === 'sekolah' && (
          !sekolahDetail ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🏫</p>
              <p className="text-sm">Pilih sekolah di filter atas untuk melihat preview</p>
            </div>
          ) : (
            <>
              <KopTutWuri sekolah={sekolahDetail}/>
              <Judul title="Laporan Kebutuhan Guru (ANJAB & ABK)" sub={`${sekolahDetail.nama} — ${sekolahDetail.jenisSekolah}, ${sekolahDetail.wilayah.nama}`} tanggal={tanggal} jabatan={jabatanLabel||undefined}/>
              <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                {[{label:'Jumlah Siswa',value:sekolahDetail.jumlahSiswa},{label:'Jumlah Rombel',value:sekolahDetail.jumlahRombel},{label:'Jabatan Diinput',value:sekolahDetail.guruJabatan.length}].map(item=>(
                  <div key={item.label} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="font-bold text-lg text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
              {!selectedJabatan && (
                <>
                  <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide border-b border-gray-200 pb-1">A. Ringkasan ANJAB & ABK</p>
                  <TabelAnjab rows={[{id:sekolahDetail.id,nama:sekolahDetail.nama,kebutuhan:sekolahDetail.kebutuhan,pns:sekolahDetail.pns,pppk:sekolahDetail.pppk,totalASN:sekolahDetail.totalASN,selisih:sekolahDetail.selisih}]}/>
                  <p className="text-xs font-bold text-gray-700 mb-2 mt-4 uppercase tracking-wide border-b border-gray-200 pb-1">B. Detail per Jabatan / Mata Pelajaran</p>
                </>
              )}
              {selectedJabatan && (
                <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide border-b border-gray-200 pb-1">Detail Jabatan: {jabatanLabel}</p>
              )}
              <div className="overflow-x-auto mb-5">
                <table className="w-full border-collapse text-xs" style={{borderCollapse:'collapse',minWidth:420}}>
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">No</th>
                      <th className="border-2 border-gray-600 px-2 py-2 text-left font-bold">Jabatan / Mapel</th>
                      <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Jenjang</th>
                      <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Kebutuhan</th>
                      <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">PNS</th>
                      <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">PPPK</th>
                      <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Total ASN</th>
                      <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Kurang</th>
                      <th className="border-2 border-gray-600 px-2 py-2 text-center font-bold">Lebih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sekolahDetail.guruJabatan.filter(g => {
                      if (!selectedJabatan) return true
                      const [namaJ,jenjangJ] = selectedJabatan.split('|||')
                      return g.namaJabatan===namaJ && g.jenjangJabatan===jenjangJ
                    }).map((g,i) => {
                      const asn=g.jumlahGuruPNS+g.jumlahGuruPPPK; const keb=Math.round(g.kebutuhanGuru); const sel=asn-keb
                      return (
                        <tr key={i} className={i%2===0?'bg-white':'bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-1.5 text-center">{i+1}</td>
                          <td className="border border-gray-300 px-2 py-1.5 font-medium">{g.namaJabatan}{g.isBK&&<span className="ml-1 text-blue-500 text-xs">(BK)</span>}</td>
                          <td className="border border-gray-300 px-2 py-1.5 text-center"><span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full text-xs">{JENJANG[g.jenjangJabatan]??g.jenjangJabatan}</span></td>
                          <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">{keb}</td>
                          <td className="border border-gray-300 px-2 py-1.5 text-center">{g.jumlahGuruPNS}</td>
                          <td className="border border-gray-300 px-2 py-1.5 text-center">{g.jumlahGuruPPPK}</td>
                          <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">{asn}</td>
                          <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-red-600">{sel<0?Math.abs(sel):''}</td>
                          <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-emerald-700">{sel>0?sel:''}</td>
                        </tr>
                      )
                    })}
                    <tr className="bg-blue-900 text-white font-bold">
                      <td className="border-2 border-gray-600 px-2 py-2 text-center" colSpan={3}>TOTAL</td>
                      <td className="border-2 border-gray-600 px-2 py-2 text-center">{sekolahDetail.kebutuhan}</td>
                      <td className="border-2 border-gray-600 px-2 py-2 text-center">{sekolahDetail.pns}</td>
                      <td className="border-2 border-gray-600 px-2 py-2 text-center">{sekolahDetail.pppk}</td>
                      <td className="border-2 border-gray-600 px-2 py-2 text-center">{sekolahDetail.totalASN}</td>
                      <td className="border-2 border-gray-600 px-2 py-2 text-center text-red-300">{sekolahDetail.selisih<0?Math.abs(sekolahDetail.selisih):''}</td>
                      <td className="border-2 border-gray-600 px-2 py-2 text-center text-emerald-300">{sekolahDetail.selisih>0?sekolahDetail.selisih:''}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mt-5">
                <Keterangan/><TtdSekolah sekolah={sekolahDetail} tanggal={tanggal}/>
              </div>
            </>
          )
        )}
      </div>
    </>
  )
}