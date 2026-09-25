import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SekolahAvatar from './SekolahAvatar'
import HeaderSekolah from './HeaderSekolah'
import PengumumanPopup from './PengumumanPopup'

// ─── Helper Components ────────────────────────────────────────────────────────

function Th({ children, colSpan, rowSpan, left }: {
  children?: React.ReactNode; colSpan?: number; rowSpan?: number; left?: boolean
}) {
  return (
    <th colSpan={colSpan} rowSpan={rowSpan} style={{
      border: '1px solid #e5e7eb', background: '#f9fafb',
      padding: '8px 12px', fontSize: 10, fontWeight: 700,
      color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' as const,
      textAlign: left ? 'left' : 'center', whiteSpace: 'nowrap' as const,
    }}>{children}</th>
  )
}

function Td({ children, left, bold, red, green }: {
  children?: React.ReactNode; left?: boolean; bold?: boolean; red?: boolean; green?: boolean
}) {
  return (
    <td style={{
      border: '1px solid #f3f4f6', padding: '9px 12px', fontSize: 12,
      fontWeight: red || green || bold ? 600 : 400,
      color: red ? '#dc2626' : green ? '#059669' : bold ? '#111827' : '#6b7280',
      textAlign: left ? 'left' : 'center',
    }}>{children}</td>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default async function DashboardSekolahPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'SEKOLAH' || !session.sekolahId) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-gray-400">Sekolah tidak ditemukan.</p>
      </div>
    )
  }

  const [sekolah, periodeAktif, pengumumanList] = await Promise.all([
    prisma.sekolah.findUnique({
      where: { id: session.sekolahId },
      include: { wilayah: true, guruJabatan: true },
    }),
    prisma.periodeLaporan.findFirst({ where: { isAktif: true } }),
    prisma.pengumuman.findMany({ orderBy: { tanggal: 'desc' }, take: 5 }),
  ])

  if (!sekolah) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-gray-400">Sekolah tidak ditemukan.</p>
      </div>
    )
  }

  // ── Kalkulasi ────────────────────────────────────────────────
  const totalPNS       = sekolah.guruJabatan.reduce((s, g) => s + g.jumlahGuruPNS, 0)
  const totalPPPK      = sekolah.guruJabatan.reduce((s, g) => s + g.jumlahGuruPPPK, 0)
  const totalASN       = totalPNS + totalPPPK
  const totalKebutuhan = sekolah.guruJabatan.reduce((s, g) => s + Math.round(g.kebutuhanGuru), 0)
  const selisih        = totalASN - totalKebutuhan
  const pct            = totalKebutuhan > 0
    ? Math.min(100, Math.round((totalASN / totalKebutuhan) * 100))
    : 0

  // ── Progress ring ────────────────────────────────────────────
  const R = 28

  // ── Status badge ─────────────────────────────────────────────
  const statusMap: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
    DRAFT:     { label: 'Draft',     dot: '#9ca3af', bg: '#f9fafb', text: '#6b7280',  border: '#e5e7eb' },
    DIKIRIM:   { label: 'Dikirim',   dot: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8',  border: '#bfdbfe' },
    DISETUJUI: { label: 'Disetujui', dot: '#10b981', bg: '#f0fdf4', text: '#065f46',  border: '#a7f3d0' },
    DITOLAK:   { label: 'Ditolak',   dot: '#ef4444', bg: '#fef2f2', text: '#991b1b',  border: '#fecaca' },
  }
  const st = statusMap[sekolah.statusData] ?? statusMap.DRAFT

  // ── Kelengkapan data (simple scoring) ────────────────────────
  let skor = 0
  if (sekolah.npsn)            skor += 15
  if (sekolah.kepalaSekolah)   skor += 15
  if (sekolah.nipKepala)       skor += 10
  if (sekolah.jumlahSiswa > 0) skor += 15
  if (sekolah.jumlahRombel > 0) skor += 15
  if (sekolah.guruJabatan.length > 0) skor += 30
  const kelengkapan = Math.min(100, skor)

  const ringC   = 2 * Math.PI * R
  const ringOff = ringC * (1 - kelengkapan / 100)

  // ── Susun notifikasi dinamis berdasarkan kondisi data asli ──
  const notifs: {
    id: string
    type: 'ditolak' | 'belum-lengkap' | 'periode-berakhir' | 'disetujui'
    title: string
    desc: string
    href?: string
  }[] = []

  if (sekolah.statusData === 'DITOLAK') {
    notifs.push({
      id: 'ditolak',
      type: 'ditolak',
      title: 'Data Anda ditolak Biro',
      desc: 'Periksa kembali data dan kirim ulang',
      href: '/laporan',
    })
  }
  if (sekolah.statusData === 'DISETUJUI') {
    notifs.push({
      id: 'disetujui',
      type: 'disetujui',
      title: 'Data Anda telah disetujui',
      desc: 'Laporan ANJAB & ABK sudah tervalidasi Biro',
      href: '/laporan',
    })
  }
  if (kelengkapan < 100 && sekolah.statusData === 'DRAFT') {
    notifs.push({
      id: 'belum-lengkap',
      type: 'belum-lengkap',
      title: 'Data sekolah belum lengkap',
      desc: `Kelengkapan baru ${kelengkapan}%, segera lengkapi`,
      href: '/profil',
    })
  }
  if (periodeAktif) {
    const sisaHari = Math.ceil(
      (new Date(periodeAktif.tanggalAkhir).getTime() - Date.now()) / 86400000
    )
    if (sisaHari <= 7 && sisaHari >= 0 && sekolah.statusData === 'DRAFT') {
      notifs.push({
        id: 'periode-berakhir',
        type: 'periode-berakhir',
        title: 'Periode laporan segera berakhir',
        desc: `Tersisa ${sisaHari} hari untuk mengirim data`,
        href: '/laporan',
      })
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ds-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; }
        .ds-tr:hover td { background:#fafafa; }
        .ds-action-btn {
          display:inline-flex; align-items:center; gap:6px;
          border-radius:8px; padding:7px 14px; font-size:12px; font-weight:600;
          cursor:pointer; transition:all 0.15s; text-decoration:none; border:none;
        }
        .ds-btn-primary {
          background:#1e3a8a; color:#fff;
        }
        .ds-btn-primary:hover { background:#1e40af; }
        .ds-btn-outline {
          background:#fff; color:#374151; border:1px solid #e5e7eb;
        }
        .ds-btn-outline:hover { background:#f9fafb; }
        .ds-btn-blue-outline {
          background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;
        }
        .ds-btn-blue-outline:hover { background:#dbeafe; }
        .stat-card {
          background:#fff; border:1px solid #e5e7eb; border-radius:12px;
          padding:14px 16px; display:flex; align-items:flex-start; gap:12px;
          min-width:0;
        }
        .stat-icon {
          width:36px; height:36px; border-radius:9px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .guide-item {
          display:flex; align-items:center; gap:10px; padding:9px 6px;
          border-bottom:1px solid #f3f4f6; cursor:default;
        }
        .guide-item:last-child { border-bottom:none; }
        .act-item {
          display:flex; align-items:flex-start; gap:9px;
          padding:8px 6px; border-radius:8px;
        }

        /* ── Responsive layout ── */
        .ds-main-grid {
          display:grid;
          grid-template-columns: 1fr 280px;
          gap:16px; align-items:flex-start;
        }
        .ds-stat-grid-4 {
          display:grid;
          grid-template-columns: repeat(4,1fr);
          gap:10px;
        }
        @media (max-width: 900px) {
          .ds-main-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .ds-stat-grid-4 { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 420px) {
          .stat-card { padding:12px; gap:10px; }
        }
      ` }} />

      {/* ══ LAYOUT ══════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Pengumuman dari Biro — pop-up otomatis + banner berjalan */}
        <PengumumanPopup />

        {/* ── Topbar row: judul + header (periode & notifikasi) + status ─────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827', lineHeight: 1 }}>Dashboard</p>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9ca3af' }}>Ringkasan informasi sekolah Anda</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <HeaderSekolah
              periodeAktif={periodeAktif ? {
                id: periodeAktif.id,
                nama: periodeAktif.nama,
                tahunAjaran: periodeAktif.tahunAjaran,
                semester: periodeAktif.semester,
                tanggalMulai: periodeAktif.tanggalMulai.toISOString(),
                tanggalAkhir: periodeAktif.tanggalAkhir.toISOString(),
                isAktif: periodeAktif.isAktif,
              } : null}
              notifs={notifs}
            />
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 99,
              background: st.bg, border: `1px solid ${st.border}`, color: st.text,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
              Status: {st.label}
            </span>
            {sekolah.statusData === 'DRAFT' && (
              <Link href="/laporan" className="ds-action-btn ds-btn-primary">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Kirim ke Biro
              </Link>
            )}
          </div>
        </div>

        {/* ── Hero card sekolah ──────────────────────────────────── */}
        <div className="ds-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>

            {/* Logo sekolah — foto asli dari database (fotoSekolah), fallback inisial */}
            <SekolahAvatar src={sekolah.fotoSekolah} nama={sekolah.nama} size={64} />

            {/* Info utama */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#111827' }}>{sekolah.nama}</h2>
              </div>

              {/* Meta info */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginBottom: 10 }}>
                {[
                  { ico: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', txt: sekolah.jenisSekolah },
                  { ico: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', txt: sekolah.wilayah.nama },
                  ...(sekolah.npsn ? [{ ico: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0', txt: `NPSN: ${sekolah.npsn}` }] : []),
                ].map(({ ico, txt }, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={ico}/>
                    </svg>
                    {txt}
                  </span>
                ))}
              </div>

              {/* Kepala sekolah — foto asli dari database (fotoKepala) */}
              {sekolah.kepalaSekolah && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 9, padding: '7px 12px',
                }}>
                  <SekolahAvatar
                    src={sekolah.fotoKepala}
                    nama={sekolah.kepalaSekolah}
                    size={26}
                    bg="#f3f4f6"
                    color="#6b7280"
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#374151' }}>{sekolah.kepalaSekolah}</p>
                    {sekolah.nipKepala && (
                      <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>NIP. {sekolah.nipKepala}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Kanan: Ring kelengkapan */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
              <div style={{ width: 1, height: 48, background: '#f0f0f0' }} />
              <div style={{ position: 'relative', width: 70, height: 70 }}>
                <svg width="70" height="70" viewBox="0 0 70 70" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="35" cy="35" r={R} fill="none" stroke="#f0f0f0" strokeWidth="5"/>
                  <circle cx="35" cy="35" r={R} fill="none"
                    stroke={kelengkapan >= 100 ? '#059669' : kelengkapan >= 70 ? '#d97706' : '#3b82f6'}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${ringC}`}
                    strokeDashoffset={`${ringOff}`}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>{kelengkapan}%</span>
                </div>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#111827' }}>Kelengkapan</p>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Data Sekolah</p>
                {kelengkapan < 100 && (
                  <Link href="/profil" style={{
                    display: 'flex', alignItems: 'center', gap: 3, marginTop: 4,
                    fontSize: 11, color: '#3b82f6', textDecoration: 'none',
                  }}>
                    Lengkapi
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2-kolom: kiri (8) + kanan (4) ─────────────────────── */}
        <div className="ds-main-grid">

          {/* ── LEFT COLUMN ──────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

            {/* Baris 1: 4 stat cards */}
            <div className="ds-stat-grid-4">
              {[
                {
                  label: 'Jumlah Siswa', value: sekolah.jumlahSiswa, sub: 'Siswa aktif',
                  bg: '#eff6ff', color: '#3b82f6',
                  path: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
                },
                {
                  label: 'Jumlah Rombel', value: sekolah.jumlahRombel, sub: 'Rombel aktif',
                  bg: '#f5f3ff', color: '#8b5cf6',
                  path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                },
                {
                  label: 'Jabatan Guru', value: sekolah.guruJabatan.length, sub: 'Jabatan diinput',
                  bg: '#f0fdf4', color: '#22c55e',
                  path: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                },
                {
                  label: 'Guru ASN', value: totalASN, sub: `PNS: ${totalPNS} · PPPK: ${totalPPPK}`,
                  bg: '#fff7ed', color: '#f97316',
                  path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                },
              ].map((c, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon" style={{ background: c.bg }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={c.color} strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={c.path}/>
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{c.label}</p>
                    <p style={{ margin: '2px 0', fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{c.value}</p>
                    <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Baris 2: 4 stat cards kebutuhan */}
            <div className="ds-stat-grid-4">
              {[
                {
                  label: 'Kebutuhan Guru', value: totalKebutuhan, sub: 'Hasil perhitungan',
                  bg: '#eff6ff', color: '#3b82f6',
                  path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
                },
                {
                  label: 'Guru PNS', value: totalPNS, sub: 'ASN Tetap',
                  bg: '#eff6ff', color: '#3b82f6',
                  path: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0',
                },
                {
                  label: 'Guru PPPK', value: totalPPPK, sub: 'Pegawai Pemerintah',
                  bg: '#fff7ed', color: '#f97316',
                  path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
                },
                {
                  label: selisih < 0 ? 'Kekurangan' : selisih > 0 ? 'Kelebihan' : 'Status Pemenuhan',
                  value: selisih === 0 ? '✓' : Math.abs(selisih),
                  sub: selisih < 0 ? 'Guru masih kurang' : selisih > 0 ? 'Guru berlebih' : 'Kebutuhan terpenuhi',
                  bg: selisih < 0 ? '#fef2f2' : '#f0fdf4',
                  color: selisih < 0 ? '#ef4444' : '#22c55e',
                  path: selisih < 0
                    ? 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
                    : 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
                },
              ].map((c, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon" style={{ background: c.bg }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={c.color} strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={c.path}/>
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{c.label}</p>
                    <p style={{ margin: '2px 0', fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                      {c.value}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview ANJAB & ABK */}
            <div className="ds-card" style={{ overflow: 'hidden' }}>
              <div style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Preview ANJAB &amp; ABK</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Rekap ringkas yang akan dikirim ke Biro</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href="/laporan" className="ds-action-btn ds-btn-blue-outline">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    Laporan Lengkap
                  </Link>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                  <thead>
                    <tr>
                      <Th rowSpan={2}>No</Th>
                      <Th rowSpan={2} left>Nama Sekolah</Th>
                      <Th rowSpan={2}>Kebutuhan Guru</Th>
                      <Th colSpan={2}>Bezeting ASN</Th>
                      <Th rowSpan={2}>Total ASN</Th>
                      <Th colSpan={2}>Status</Th>
                    </tr>
                    <tr>
                      <Th>PNS</Th><Th>PPPK</Th>
                      <Th>▼ Kurang</Th><Th>▲ Lebih</Th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="ds-tr">
                      <Td>1</Td>
                      <Td left>{sekolah.nama}</Td>
                      <Td bold>{totalKebutuhan}</Td>
                      <Td>{totalPNS}</Td>
                      <Td>{totalPPPK}</Td>
                      <Td bold>{totalASN}</Td>
                      <Td red>{selisih < 0 ? Math.abs(selisih) : '—'}</Td>
                      <Td green>{selisih > 0 ? selisih : '—'}</Td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail per Jabatan */}
            <div className="ds-card" style={{ overflow: 'hidden' }}>
              <div style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Detail per Jabatan Guru</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>
                      Mapel: (Jam × Rombel) / 24 &nbsp;·&nbsp; BK: Siswa / 150
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 99, padding: '3px 10px', fontWeight: 500 }}>
                    {sekolah.guruJabatan.length} Jabatan
                  </span>
                  <Link href="/guru" className="ds-action-btn ds-btn-primary" style={{ padding: '5px 12px', fontSize: 11 }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                    </svg>
                    Tambah Data
                  </Link>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                  <thead>
                    <tr>
                      <Th>No</Th>
                      <Th left>Nama Jabatan Guru</Th>
                      <Th>Kebutuhan</Th>
                      <Th>PNS</Th>
                      <Th>PPPK</Th>
                      <Th>Total ASN</Th>
                      <Th>▼ Kurang</Th>
                      <Th>▲ Lebih</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {sekolah.guruJabatan.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#d1d5db', fontSize: 13 }}>
                          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#e5e7eb" strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          </svg>
                          <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#9ca3af' }}>Belum ada data jabatan guru</p>
                          <p style={{ margin: 0, fontSize: 11 }}>Klik tombol "Tambah Data" untuk mulai mengisi.</p>
                        </td>
                      </tr>
                    ) : sekolah.guruJabatan.map((g, i) => {
                      const asn = g.jumlahGuruPNS + g.jumlahGuruPPPK
                      const keb = Math.round(g.kebutuhanGuru)
                      const sel = asn - keb
                      return (
                        <tr key={g.id} className="ds-tr" style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <Td>{i + 1}</Td>
                          <Td left>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 500, color: '#111827' }}>
                              {g.namaJabatan}
                              {g.isBK && (
                                <span style={{ fontSize: 9, fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '2px 7px', borderRadius: 99, border: '1px solid #bfdbfe' }}>BK</span>
                              )}
                            </span>
                          </Td>
                          <Td bold>{keb}</Td>
                          <Td>{g.jumlahGuruPNS}</Td>
                          <Td>{g.jumlahGuruPPPK}</Td>
                          <Td bold>{asn}</Td>
                          <Td red>{sel < 0 ? Math.abs(sel) : ''}</Td>
                          <Td green>{sel > 0 ? sel : ''}</Td>
                        </tr>
                      )
                    })}
                  </tbody>
                  {sekolah.guruJabatan.length > 0 && (
                    <tfoot>
                      <tr style={{ background: '#1e3a8a', color: '#fff' }}>
                        <td colSpan={2} style={{ border: '1px solid #1d4ed8', padding: '9px 12px', fontSize: 11, fontWeight: 700, textAlign: 'left' }}>TOTAL KESELURUHAN</td>
                        <td style={{ border: '1px solid #1d4ed8', padding: '9px 12px', textAlign: 'center', fontWeight: 800, fontSize: 13 }}>{totalKebutuhan}</td>
                        <td style={{ border: '1px solid #1d4ed8', padding: '9px 12px', textAlign: 'center', fontWeight: 700 }}>{totalPNS}</td>
                        <td style={{ border: '1px solid #1d4ed8', padding: '9px 12px', textAlign: 'center', fontWeight: 700 }}>{totalPPPK}</td>
                        <td style={{ border: '1px solid #1d4ed8', padding: '9px 12px', textAlign: 'center', fontWeight: 800, fontSize: 13 }}>{totalASN}</td>
                        <td style={{ border: '1px solid #1d4ed8', padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#fca5a5' }}>
                          {selisih < 0 ? Math.abs(selisih) : '—'}
                        </td>
                        <td style={{ border: '1px solid #1d4ed8', padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#6ee7b7' }}>
                          {selisih > 0 ? selisih : '—'}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Rumus footer */}
              <div style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: '5px 18px' }}>
                {[
                  { label: 'Guru Mapel', formula: '(Jam Mengajar × Jumlah Rombel) / 24' },
                  { label: 'Guru BK',    formula: 'Jumlah Siswa / 150' },
                ].map(({ label, formula }) => (
                  <span key={label} style={{ fontSize: 11, color: '#6b7280' }}>
                    <strong style={{ fontWeight: 600, color: '#374151' }}>{label}:</strong>{' '}
                    <code style={{ fontFamily: 'monospace', fontSize: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '1px 6px', color: '#111827' }}>
                      {formula}
                    </code>
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingBottom: 8 }}>
              <Link href="/guru" className="ds-action-btn ds-btn-primary">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Input Data Guru
              </Link>
              <Link href="/profil" className="ds-action-btn ds-btn-outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit Profil Sekolah
              </Link>
              <Link href="/laporan" className="ds-action-btn ds-btn-blue-outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Kirim ke Biro
              </Link>
            </div>

          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

            {/* Pengumuman — versi lengkap, permanen di badan Dashboard
                (bukan cuma pop-up/banner yang bisa ditutup/hilang) */}
            {pengumumanList.length > 0 && (
              <div className="ds-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#d97706" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Pengumuman Biro</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {pengumumanList.map((p, i) => (
                    <div key={p.id} style={{ padding: '13px 16px', borderTop: i > 0 ? '1px solid #f6f6f6' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10.5, color: '#9ca3af' }}>
                          {p.tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {p.batasWaktu && (
                          <span style={{ fontSize: 10, fontWeight: 600, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: 99, padding: '1.5px 8px' }}>
                            Batas: {p.batasWaktu.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{p.judul}</p>
                      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#4b5563', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{p.isi}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ position: 'relative', width: 18, height: 18, flexShrink: 0 }}>
                          <Image src="/logo-ntt.png" alt="Logo NTT" fill className="object-contain" sizes="18px" />
                        </div>
                        <p style={{ margin: 0, fontSize: 10.5, color: '#9ca3af' }}>
                          Biro Organisasi — Bagian Kelembagaan dan Analisis Jabatan
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Data Card */}
            <div className="ds-card" style={{ padding: '14px 16px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#111827' }}>Status Pengiriman Data</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Data Sekolah',  done: !!sekolah.npsn && !!sekolah.kepalaSekolah },
                  { label: 'Data Guru',     done: sekolah.guruJabatan.length > 0 },
                  { label: 'Data Lengkap',  done: kelengkapan >= 80 },
                  { label: 'Dikirim ke Biro', done: ['DIKIRIM','DISETUJUI'].includes(sekolah.statusData) },
                  { label: 'Disetujui Biro',  done: sekolah.statusData === 'DISETUJUI' },
                ].map(({ label, done }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: done ? '#f0fdf4' : '#f9fafb',
                      border: `1.5px solid ${done ? '#86efac' : '#e5e7eb'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {done
                        ? <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db' }} />
                      }
                    </div>
                    <span style={{ fontSize: 12, color: done ? '#374151' : '#9ca3af', fontWeight: done ? 600 : 400 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistik Ringkas */}
            <div className="ds-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #f0f0f0' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Ringkasan Kebutuhan</p>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>Pemenuhan ASN</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      borderRadius: 99,
                      background: pct >= 100 ? '#22c55e' : pct >= 70 ? '#f97316' : '#3b82f6',
                    }} />
                  </div>
                </div>

                {[
                  { label: 'Total Kebutuhan', value: totalKebutuhan, color: '#1d4ed8' },
                  { label: 'Guru PNS',        value: totalPNS,       color: '#6b7280' },
                  { label: 'Guru PPPK',       value: totalPPPK,      color: '#6b7280' },
                  { label: selisih < 0 ? 'Kekurangan' : 'Kelebihan', value: Math.abs(selisih), color: selisih < 0 ? '#dc2626' : '#059669' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Panduan Cepat */}
            <div className="ds-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #f0f0f0' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Panduan Cepat</p>
              </div>
              <div style={{ padding: '6px 14px 10px' }}>
                {[
                  { href: '/profil', label: 'Cara Mengisi Data Sekolah',    path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { href: '/guru',   label: 'Cara Menambah Data Guru',       path: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
                  { href: '/guru',   label: 'Cara Mengisi ANJAB & ABK',      path: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                  { href: '/laporan',label: 'Cara Kirim Data ke Biro',        path: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
                ].map(({ href, label, path }) => (
                  <Link key={label} href={href} className="guide-item" style={{ textDecoration: 'none' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={path}/>
                    </svg>
                    <span style={{ flex: 1, fontSize: 12, color: '#374151' }}>{label}</span>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 10, color: '#d1d5db', paddingBottom: 8 }}>
          © 2025 Biro Organisasi — Bagian Kelembagaan dan Analisis Jabatan &nbsp;·&nbsp;
          <span style={{ color: '#22c55e' }}>● Sistem e-SIPKG</span>
        </p>

      </div>
    </>
  )
}