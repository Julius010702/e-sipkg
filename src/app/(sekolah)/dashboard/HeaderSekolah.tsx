'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NotifBell from '@/components/layout/NotifBell'

interface Periode {
  id: string
  nama: string
  tahunAjaran: string
  semester: number
  tanggalMulai: string
  tanggalAkhir: string
  isAktif: boolean
}

interface Notif {
  id: string
  type: 'ditolak' | 'belum-lengkap' | 'periode-berakhir' | 'disetujui'
  title: string
  desc: string
  href?: string
}

export default function HeaderSekolah({
  periodeAktif,
  notifs,
}: {
  periodeAktif: Periode | null
  notifs: Notif[]
}) {
  const [openPeriode, setOpenPeriode] = useState(false)
  const periodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (periodeRef.current && !periodeRef.current.contains(e.target as Node)) setOpenPeriode(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

      <style dangerouslySetInnerHTML={{ __html: `
        .hs-dropdown {
          position: absolute; right: 0; margin-top: 8px;
          border-radius: 12px; border: 1px solid #e5e7eb; background: #fff;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08); overflow: hidden; z-index: 30;
        }
        .hs-dropdown-periode { width: 260px; }
        @media (max-width: 480px) {
          .hs-dropdown-periode {
            position: fixed;
            left: 12px; right: 12px; width: auto;
            top: 64px;
          }
        }
      ` }} />

      {/* Dropdown Periode Laporan */}
      <div style={{ position: 'relative' }} ref={periodeRef}>
        <button
          onClick={() => setOpenPeriode(o => !o)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff',
            padding: '8px 14px', fontSize: 13, fontWeight: 500, color: '#374151',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {periodeAktif
            ? `${periodeAktif.tahunAjaran} · ${periodeAktif.semester === 1 ? 'Ganjil' : 'Genap'}`
            : 'Belum ada periode aktif'}
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}
            style={{ transform: openPeriode ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openPeriode && (
          <div className="hs-dropdown hs-dropdown-periode">
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Periode Laporan Aktif</p>
            </div>
            {periodeAktif ? (
              <div style={{ padding: '12px 14px' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>{periodeAktif.nama}</p>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>
                  {new Date(periodeAktif.tanggalMulai).toLocaleDateString('id-ID')} – {new Date(periodeAktif.tanggalAkhir).toLocaleDateString('id-ID')}
                </p>
                <span style={{
                  display: 'inline-block', marginTop: 8, fontSize: 10, fontWeight: 600,
                  background: '#f0fdf4', color: '#059669', padding: '3px 9px', borderRadius: 99,
                  border: '1px solid #a7f3d0',
                }}>
                  Sedang berjalan
                </span>
              </div>
            ) : (
              <p style={{ padding: '16px 14px', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
                Biro belum mengaktifkan periode laporan
              </p>
            )}
          </div>
        )}
      </div>

      {/* Notifikasi — gabungan: pengingat lokal (data belum lengkap, dsb)
          + notifikasi asli dari Biro (persetujuan, penolakan, dll) */}
      <NotifBell
        extraItems={notifs.map(n => ({ id: n.id, judul: n.title, pesan: n.desc, link: n.href }))}
      />
    </div>
  )
}