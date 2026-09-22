import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HeaderBiro from './HeaderBiro'

function buildArcs(segments: { label: string; value: number; color: string }[], total: number) {
  const R = 58; const C = 2 * Math.PI * R; let cumulative = 0
  return segments.map(seg => {
    const pct = total > 0 ? seg.value / total : 0
    const dash = pct * C; const gap = C - dash; const offset = C - cumulative * C
    cumulative += pct
    return { ...seg, pct, dash, gap, offset, R, C }
  })
}

export default async function BiroDashboardPage({
  searchParams,
}: {
  searchParams: { periodeId?: string }
}) {
  const session = await getSession()
  if (!session || session.role !== 'BIRO') {
    redirect('/login')
  }

  const periodeList = await prisma.periodeLaporan.findMany({
    orderBy: [{ tahunAjaran: 'desc' }, { semester: 'asc' }],
  })
  const activePeriode = periodeList.find(p => p.isAktif) ?? null
  const periodeId = searchParams.periodeId || activePeriode?.id

  const sekolahList = await prisma.sekolah.findMany({
    where: periodeId
      ? { guruJabatan: { some: { OR: [{ periodeId }, { periodeId: null }] } } }
      : undefined,
    include: {
      wilayah: true,
      guruJabatan: periodeId ? { where: { OR: [{ periodeId }, { periodeId: null }] } } : true,
    },
    orderBy: { nama: 'asc' },
  })

  const stats = {
    total:     sekolahList.length,
    dikirim:   sekolahList.filter(s => s.statusData === 'DIKIRIM').length,
    disetujui: sekolahList.filter(s => s.statusData === 'DISETUJUI').length,
    ditolak:   sekolahList.filter(s => s.statusData === 'DITOLAK').length,
    draft:     sekolahList.filter(s => s.statusData === 'DRAFT').length,
  }

  const anjabList = sekolahList.map(s => {
    const kebutuhan = Math.round(s.guruJabatan.reduce((sum, g) => sum + g.kebutuhanGuru, 0))
    const pns       = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPNS, 0)
    const pppk      = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPPPK, 0)
    const totalASN  = pns + pppk
    const selisih   = totalASN - kebutuhan
    return { ...s, kebutuhan, pns, pppk, totalASN, selisih }
  })

  const totalKebutuhan = anjabList.reduce((s, x) => s + x.kebutuhan, 0)
  const totalPNS       = anjabList.reduce((s, x) => s + x.pns, 0)
  const totalPPPK      = anjabList.reduce((s, x) => s + x.pppk, 0)
  const totalASN       = totalPNS + totalPPPK

  const topKekurangan = anjabList.filter(s => s.selisih < 0).sort((a, b) => a.selisih - b.selisih).slice(0, 5)

  const pengumumanList = await prisma.pengumuman.findMany({
    orderBy: { tanggal: 'desc' },
    take: 3,
  })

  const SIZE = 160; const CX = 80; const CY = 80; const R = 58; const INNER = 36
  const donutSegments = [
    { label: 'Draft',     value: stats.draft,     color: '#4f46e5' },
    { label: 'Dikirim',   value: stats.dikirim,   color: '#3b82f6' },
    { label: 'Disetujui', value: stats.disetujui, color: '#22c55e' },
  ]
  const arcs = buildArcs(donutSegments, stats.total)

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard Biro</h2>
          <p className="text-sm text-gray-500 mt-0.5">Ringkasan ANJAB &amp; ABK Guru Provinsi NTT</p>
        </div>
        <HeaderBiro
          periodeList={periodeList.map(p => ({
            id: p.id,
            nama: p.nama,
            tahunAjaran: p.tahunAjaran,
            semester: p.semester,
            isAktif: p.isAktif,
          }))}
          activePeriode={activePeriode ? {
            id: activePeriode.id,
            nama: activePeriode.nama,
            tahunAjaran: activePeriode.tahunAjaran,
            semester: activePeriode.semester,
            isAktif: activePeriode.isAktif,
          } : null}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Total Sekolah', value: stats.total, sub: 'Sekolah terdata',
            iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" />
            ),
          },
          {
            label: 'Menunggu Validasi', value: stats.dikirim, sub: 'Perlu ditindaklanjuti',
            iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-5 8l2 2 4-4" />
            ),
          },
          {
            label: 'Sudah Disetujui', value: stats.disetujui, sub: 'Data tervalidasi',
            iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ),
          },
          {
            label: 'Belum Kirim', value: stats.draft, sub: 'Belum mengirim data',
            iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-5.13a4 4 0 100-8 4 4 0 000 8zm6 3a4 4 0 10-8 0" />
            ),
          },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white px-4 py-4 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
              <svg className={`w-5 h-5 ${s.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {s.icon}
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">{s.label}</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-gray-900">{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rekapitulasi ANJAB */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3 bg-indigo-900">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 17l6-6 4 4 8-8M21 7v6m0-6h-6" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Rekapitulasi ANJAB &amp; ABK — Provinsi NTT</h3>
            <p className="text-xs text-indigo-300 mt-0.5">Ringkasan data berdasarkan pengiriman sekolah</p>
          </div>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full border-collapse text-xs" style={{ minWidth: '460px' }}>
            <thead>
              <tr className="border-b border-gray-100">
                <Th>Total Sekolah</Th>
                <Th>Kebutuhan Guru</Th>
                <Th>PNS</Th>
                <Th>PPPK</Th>
                <Th>Total ASN</Th>
                <Th>Kurang</Th>
                <Th>Lebih</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td bold>{stats.total}</Td>
                <Td bold>{totalKebutuhan}</Td>
                <Td>{totalPNS}</Td>
                <Td>{totalPPPK}</Td>
                <Td bold>{totalASN}</Td>
                <Td red>{totalASN < totalKebutuhan ? totalKebutuhan - totalASN : '—'}</Td>
                <Td green>{totalASN > totalKebutuhan ? totalASN - totalKebutuhan : '—'}</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">

        {/* Top Kekurangan */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-800">Sekolah Kekurangan Guru Terbanyak</h3>
            <Link href="/biro/analisis"
              className="text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors flex-shrink-0">
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#', 'Sekolah', 'Kebutuhan', 'ASN', 'Kurang'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topKekurangan.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                          <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0l-1.5 5.5a2 2 0 01-1.94 1.5H7.44a2 2 0 01-1.94-1.5L4 13m16 0H4m8-3v0" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-400">Tidak ada data</p>
                      </div>
                    </td>
                  </tr>
                ) : topKekurangan.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-2.5">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>{i + 1}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-900 text-xs leading-tight">{s.nama}</p>
                      <p className="text-[10px] text-gray-400">{s.jenisSekolah} · {s.wilayah.nama}</p>
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs">{s.kebutuhan}</td>
                    <td className="px-4 py-2.5 text-center text-xs">{s.totalASN}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-red-600 text-xs">{Math.abs(s.selisih)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Donut */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-800">Status Pengiriman Data</h3>
            <Link href="/biro/laporan"
              className="text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors flex-shrink-0">
              Lihat Semua
            </Link>
          </div>
          <div className="p-5 flex items-center gap-6">
            <div className="flex-shrink-0">
              <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} xmlns="http://www.w3.org/2000/svg">
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={R - INNER}/>
                {arcs.map((arc, i) => (
                  <circle key={i} cx={CX} cy={CY} r={arc.R} fill="none" stroke={arc.color}
                    strokeWidth={arc.R - INNER} strokeDasharray={`${arc.dash} ${arc.gap}`}
                    strokeDashoffset={arc.offset} strokeLinecap="butt"
                    transform={`rotate(-90 ${CX} ${CY})`}/>
                ))}
                <text x={CX} y={CY - 7} textAnchor="middle" fill="#1e293b" fontSize="22"
                  fontWeight="700" fontFamily="system-ui, sans-serif">{stats.total}</text>
                <text x={CX} y={CY + 11} textAnchor="middle" fill="#94a3b8" fontSize="10"
                  fontFamily="system-ui, sans-serif">sekolah</text>
              </svg>
            </div>
            <div className="flex-1 space-y-3.5">
              {arcs.map((arc, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: arc.color }}/>
                      {arc.label}
                    </span>
                    <span className="text-xs font-bold" style={{ color: arc.color }}>
                      {arc.value} <span className="text-gray-400 font-normal">({stats.total > 0 ? Math.round(arc.pct * 100) : 0}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${stats.total > 0 ? (arc.value / stats.total) * 100 : 0}%`,
                      background: arc.color,
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pengumuman */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-800">Pengumuman</h3>
          <Link href="/biro/pengumuman"
            className="text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors flex-shrink-0">
            Kelola
          </Link>
        </div>
        {pengumumanList.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">Belum ada pengumuman</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {pengumumanList.map(p => (
              <div key={p.id} className="px-5 py-3.5 flex gap-3">
                <div className="w-11 h-11 rounded-lg bg-indigo-50 flex-shrink-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-indigo-700 leading-none">{new Date(p.tanggal).getDate()}</span>
                  <span className="text-[9px] font-bold text-indigo-700 uppercase">
                    {new Date(p.tanggal).toLocaleDateString('id-ID', { month: 'short' })}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{p.judul}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.isi}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {p.batasWaktu && (
                      <span className="text-[10.5px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                        Batas: {new Date(p.batasWaktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <span className="text-[10.5px] text-gray-400">Dari: {p.pengirim}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">{children}</th>
}
function Td({ children, bold, red, green }: { children?: React.ReactNode; bold?: boolean; red?: boolean; green?: boolean }) {
  return (
    <td className={['px-3 py-2.5 text-center text-sm',
      bold ? 'font-bold text-gray-800' : 'text-gray-600',
      red  ? 'font-bold text-red-600' : '',
      green ? 'font-bold text-emerald-600' : '',
    ].join(' ')}>{children}</td>
  )
}