'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface PengumumanNotif {
  id: string
  judul: string
  pesan: string
  createdAt: string
}

// Muncul otomatis begitu Dashboard Sekolah dibuka kalau ada pengumuman
// yang belum dibaca — supaya tidak bergantung pada orang mau klik lonceng
// notifikasi (yang sering kelewat/diabaikan). Sekaligus tampilkan sebagai
// banner berjalan (marquee) di bagian atas Dashboard, tetap terlihat
// setelah pop-up ditutup, sampai pengumumannya ditandai dibaca.
export default function PengumumanPopup() {
  const [antrian, setAntrian] = useState<PengumumanNotif[]>([])
  const [tampilPopup, setTampilPopup] = useState(true)

  const load = useCallback(() => {
    fetch('/api/notifications', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data : []
        const belumDibaca = list.filter((n: any) => !n.isRead && n.judul?.startsWith('Pengumuman:'))
        setAntrian(belumDibaca)
      })
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  async function tandaiDibaca(id: string) {
    setAntrian(prev => prev.filter(n => n.id !== id))
    setTampilPopup(true) // biar pop-up berikutnya (kalau masih ada antrian) langsung tampil lagi
    fetch(`/api/notifications/${id}`, { method: 'PATCH', credentials: 'same-origin' }).catch(() => {})
  }

  const aktif = antrian[0]

  return (
    <>
      <style>{`
        @keyframes pengumuman-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes pengumuman-pop-in {
          from { opacity: 0; transform: translateY(10px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ── Banner berjalan (marquee) ── */}
      {antrian.length > 0 && (
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 10, marginBottom: 16,
          display: 'flex', alignItems: 'center', height: 42,
          background: 'linear-gradient(90deg,#0a1f4e,#1558c0)',
          boxShadow: '0 2px 10px rgba(10,31,78,0.18)',
        }}>
          <div style={{
            flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 14px', background: 'rgba(212,160,23,0.16)', borderRight: '1px solid rgba(212,160,23,0.35)',
            color: '#f0c84a', fontSize: 10.5, fontWeight: 700,
            letterSpacing: 0.6, textTransform: 'uppercase', zIndex: 2, whiteSpace: 'nowrap',
          }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Pengumuman Biro
          </div>
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%' }}>
            <div
              onClick={() => setTampilPopup(true)}
              style={{
                position: 'absolute', whiteSpace: 'nowrap', top: 0, height: '100%',
                display: 'flex', alignItems: 'center', gap: 52,
                animation: `pengumuman-marquee ${Math.max(antrian.length * 9, 14)}s linear infinite`,
                cursor: 'pointer', fontSize: 12.5, color: 'rgba(255,255,255,0.92)', fontWeight: 500,
                paddingLeft: 14,
              }}
            >
              {[...antrian, ...antrian].map((n, i) => (
                <span key={`${n.id}-${i}`}>
                  <strong style={{ color: '#f0c84a', fontWeight: 700 }}>{n.judul.replace(/^Pengumuman:\s*/, '')}</strong>
                  {'  —  '}
                  {n.pesan.replace(/\n+/g, '  •  ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Pop-up otomatis ── */}
      {aktif && tampilPopup && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ background: 'rgba(4,10,28,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setTampilPopup(false)}
        >
          <div
            style={{
              width: '100%', maxWidth: 440, borderRadius: 18, overflow: 'hidden',
              background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
              animation: 'pengumuman-pop-in .22s cubic-bezier(.2,.9,.3,1)',
              border: '1px solid rgba(212,160,23,0.25)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header navy + garis emas */}
            <div style={{
              position: 'relative', padding: '22px 22px 18px',
              background: 'linear-gradient(135deg,#071530 0%,#0a1f4e 55%,#1558c0 100%)',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#d4a017,#f0c84a,#d4a017)' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(212,160,23,0.18)', border: '1px solid rgba(212,160,23,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="#f0c84a" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#f0c84a' }}>
                    Pengumuman Resmi
                  </p>
                  <h3 style={{ margin: '3px 0 0', fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
                    {aktif.judul.replace(/^Pengumuman:\s*/, '')}
                  </h3>
                </div>
                <button
                  onClick={() => setTampilPopup(false)}
                  aria-label="Tutup"
                  style={{
                    flexShrink: 0, width: 26, height: 26, borderRadius: 8,
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
                  }}
                >
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Isi pesan */}
            <div style={{ padding: '20px 22px', maxHeight: '42vh', overflowY: 'auto' }}>
              <p style={{ margin: 0, fontSize: 13.5, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {aktif.pesan}
              </p>
            </div>

            {/* Footer resmi — logo + unit pengirim */}
            <div style={{
              margin: '0 22px', paddingTop: 14, paddingBottom: 16,
              borderTop: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: 11,
            }}>
              <div style={{ position: 'relative', width: 30, height: 30, flexShrink: 0 }}>
                <Image src="/logo-ntt.png" alt="Logo NTT" fill className="object-contain" sizes="30px" />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: '#1e293b', lineHeight: 1.35 }}>
                  Biro Organisasi — Bagian Kelembagaan dan Analisis Jabatan
                </p>
                <p style={{ margin: 0, fontSize: 10.5, color: '#94a3b8', lineHeight: 1.35 }}>
                  Sekretariat Daerah Provinsi Nusa Tenggara Timur
                </p>
              </div>
            </div>

            {/* Tombol aksi */}
            <div style={{ padding: '0 22px 22px', display: 'flex', gap: 10 }}>
              <button
                onClick={() => tandaiDibaca(aktif.id)}
                style={{
                  flex: 1, borderRadius: 11, padding: '11px 16px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#071530,#1558c0)',
                  color: '#fff', fontSize: 13.5, fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(10,31,78,0.28)',
                }}
              >
                Sudah Dibaca{antrian.length > 1 ? ` (1/${antrian.length})` : ''}
              </button>
              <button
                onClick={() => setTampilPopup(false)}
                style={{
                  borderRadius: 11, padding: '11px 18px', cursor: 'pointer',
                  background: '#fff', border: '1px solid #e2e8f0', color: '#475569',
                  fontSize: 13.5, fontWeight: 600,
                }}
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}