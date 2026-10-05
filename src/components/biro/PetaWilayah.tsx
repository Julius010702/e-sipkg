'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface WilayahPeta {
  id: string
  nama: string
  latitude: number
  longitude: number
  jumlahSekolah: number
  kebutuhan: number
  totalASN: number
  kurang: number
  lebih: number
}

// Titik bulat berwarna sebagai marker — dibuat lewat divIcon (HTML murni)
// supaya tidak bergantung pada file ikon default Leaflet yang sering
// bermasalah kalau di-bundle lewat Next.js/webpack.
function buatIkon(warna: string, jumlahSekolah: number) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="width:26px;height:26px;border-radius:50%;background:${warna};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10.5px;font-weight:800;">
          ${jumlahSekolah}
        </div>
        ${jumlahSekolah > 0 ? `<div style="position:absolute;inset:0;border-radius:50%;background:${warna};opacity:.35;animation:pulseMarker 2s ease-out infinite;"></div>` : ''}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  })
}

function warnaStatus(w: WilayahPeta): string {
  if (w.jumlahSekolah === 0) return '#9ca3af'   // abu — belum ada sekolah terdata
  if (w.kurang > 0) return '#dc2626'            // merah — kekurangan guru
  return '#16a34a'                              // hijau — aman/lebih
}

export default function PetaWilayah() {
  const [data, setData]   = useState<WilayahPeta[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  function load() {
    fetch('/api/wilayah/peta', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => {
        setData(Array.isArray(d.data) ? d.data : [])
        setLastUpdate(new Date())
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 20000) // real-time — refresh tiap 20 detik
    return () => clearInterval(id)
  }, [])

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <style>{`
        @keyframes pulseMarker { 0% { transform: scale(1); opacity: .35; } 100% { transform: scale(2.4); opacity: 0; } }
        .leaflet-popup-content-wrapper { border-radius: 10px; }
      `}</style>
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Peta Sebaran Wilayah</h3>
          <p className="text-xs text-gray-400 mt-0.5">Titik otomatis per kabupaten/kota, data diperbarui berkala</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {lastUpdate ? `Live · update ${lastUpdate.toLocaleTimeString('id-ID')}` : 'Memuat...'}
        </div>
      </div>

      <div style={{ height: 420, width: '100%' }} className="relative">
        {loading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/70">
            <p className="text-sm text-gray-400">Memuat peta...</p>
          </div>
        )}
        <MapContainer
          center={[-9.1, 121.8]}
          zoom={7}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map(w => (
            <Marker key={w.id} position={[w.latitude, w.longitude]} icon={buatIkon(warnaStatus(w), w.jumlahSekolah)}>
              <Popup>
                <div style={{ minWidth: 150 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{w.nama}</p>
                  <p style={{ fontSize: 12, color: '#4b5563', margin: '2px 0' }}>Sekolah terdata: <strong>{w.jumlahSekolah}</strong></p>
                  <p style={{ fontSize: 12, color: '#4b5563', margin: '2px 0' }}>Kebutuhan guru: <strong>{w.kebutuhan}</strong></p>
                  <p style={{ fontSize: 12, color: '#4b5563', margin: '2px 0' }}>Total ASN: <strong>{w.totalASN}</strong></p>
                  {w.kurang > 0 && <p style={{ fontSize: 12, color: '#dc2626', margin: '2px 0' }}>Kurang: <strong>{w.kurang}</strong></p>}
                  {w.lebih > 0 && <p style={{ fontSize: 12, color: '#16a34a', margin: '2px 0' }}>Lebih: <strong>{w.lebih}</strong></p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Kekurangan guru</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" /> Aman / lebih</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" /> Belum ada data sekolah</span>
      </div>
    </div>
  )
}
