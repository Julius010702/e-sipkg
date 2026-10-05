import { prisma } from '@/lib/prisma'

function waktuRelatif(d: Date): string {
  const detik = Math.floor((Date.now() - d.getTime()) / 1000)
  if (detik < 60) return 'Baru saja'
  const menit = Math.floor(detik / 60)
  if (menit < 60) return `${menit} menit lalu`
  const jam = Math.floor(menit / 60)
  if (jam < 24) return `${jam} jam lalu`
  const hari = Math.floor(jam / 24)
  if (hari < 7) return `${hari} hari lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminDashboardPage() {
  const [
    userCount, sekolahRole, wilayahRole, biroRole, adminRole,
    aktivitasTerbaru,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'SEKOLAH' } }),
    prisma.user.count({ where: { role: 'WILAYAH' } }),
    prisma.user.count({ where: { role: 'BIRO'    } }),
    prisma.user.count({ where: { role: 'ADMIN'   } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ])

  const roleData = [
    { label: 'Sekolah',        value: sekolahRole, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Wilayah',        value: wilayahRole, color: '#0D9488', bg: '#F0FDFA' },
    { label: 'Biro Organisasi',value: biroRole,    color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Administrator',  value: adminRole,   color: '#EA580C', bg: '#FFF7ED' },
  ]

  const roleTotal = roleData.reduce((s, r) => s + r.value, 0) || 1

  const hariIni = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .adm2 * { font-family:'Plus Jakarta Sans',system-ui,sans-serif; box-sizing:border-box; }
        .adm2 a { text-decoration:none; }
        .adm2-card { transition:box-shadow 0.15s,transform 0.15s; }
        .adm2-card:hover { box-shadow:0 8px 24px rgba(15,23,42,0.08); }
        .adm2-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:16px; }
        .adm2-row2 { display:block; margin-bottom:16px; }
        .adm2-row3 { display:block; }
        @media (max-width: 900px) {
          .adm2-stats { grid-template-columns:repeat(2,1fr); }
        }
      ` }} />

      <div className="adm2" style={{ width: '100%', maxWidth: 1100, margin: '0 auto', paddingBottom: 32 }}>

        {/* Breadcrumb + tanggal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#94a3b8', textTransform: 'uppercase' }}>Dashboard</p>
          <p style={{ margin: 0, fontSize: 12.5, color: '#94a3b8' }}>{hariIni}</p>
        </div>

        {/* Judul + kutipan */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>Dashboard</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Ringkasan informasi sistem e-SIPKG Provinsi Nusa Tenggara Timur</p>
          </div>
          <div style={{ textAlign: 'right', maxWidth: 280 }}>
            <p style={{ margin: 0, fontSize: 12.5, fontStyle: 'italic', color: '#475569', lineHeight: 1.5 }}>
              &ldquo;Bersama Mewujudkan Pendidikan NTT yang Lebih Baik&rdquo;
            </p>
            <span style={{ display: 'inline-block', marginTop: 6, width: 40, height: 3, background: '#2563EB', borderRadius: 2 }} />
          </div>
        </div>

        {/* 4 Stat cards dengan progress bar */}
        <div className="adm2-stats">
          {roleData.map(r => {
            const pct = roleTotal > 0 ? Math.round((r.value / roleTotal) * 100) : 0
            return (
              <div key={r.label} className="adm2-card" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: '18px 18px', borderLeft: `4px solid ${r.color}` }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>{r.label}</p>
                <p style={{ margin: '10px 0 8px', fontSize: 30, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{r.value}</p>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: r.color, borderRadius: 99 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Dari total {userCount} akun</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: r.color }}>{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Distribusi Peran — diagram batang, tampilan terang */}
        <div className="adm2-row2">
          <div className="adm2-card" style={{
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 20,
            padding: '22px 24px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: '#111827', textTransform: 'uppercase' }}>Distribusi Peran</p>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#9ca3af' }}>{userCount} akun</span>
            </div>

            {(() => {
              const barColors = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444']
              const maxVal   = Math.max(...roleData.map(r => r.value), 0)
              const scaleMax = Math.max(4, Math.ceil((maxVal || 1) / 4) * 4)
              const gridSteps = [0, 1, 2, 3, 4]

              return (
                <>
                  <div style={{ position: 'relative', height: 200 }}>
                    {gridSteps.map(i => {
                      const val = Math.round((scaleMax * i) / 4)
                      return (
                        <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: `${(i / 4) * 100}%`, display: 'flex', alignItems: 'center' }}>
                          <span style={{ width: 26, fontSize: 10, color: '#9ca3af', textAlign: 'right', marginRight: 10, flexShrink: 0 }}>{val}</span>
                          <div style={{ flex: 1, borderTop: '1px dashed #E5E7EB' }} />
                        </div>
                      )
                    })}
                    <div style={{ position: 'absolute', left: 36, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 22 }}>
                      {roleData.map((r, i) => {
                        const heightPct = scaleMax > 0 ? (r.value / scaleMax) * 100 : 0
                        return (
                          <div key={r.label} style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <span style={{ position: 'absolute', bottom: `calc(${heightPct}% + 8px)`, fontSize: 12, fontWeight: 800, color: '#111827' }}>{r.value}</span>
                            <div style={{
                              width: '100%', maxWidth: 52, height: `${heightPct}%`, minHeight: r.value > 0 ? 4 : 0,
                              background: barColors[i % barColors.length], borderRadius: '6px 6px 2px 2px',
                              boxShadow: `0 4px 10px ${barColors[i % barColors.length]}55`,
                              transition: 'height 0.8s ease',
                            }} />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 22, marginLeft: 36, marginTop: 10 }}>
                    {roleData.map(r => (
                      <div key={r.label} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <span style={{
                          display: 'inline-block', transform: 'rotate(-20deg)', transformOrigin: 'top left',
                          whiteSpace: 'nowrap', fontSize: 11, color: '#64748b', fontWeight: 600,
                        }}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="adm2-row3">
          <div className="adm2-card" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 18, padding: '20px 20px' }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Aktivitas Terbaru</p>
            {aktivitasTerbaru.length === 0 ? (
              <p style={{ fontSize: 12.5, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>Belum ada aktivitas tercatat</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ textAlign: 'left', padding: '0 0 10px', fontWeight: 600, color: '#94a3b8', fontSize: 11 }}>Tanggal</th>
                      <th style={{ textAlign: 'left', padding: '0 0 10px', fontWeight: 600, color: '#94a3b8', fontSize: 11 }}>Pengguna</th>
                      <th style={{ textAlign: 'left', padding: '0 0 10px', fontWeight: 600, color: '#94a3b8', fontSize: 11 }}>Aktivitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aktivitasTerbaru.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        <td style={{ padding: '10px 8px 10px 0', color: '#94a3b8', whiteSpace: 'nowrap' }}>{waktuRelatif(a.createdAt)}</td>
                        <td style={{ padding: '10px 8px', color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>{a.namaUser}</td>
                        <td style={{ padding: '10px 0', color: '#64748b' }}>{a.aksi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  )
}