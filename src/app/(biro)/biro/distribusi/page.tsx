import { prisma } from '@/lib/prisma'

export default async function DistribusiPage() {
  const sekolahList = await prisma.sekolah.findMany({
    include: { wilayah: true, guruJabatan: true },
    orderBy: [{ wilayah: { nama: 'asc' } }, { nama: 'asc' }],
  })

  const anjabList = sekolahList.map(s => {
    const kebutuhan = Math.round(s.guruJabatan.reduce((sum, g) => sum + g.kebutuhanGuru, 0))
    const pns       = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPNS, 0)
    const pppk      = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPPPK, 0)
    const totalASN  = pns + pppk
    const selisih   = totalASN - kebutuhan
    return { ...s, kebutuhan, pns, pppk, totalASN, selisih }
  })

  const kekurangan = anjabList.filter(s => s.selisih < 0).sort((a, b) => a.selisih - b.selisih)
  const kelebihan  = anjabList.filter(s => s.selisih > 0).sort((a, b) => b.selisih - a.selisih)

  const jabatanMap = new Map<string, {
    nama: string
    defisit: { sekolah: string; wilayah: string; jumlah: number }[]
    surplus:  { sekolah: string; wilayah: string; jumlah: number }[]
  }>()

  sekolahList.forEach(s => {
    s.guruJabatan.forEach(g => {
      const asn = g.jumlahGuruPNS + g.jumlahGuruPPPK
      const keb = Math.round(g.kebutuhanGuru)
      const sel = asn - keb
      if (sel === 0) return

      const mapKey = `${g.namaJabatan}||${g.jenjangJabatan}`
      if (!jabatanMap.has(mapKey)) {
        const labelJenjang: Record<string, string> = {
          AHLI_PERTAMA: 'Ahli Pertama', AHLI_MUDA: 'Ahli Muda',
          AHLI_MADYA: 'Ahli Madya',     AHLI_UTAMA: 'Ahli Utama',
        }
        jabatanMap.set(mapKey, {
          nama: `${g.namaJabatan} (${labelJenjang[g.jenjangJabatan] ?? g.jenjangJabatan})`,
          defisit: [], surplus: [],
        })
      }
      const entry = jabatanMap.get(mapKey)!
      if (sel < 0) entry.defisit.push({ sekolah: s.nama, wilayah: s.wilayah.nama, jumlah: Math.abs(sel) })
      if (sel > 0) entry.surplus.push({ sekolah: s.nama, wilayah: s.wilayah.nama, jumlah: sel })
    })
  })

  const rekomendasiList = Array.from(jabatanMap.entries())
    .filter(([, v]) => v.defisit.length > 0 && v.surplus.length > 0)
    .map(([id, v]) => ({
      id, nama: v.nama,
      totalDefisit: v.defisit.reduce((s, x) => s + x.jumlah, 0),
      totalSurplus: v.surplus.reduce((s, x) => s + x.jumlah, 0),
      defisit: v.defisit.sort((a, b) => b.jumlah - a.jumlah),
      surplus: v.surplus.sort((a, b) => b.jumlah - a.jumlah),
    }))
    .sort((a, b) => b.totalDefisit - a.totalDefisit)

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Dasar Pemerataan Guru</h2>
        <p className="text-sm text-gray-500 mt-0.5">Rekomendasi distribusi guru dari sekolah surplus ke sekolah defisit</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">Sekolah Kekurangan</p>
          <p className="text-3xl font-bold text-red-700 mt-1 tabular-nums">{kekurangan.length}</p>
          <p className="text-xs text-red-400 mt-1">
            Total kurang: {kekurangan.reduce((s, x) => s + Math.abs(x.selisih), 0)} guru
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <p className="text-sm font-medium text-emerald-700">Sekolah Kelebihan</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1 tabular-nums">{kelebihan.length}</p>
          <p className="text-xs text-emerald-400 mt-1">
            Total lebih: {kelebihan.reduce((s, x) => s + x.selisih, 0)} guru
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
          <p className="text-sm font-medium text-blue-700">Jabatan Bisa Dirotasi</p>
          <p className="text-3xl font-bold text-blue-700 mt-1 tabular-nums">{rekomendasiList.length}</p>
          <p className="text-xs text-blue-400 mt-1">Ada sekolah surplus &amp; defisit</p>
        </div>
      </div>

      {/* Tabel Distribusi */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-indigo-900">
          <h3 className="text-sm font-semibold text-white">Tabel Distribusi Format ANJAB &amp; ABK</h3>
          <p className="text-xs text-indigo-300 mt-0.5">Perbandingan kebutuhan vs bezeting ASN untuk dasar pemerataan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs" style={{ minWidth: '640px' }}>
            <thead>
              <tr>
                <Th rowSpan={2}>No</Th>
                <Th rowSpan={2} left>Nama Sekolah</Th>
                <Th rowSpan={2}>Kebutuhan Guru</Th>
                <Th colSpan={2}>Bezeting ASN</Th>
                <Th rowSpan={2}>Total ASN</Th>
                <Th colSpan={2}>Kebutuhan</Th>
                <Th rowSpan={2}>Rekomendasi</Th>
              </tr>
              <tr>
                <Th>PNS</Th><Th>PPPK</Th><Th>Kurang</Th><Th>Lebih</Th>
              </tr>
            </thead>
            <tbody>
              {anjabList.map((s, i) => (
                <tr key={s.id} className={
                  s.selisih < 0 ? 'bg-red-50/60'
                  : s.selisih > 0 ? 'bg-emerald-50/60'
                  : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                }>
                  <Td>{i + 1}</Td>
                  <Td left>
                    <span className="font-medium">{s.nama}</span>
                    <span className="block text-[10px] text-gray-400">{s.wilayah.nama}</span>
                  </Td>
                  <Td bold>{s.kebutuhan}</Td>
                  <Td>{s.pns}</Td>
                  <Td>{s.pppk}</Td>
                  <Td bold>{s.totalASN}</Td>
                  <Td red>{s.selisih < 0 ? Math.abs(s.selisih) : ''}</Td>
                  <Td green>{s.selisih > 0 ? s.selisih : ''}</Td>
                  <Td>
                    {s.selisih < 0
                      ? <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-medium">Butuh Tambahan</span>
                      : s.selisih > 0
                        ? <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-medium">Bisa Dipindah</span>
                        : <span className="text-gray-400 text-[10px]">Seimbang</span>
                    }
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rekomendasi per Jabatan */}
      {rekomendasiList.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">Rekomendasi Rotasi per Jabatan</h3>
          {rekomendasiList.map(r => (
            <div key={r.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-gray-800">{r.nama}</h4>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">Defisit: {r.totalDefisit}</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Surplus: {r.totalSurplus}</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                    Bisa pindah: {Math.min(r.totalDefisit, r.totalSurplus)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="p-4">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2.5">Sekolah Kekurangan</p>
                  {r.defisit.slice(0, 5).map((d, i) => (
                    <div key={i} className="flex justify-between items-center bg-red-50 px-3 py-2 rounded-lg mb-1.5 text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-gray-800 truncate block">{d.sekolah}</span>
                        <span className="text-gray-400 text-[10px]">{d.wilayah}</span>
                      </div>
                      <span className="font-bold text-red-600 ml-2 flex-shrink-0">−{d.jumlah}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2.5">Sekolah Kelebihan</p>
                  {r.surplus.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex justify-between items-center bg-emerald-50 px-3 py-2 rounded-lg mb-1.5 text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-gray-800 truncate block">{s.sekolah}</span>
                        <span className="text-gray-400 text-[10px]">{s.wilayah}</span>
                      </div>
                      <span className="font-bold text-emerald-600 ml-2 flex-shrink-0">+{s.jumlah}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

function Th({ children, colSpan, rowSpan, left }: {
  children?: React.ReactNode; colSpan?: number; rowSpan?: number; left?: boolean
}) {
  return (
    <th colSpan={colSpan} rowSpan={rowSpan}
      className={`border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap ${left ? 'text-left' : 'text-center'}`}>
      {children}
    </th>
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
      red   ? 'font-semibold text-red-600'      : '',
      green ? 'font-semibold text-emerald-600'  : '',
    ].join(' ')}>{children}</td>
  )
}

